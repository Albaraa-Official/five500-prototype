// إدارة رموز OTP: توليد، تجزئة، تخزين، تحقق. الرمز يُجزّأ ولا يُخزّن خام.
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 دقائق
const MAX_ATTEMPTS = 5;

const hash = (code) => crypto.createHash("sha256").update(code).digest("hex");

// يولّد رمزاً من 4 أرقام ويخزّن تجزئته. يُعيد الرمز (للإرسال عبر SMS).
export async function issueOtp(phoneE164) {
  const code = String(crypto.randomInt(1000, 10000));
  await prisma.otpCode.create({
    data: {
      phoneE164,
      codeHash: hash(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  await sendSms(phoneE164, code);
  return code;
}

// يتحقق من أحدث رمز غير مستهلك. يُعيد true عند النجاح.
export async function verifyOtp(phoneE164, code) {
  const rec = await prisma.otpCode.findFirst({
    where: { phoneE164, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!rec) return false;
  if (rec.attempts >= MAX_ATTEMPTS) return false;

  const ok = rec.codeHash === hash(String(code));
  if (ok) {
    await prisma.otpCode.update({ where: { id: rec.id }, data: { consumed: true } });
    return true;
  }
  await prisma.otpCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
  return false;
}

// مرسل SMS — يدعم mock (تطوير) + Unifonic + Msegat (إنتاج). يُختار عبر OTP_PROVIDER.
async function sendSms(phoneE164, code) {
  const provider = process.env.OTP_PROVIDER || "mock";
  const body = `رمز التحقق الخاص بك في فايف هاندرد: ${code}`;

  if (provider === "mock") {
    console.log(`[OTP mock] ${phoneE164} → ${code}`);
    return;
  }
  if (provider === "unifonic") return sendViaUnifonic(phoneE164, body);
  if (provider === "msegat") return sendViaMsegat(phoneE164, body);
  throw new Error(`OTP provider غير مدعوم: ${provider}`);
}

// Unifonic REST — https://docs.unifonic.com
async function sendViaUnifonic(phoneE164, body) {
  const res = await fetch("https://el.cloud.unifonic.com/rest/SMS/messages", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      AppSid: process.env.OTP_API_KEY,
      SenderID: process.env.OTP_SENDER_NAME || "FIVE500",
      Recipient: phoneE164.replace("+", ""),
      Body: body,
    }),
  });
  if (!res.ok) throw new Error(`Unifonic فشل: ${res.status}`);
}

// Msegat REST — https://www.msegat.com
async function sendViaMsegat(phoneE164, body) {
  const res = await fetch("https://www.msegat.com/gw/sendsms.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: process.env.OTP_API_KEY,
      userName: process.env.OTP_USERNAME,
      userSender: process.env.OTP_SENDER_NAME || "FIVE500",
      numbers: phoneE164.replace("+", ""),
      msg: body,
    }),
  });
  if (!res.ok) throw new Error(`Msegat فشل: ${res.status}`);
}
