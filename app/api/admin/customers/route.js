// GET /api/admin/customers — قائمة العملاء مع عدد ومجموع طلباتهم.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      orders: {
        where: { status: { in: ["paid", "preparing", "ready", "completed"] } },
        select: { totalHalalas: true },
      },
    },
  });

  const customers = users.map((u) => ({
    id: u.id,
    phoneE164: u.phoneE164,
    name: u.name,
    createdAt: u.createdAt,
    ordersCount: u.orders.length,
    totalSpentHalalas: u.orders.reduce((s, o) => s + o.totalHalalas, 0),
  }));

  return NextResponse.json({ customers });
}
