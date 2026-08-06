// يُشغَّل بعد تأكيد نجاح الدفع فقط — يرسل الطلب لكل أنظمة الـ POS المفعَّلة والمُهيَّأة.
// أي فشل هنا لا يجب أن يؤثر على حالة الطلب/الدفع نفسها (مُعزول تماماً).
import { prisma } from "@/lib/prisma";
import { listPosIntegrations } from "@/lib/integrations/registry";
import { getIntegrationSetting, recordIntegrationStatus, logIntegrationAttempt } from "@/lib/integrations/settings";
import { withRetry } from "@/lib/integrations/retry";

async function loadFullOrder(orderId) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { include: { prices: true } } } },
    },
  });
}

export async function notifyPosIntegrations(orderId) {
  const posIntegrations = listPosIntegrations();
  if (posIntegrations.length === 0) return;

  let order = null;

  for (const integration of posIntegrations) {
    const setting = await getIntegrationSetting(integration.key);
    if (!setting.enabled) continue;

    if (!integration.isConfigured()) {
      console.warn(`تكامل ${integration.key} مفعَّل لكن الأسرار غير مضبوطة في env — تم التخطي.`);
      await recordIntegrationStatus(integration.key, { status: "error", lastError: "الأسرار غير مضبوطة (env)" });
      continue;
    }

    if (!order) order = await loadFullOrder(orderId);
    if (!order) return; // الطلب غير موجود — لا شيء نفعله

    let attempts = 0;
    try {
      await withRetry(async (attempt) => {
        attempts = attempt;
        await integration.pushOrder(order, setting.config || {});
      }, { attempts: 3, baseDelayMs: 800 });

      await recordIntegrationStatus(integration.key, { status: "connected", lastError: null });
      await logIntegrationAttempt({ integration: integration.key, orderId, status: "success", attempts });
    } catch (err) {
      console.error(`فشل إرسال الطلب ${orderId} إلى ${integration.key} بعد ${attempts} محاولة:`, err);
      await recordIntegrationStatus(integration.key, { status: "error", lastError: err.message });
      await logIntegrationAttempt({ integration: integration.key, orderId, status: "failed", attempts, message: err.message });
    }
  }
}
