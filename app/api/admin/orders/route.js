// GET /api/admin/orders — قائمة الطلبات للمطبخ (محمية). فلترة اختيارية بالحالة.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { KITCHEN_STATUSES } from "@/lib/orderStatus";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && KITCHEN_STATUSES.includes(status) ? { status } : { status: { in: KITCHEN_STATUSES } };

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      shortId: `F500-${o.id.slice(-6).toUpperCase()}`,
      status: o.status,
      totalHalalas: o.totalHalalas,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      plate: o.plate,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({ name: i.product.name, size: i.size, qty: i.qty })),
    })),
  });
}
