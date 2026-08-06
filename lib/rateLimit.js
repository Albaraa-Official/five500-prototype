// حد معدّل: يستخدم Upstash Redis عند الإعداد، وإلا يعود إلى الذاكرة.
// نافذة منزلقة في الحالتين. تُحلّ مشكلة التعدد في Vercel serverless عند استخدام Upstash.

const useUpstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// تحذير مرة واحدة عند الإنتاج بدون Upstash
if (!useUpstash && process.env.NODE_ENV === "production") {
  console.warn(
    "[rateLimit] تحذير: لم يُعثر على UPSTASH_REDIS_REST_URL/TOKEN — " +
      "يُستخدم حد المعدّل في الذاكرة وهو غير آمن على Vercel متعدد الـ instances."
  );
}

// ── Upstash path ──────────────────────────────────────────────────────────────
let upstashLimiter = null; // { ratelimit, redis } — تُحمَّل عند الحاجة

async function getUpstashLimiter(windowMs) {
  // نُنشئ limiter لكل window مختلف (عادةً اثنان أو ثلاثة في التطبيق)
  if (!upstashLimiter) {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    upstashLimiter = { Redis, Ratelimit, instances: new Map() };
  }
  const { Redis, Ratelimit, instances } = upstashLimiter;
  if (!instances.has(windowMs)) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const windowSec = Math.max(1, Math.round(windowMs / 1000));
    instances.set(
      windowMs,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          /* يُضبط ديناميكياً لكل مفتاح — انظر rateLimitUpstash */
          1000,
          `${windowSec} s`
        ),
        prefix: "rl",
      })
    );
  }
  return instances.get(windowMs);
}

async function rateLimitUpstash(key, limit, windowMs) {
  // Upstash Ratelimit لا يدعم limit ديناميكياً بعد البناء؛
  // نستخدم مفتاح مركّب يشمل limit حتى نحصل على limiter منفصل لكل (limit, window).
  const compositeKey = `${limit}:${windowMs}:${key}`;

  // نُنشئ أو نجلب limiter بـ limit الصحيح
  if (!upstashLimiter) {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    upstashLimiter = { Redis, Ratelimit, instances: new Map() };
  }
  const { Redis, Ratelimit, instances } = upstashLimiter;
  const instanceKey = `${limit}__${windowMs}`;
  if (!instances.has(instanceKey)) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const windowSec = Math.max(1, Math.round(windowMs / 1000));
    instances.set(
      instanceKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: "rl",
      })
    );
  }
  const rl = instances.get(instanceKey);
  const { success, remaining, reset } = await rl.limit(compositeKey);
  const retryAfterMs = success ? 0 : Math.max(0, reset - Date.now());
  return { ok: success, remaining, retryAfterMs };
}

// ── In-memory path (fallback) ─────────────────────────────────────────────────
const buckets = new Map();

function rateLimitMemory(key, limit, windowMs) {
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

// ── Public API ────────────────────────────────────────────────────────────────
// key: معرّف (IP/هاتف), limit: عدد, windowMs: النافذة.
// يُعيد { ok, remaining, retryAfterMs }.
export async function rateLimit(key, limit, windowMs) {
  if (useUpstash) {
    return rateLimitUpstash(key, limit, windowMs);
  }
  return rateLimitMemory(key, limit, windowMs);
}
