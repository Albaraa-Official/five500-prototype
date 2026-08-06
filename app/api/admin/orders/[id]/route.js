// PATCH /api/admin/orders/[id] — تغيير حالة الطلب وفق آلة الحالة (محمية).
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { canTransition, KITCHEN_STATUSES } from "@/lib/orderStatus";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const to = body?.status;
  if (!KITCHEN_STATUSES.includes(to)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { status: true } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (!canTransition(order.status, to)) {
    return NextResponse.json(
      { error: "invalid_transition", from: order.status, to },
      { status: 409 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: to },
    select: { id: true, status: true },
  });
  return NextResponse.json({ ok: true, order: updated });
}
