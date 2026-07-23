// GET /api/orders/mine — طلبات المستخدم المسجّل دخوله.
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      shortId: `F500-${o.id.slice(-6).toUpperCase()}`,
      status: o.status,
      totalHalalas: o.totalHalalas,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({ name: i.product.name, size: i.size, qty: i.qty })),
    })),
  });
}
