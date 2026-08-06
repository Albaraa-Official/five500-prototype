// منطق تسوية الدفع — المصدر الوحيد للحقيقة. يُستدعى من webhook (حقيقي) أو mock-confirm (تطوير).
// idempotent: تكرار النداء بنفس النتيجة لا يغيّر شيئاً.
import { prisma } from "@/lib/prisma";
import { notifyPosIntegrations } from "@/lib/integrations/dispatch";

// paymentRef: مرجع المزود. result: "paid" | "failed".
export async function settlePayment(paymentId, providerRef, result) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment) return { ok: false, reason: "payment_not_found" };

  // idempotency: إن كان محسوماً مسبقاً لا نكرّر
  if (payment.status !== "initiated") {
    return { ok: true, alreadySettled: true, status: payment.status };
  }

  if (result === "paid") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "paid", providerRef },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        // ننتقل إلى paid ثم preparing (المطبخ يبدأ). التحوّل الوحيد المسموح من pending_payment.
        data: { status: "paid" },
      }),
    ]);

    // إشعار أنظمة الـ POS الخارجية (Loyverse وغيرها) — بعد تأكيد الدفع فقط، ومعزول تماماً
    // عن نجاح الدفع نفسه (نُكمل الاستجابة حتى لو فشل الإرسال). نُنظره (لا fire-and-forget)
    // لأن دوال serverless قد تُنهى فور إرجاع الاستجابة، فتُفقد أي عمل خلفي غير مُنتظَر.
    try {
      await notifyPosIntegrations(payment.orderId);
    } catch (err) {
      console.error("notifyPosIntegrations فشل بشكل غير متوقع:", err);
    }

    return { ok: true, status: "paid" };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "failed", providerRef } }),
    prisma.order.update({ where: { id: payment.orderId }, data: { status: "payment_failed" } }),
  ]);
  return { ok: true, status: "failed" };
}
