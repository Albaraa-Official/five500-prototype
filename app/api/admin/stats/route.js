// GET /api/admin/stats — إحصائيات المبيعات: اليوم، آخر 7 أيام، آخر 30 يوم، أفضل المنتجات.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["paid", "preparing", "ready", "completed"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const d7 = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [todayOrders, last7Orders, last30Orders, totalCustomers, pendingCount] = await Promise.all([
    prisma.order.findMany({ where: { status: { in: PAID_STATUSES }, createdAt: { gte: todayStart } }, select: { totalHalalas: true } }),
    prisma.order.findMany({ where: { status: { in: PAID_STATUSES }, createdAt: { gte: d7 } }, select: { totalHalalas: true } }),
    prisma.order.findMany({ where: { status: { in: PAID_STATUSES }, createdAt: { gte: d30 } }, select: { totalHalalas: true } }),
    prisma.user.count(),
    prisma.order.count({ where: { status: { in: ["paid", "preparing"] } } }),
  ]);

  const sum = (arr) => arr.reduce((s, o) => s + o.totalHalalas, 0);

  const topItemsRaw = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: PAID_STATUSES }, createdAt: { gte: d30 } } },
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 5,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: topItemsRaw.map((t) => t.productId) } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(products.map((p) => [p.id, p.name]));
  const topProducts = topItemsRaw.map((t) => ({ productId: t.productId, name: nameMap.get(t.productId) || t.productId, qty: t._sum.qty || 0 }));

  return NextResponse.json({
    today: { count: todayOrders.length, totalHalalas: sum(todayOrders) },
    last7Days: { count: last7Orders.length, totalHalalas: sum(last7Orders) },
    last30Days: { count: last30Orders.length, totalHalalas: sum(last30Orders) },
    totalCustomers,
    pendingCount,
    topProducts,
  });
}
