// POST /api/auth/request-otp — يرسل رمز OTP للجوال (mock في التطوير).
import { NextResponse } from "next/server";
import { requestOtpSchema } from "@/lib/validation";
import { normalizeSaudiPhone } from "@/lib/phone";
import { issueOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  // حد المعدّل: 3 طلبات لكل رقم خلال 10 دقائق
  const rl = await rateLimit(`otp:${phone}`, 3, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs: rl.retryAfterMs },
      { status: 429 }
    );
  }

  try {
    const code = await issueOtp(phone);
    // في التطوير فقط نُعيد الرمز لتسهيل الاختبار؛ في الإنتاج لا يُعاد أبداً.
    const devCode = process.env.NODE_ENV !== "production" ? { devCode: code } : {};
    return NextResponse.json({ ok: true, ...devCode });
  } catch (err) {
    console.error("request-otp failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
