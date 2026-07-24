// POST /api/orders — ينشئ طلباً. السعر/الضريبة/الإجمالي تُحسب في السيرفر فقط.
import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation";
import { normalizeSaudiPhone } from "@/lib/phone";
import { priceOrder } from "@/lib/pricing";
import { getSessionUserId } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

const DEFAULT_BRANCH = "main";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const phone = normalizeSaudiPhone(parsed.data.customerPhone);
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  // حد المعدّل لمنع إنشاء طلبات بكثرة
  const rl = await rateLimit(`order:${phone}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let priced;
  try {
    priced = await priceOrder(parsed.data.items, parsed.data.discountCode || null);
  } catch (err) {
    if (err.code === "INVALID_ITEM") {
      return NextResponse.json({ error: "invalid_item", message: err.message }, { status: 400 });
    }
    console.error("pricing failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const userId = getSessionUserId();

  try {
    const order = await prisma.$transaction(async (tx) => {
      // زيادة ذرية لعداد الخصم — يمنع Race Condition على maxUses
      if (priced.discountCode) {
        const dc = await tx.discountCode.findUnique({
          where: { code: priced.discountCode },
          select: { active: true, maxUses: true, uses: true, expiresAt: true },
        });
        if (!dc || !dc.active || (dc.expiresAt && dc.expiresAt < new Date()) ||
            (dc.maxUses != null && dc.uses >= dc.maxUses)) {
          const err = new Error("كود الخصم استُنفد أو انتهت صلاحيته");
          err.code = "DISCOUNT_EXHAUSTED";
          throw err;
        }
        await tx.discountCode.update({
          where: { code: priced.discountCode },
          data: { uses: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          userId: userId || null,
          branchId: DEFAULT_BRANCH,
          status: "pending_payment",
          subtotalHalalas: priced.subtotalHalalas,
          discountHalalas: priced.discountHalalas,
          discountCode: priced.discountCode,
          vatHalalas: priced.vatHalalas,
          totalHalalas: priced.totalHalalas,
          customerName: parsed.data.customerName,
          customerPhone: phone,
          plate: parsed.data.plate || null,
          orderType: parsed.data.orderType || "pickup",
          notes: parsed.data.notes || null,
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              size: l.size,
              qty: l.qty,
              unitPriceHalalas: l.unitPriceHalalas,
            })),
          },
        },
        select: { id: true, totalHalalas: true, status: true },
      });
    });

    return NextResponse.json({
      orderId: order.id,
      totalHalalas: order.totalHalalas,
      status: order.status,
    });
  } catch (err) {
    if (err.code === "DISCOUNT_EXHAUSTED") {
      return NextResponse.json({ error: "discount_exhausted" }, { status: 409 });
    }
    console.error("create order failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
