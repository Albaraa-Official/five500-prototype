// جلسة بلا حالة عبر cookie HttpOnly موقّعة بـ HMAC (SESSION_SECRET).
// القيمة = userId، والتوقيع يمنع التزوير. لا JWT في التخزين المحلي.
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "f500_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم

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
  if (!signed || !signed.includes(".")) return null;
  const idx = signed.lastIndexOf(".");
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  // مقارنة ثابتة الزمن لمنع timing attacks
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function setSession(userId) {
  cookies().set(COOKIE, sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

// يُعيد userId أو null.
export function getSessionUserId() {
  const c = cookies().get(COOKIE);
  return c ? verify(c.value) : null;
}
