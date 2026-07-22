// POST /api/payments/webhook — نقطة استقبال تأكيد Moyasar. تحقق التوقيع ثم التسوية.
// هذا المسار (لا رد المتصفح) هو ما يحوّل الطلب إلى paid.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { settlePayment } from "@/lib/payment";

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

  // نتوقع { paymentId, providerRef, status: "paid"|"failed" } (نطبّع حسب شكل Moyasar لاحقاً)
  const paymentId = evt.paymentId || evt.metadata?.paymentId;
  const status = evt.status === "paid" || evt.type === "payment_paid" ? "paid" : "failed";
  if (!paymentId) return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });

  const result = await settlePayment(paymentId, evt.providerRef || evt.id || null, status);
  return NextResponse.json(result);
}
