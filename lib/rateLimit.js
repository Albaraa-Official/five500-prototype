// حد معدّل بسيط في الذاكرة (نافذة منزلقة). كافٍ لنسخة واحدة/التطوير.
// ملاحظة إنتاج: استبدله بـ Upstash/Redis عند التوسّع الأفقي (مسجّل في Security.md).
const buckets = new Map();

// key: معرّف (IP/هاتف), limit: عدد, windowMs: النافذة.
// يُعيد { ok, remaining, retryAfterMs }.
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const retryAfterMs = windowMs - (now - arr[0]);
    return { ok: false, remaining: 0, retryAfterMs };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, remaining: limit - arr.length, retryAfterMs: 0 };
}

// تنظيف دوري خفيف لتفادي نمو الذاكرة.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, arr] of buckets) {
      const kept = arr.filter((t) => now - t < 3600_000);
      if (kept.length) buckets.set(k, kept);
      else buckets.delete(k);
    }
  }, 600_000).unref?.();
}
