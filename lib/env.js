// التحقق من متغيّرات البيئة الحرجة — يفشل بسرعة (fail-fast) في الإنتاج
// بدل أخطاء غامضة وقت التشغيل. يُستدعى من next.config.js.
const REQUIRED_PROD = ["DATABASE_URL", "SESSION_SECRET"];

// أسرار مطلوبة فقط عند تفعيل الميزة المقابلة
const CONDITIONAL = [
  { when: (e) => e.OTP_PROVIDER && e.OTP_PROVIDER !== "mock", keys: ["OTP_API_KEY"] },
  { when: (e) => !!e.MOYASAR_SECRET_KEY, keys: ["MOYASAR_WEBHOOK_SECRET"] },
];

function validateEnv(env = process.env) {
  const isProd = env.NODE_ENV === "production";
  const missing = [];

  if (isProd) {
    for (const k of REQUIRED_PROD) if (!env[k]) missing.push(k);
    for (const rule of CONDITIONAL) {
      if (rule.when(env)) for (const k of rule.keys) if (!env[k]) missing.push(k);
    }
  }

  // تحذير: SESSION_SECRET ضعيف
  if (isProd && env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
    console.warn("⚠️  SESSION_SECRET قصير (<32 حرف) — استخدم: openssl rand -hex 32");
  }

  if (missing.length) {
    throw new Error(
      `❌ متغيّرات بيئة مفقودة للإنتاج: ${missing.join(", ")}. راجع .env.example و docs/Deployment.md`
    );
  }
}

module.exports = { validateEnv };
