// POST /api/admin/login — دخول الإدارة بكلمة مرور. GET يعيد حالة الجلسة.
import { NextResponse } from "next/server";
import { checkPasscode, setAdminSession, isAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  return NextResponse.json({ admin: isAdmin() });
}

export async function POST(req) {
  // حد محاولات ضد التخمين — 5 محاولات كل 5 دقائق
  const rl = rateLimit("admin-login", 5, 5 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!checkPasscode(body?.passcode)) {
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  setAdminSession();
  return NextResponse.json({ ok: true });
}
