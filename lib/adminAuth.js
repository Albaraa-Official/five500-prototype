// مصادقة الإدارة — منفصلة تماماً عن حسابات العملاء.
// كلمة مرور واحدة عبر ADMIN_PASSCODE، وجلسة cookie موقّعة مستقلة.
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "f500_admin";
const MAX_AGE = 60 * 60 * 8; // 8 ساعات

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET غير مضبوط");
  return s;
}

function sign(value) {
  const sig = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed) {
  if (!signed || !signed.includes(".")) return false;
  const idx = signed.lastIndexOf(".");
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b) && value === "admin";
}

// يقارن كلمة المرور بأمان (ثابت الزمن).
export function checkPasscode(input) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function setAdminSession() {
  cookies().set(COOKIE, sign("admin"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE);
}

export function isAdmin() {
  const c = cookies().get(COOKIE);
  return c ? verify(c.value) : false;
}
