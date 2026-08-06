// POST /api/auth/verify-otp — يتحقق من الرمز، ينشئ/يجلب المستخدم، ويفتح جلسة.
import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validation";
import { normalizeSaudiPhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otp";
import { setSession } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  // حد محاولات التحقق: 10 لكل رقم خلال 10 دقائق
  const rl = await rateLimit(`verify:${phone}`, 10, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const ok = await verifyOtp(phone, parsed.data.code);
  if (!ok) return NextResponse.json({ error: "invalid_code" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { phoneE164: phone },
    update: {},
    create: { phoneE164: phone },
  });

  setSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, phone } });
}
