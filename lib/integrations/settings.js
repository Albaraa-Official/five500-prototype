// طبقة وصول موحّدة لإعدادات التكاملات غير الحساسة (DB) — الأسرار تبقى في env دائماً.
import { prisma } from "@/lib/prisma";

export async function getIntegrationSetting(key) {
  const row = await prisma.integrationSetting.findUnique({ where: { key } });
  return row || { key, enabled: false, config: {}, status: "unknown", lastError: null, lastCheckedAt: null };
}

export async function upsertIntegrationSetting(key, data) {
  return prisma.integrationSetting.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });
}

export async function recordIntegrationStatus(key, { status, lastError = null }) {
  return upsertIntegrationSetting(key, { status, lastError, lastCheckedAt: new Date() });
}

export async function logIntegrationAttempt({ integration, orderId, status, attempts, message }) {
  try {
    await prisma.integrationLog.create({
      data: { integration, orderId: orderId || null, status, attempts: attempts || 1, message: message || null },
    });
  } catch (err) {
    // السجل ثانوي — لا نفشل الطلب الأساسي بسببه.
    console.error("تعذّر كتابة سجل التكامل:", err);
  }
}
