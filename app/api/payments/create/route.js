// POST /api/payments/create — ينشئ سجل دفع بمبلغ الطلب (من السيرفر) ويعيد معرّفه.
// في وضع mock يعيد مسار تأكيد داخلي؛ مع Moyasar الحقيقي يعيد رابط/توكن الاستضافة.
import { NextResponse } from "next/server";
import { createPaymentSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payment: true },
  });
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  if (order.status !== "pending_payment") {
    return NextResponse.json({ error: "order_not_payable", status: order.status }, { status: 409 });
  }

  // أعد استخدام سجل الدفع إن وُجد وما زال initiated
  let payment = order.payment;
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: process.env.MOYASAR_SECRET_KEY ? "moyasar" : "mock",
        amountHalalas: order.totalHalalas, // المبلغ من السيرفر — لا من العميل
        status: "initiated",
      },
    });
  }

  const useMock = !process.env.MOYASAR_SECRET_KEY;
  return NextResponse.json({
    paymentId: payment.id,
    amountHalalas: payment.amountHalalas,
    mode: useMock ? "mock" : "moyasar",
    // في mock: الواجهة تستدعي mock-confirm. في الإنتاج: publishableKey لواجهة Moyasar.
    publishableKey: useMock ? null : process.env.MOYASAR_PUBLISHABLE_KEY,
  });
}
