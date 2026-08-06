// إعادة محاولة بتأخير تصاعدي (exponential backoff) لنداءات الشبكة غير الموثوقة.
export async function withRetry(fn, { attempts = 3, baseDelayMs = 600 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn(i + 1);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
      }
    }
  }
  throw lastErr;
}
