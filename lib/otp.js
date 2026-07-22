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

// مرسل SMS — mock حالياً (يطبع الرمز في السجل). يُستبدل بـ Unifonic/Msegat لاحقاً.
async function sendSms(phoneE164, code) {
  const provider = process.env.OTP_PROVIDER || "mock";
  if (provider === "mock") {
    console.log(`[OTP mock] ${phoneE164} → ${code}`);
    return;
  }
  // TODO(unifonic/msegat): تكامل حقيقي عند توفّر المفتاح.
  throw new Error(`OTP provider غير مدعوم بعد: ${provider}`);
}
