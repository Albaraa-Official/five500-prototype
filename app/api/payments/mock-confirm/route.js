// POST /api/payments/mock-confirm — بديل بوابة الدفع أثناء التطوير فقط.
// يحاكي عودة Moyasar عبر نفس منطق التسوية. معطّل في الإنتاج.
import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/payment";

export async function POST(req) {
  if (process.env.NODE_ENV === "production" || process.env.MOYASAR_SECRET_KEY) {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { paymentId, outcome } = body || {};
  if (!paymentId) return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });

  const result = await settlePayment(
    paymentId,
    `mock_${paymentId}`,
    outcome === "fail" ? "failed" : "paid"
  );
  return NextResponse.json(result);
}
