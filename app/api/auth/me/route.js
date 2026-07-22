// GET /api/auth/me — يعيد المستخدم الحالي أو null. POST /logout يمسح الجلسة.
import { NextResponse } from "next/server";
import { getSessionUserId, clearSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phoneE164: true, _count: { select: { orders: true } } },
  });
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: user.id, name: user.name, phone: user.phoneE164, orders: user._count.orders },
  });
}
