// POST /api/payments/webhook — نقطة استقبال تأكيد Moyasar. تحقق التوقيع ثم التسوية.
// هذا المسار (لا رد المتصفح) هو ما يحوّل الطلب إلى paid.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { settlePayment } from "@/lib/payment";
import { isMoyasarEnabled, fetchMoyasarPayment } from "@/lib/moyasar";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const raw = await req.text();
  const secret = process.env.MOYASAR_WEBHOOK_SECRET;

  // تحقق التوقيع (إلزامي في الإنتاج). Moyasar يرسل التوقيع في رأس مخصّص.
  if (secret) {
    const sig = req.headers.get("x-moyasar-signature") || "";
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  let evt;
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // معرّف دفعتنا الداخلي يُمرّر في metadata عند إنشاء الدفعة لدى Moyasar
  const paymentId = evt.paymentId || evt.data?.metadata?.paymentId || evt.metadata?.paymentId;
  if (!paymentId) return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });

  let status = evt.status === "paid" || evt.type === "payment_paid" ? "paid" : "failed";
  let providerRef = evt.providerRef || evt.data?.id || evt.id || null;

  // دفاع في العمق: عند تفعيل Moyasar نتحقق من الدفعة عبر API ونطابق المبلغ
  // بدل الاكتفاء بحمولة الـwebhook (التي قد تُزوّر لو تسرّب السر).
  if (isMoyasarEnabled() && providerRef) {
    try {
      const verified = await fetchMoyasarPayment(providerRef);
      const ourPayment = await prisma.payment.findUnique({ where: { id: paymentId }, select: { amountHalalas: true } });
      const amountOk = ourPayment && verified.amountHalalas === ourPayment.amountHalalas;
      status = verified.status === "paid" && amountOk ? "paid" : "failed";
    } catch (e) {
      console.error("Moyasar verify فشل:", e);
      return NextResponse.json({ error: "verify_failed" }, { status: 502 });
    }
  }

  const result = await settlePayment(paymentId, providerRef, status);
  return NextResponse.json(result);
}
