// POST /api/auth/logout — يمسح جلسة المستخدم.
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  clearSession();
  return NextResponse.json({ ok: true });
}
