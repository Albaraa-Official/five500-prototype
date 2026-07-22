# Deployment — دليل النشر

## البيئة المحلية (التطوير)
يحتاج Postgres (تطابق مع الإنتاج). أسهل خيار: قاعدة Neon مجانية، أو Postgres محلي.

```bash
npm install
# أنشئ .env و .env.local وضع فيهما نفس الرابط:
#   DATABASE_URL="postgresql://user:pass@host:5432/five500?sslmode=require"
#   SESSION_SECRET="$(openssl rand -hex 32)"   (في .env.local)
npx prisma migrate deploy         # يطبّق المخطط
npm run db:seed                   # يزرع المنيو (22 صنف)
npm run dev                       # http://localhost:3200
```
- **Postgres محلي عبر Homebrew** (بديل عن Neon):
  ```bash
  brew install postgresql@16
  initdb -D /tmp/f500pg -U postgres --locale=C
  pg_ctl -D /tmp/f500pg -o "-p 5433" start
  createdb -h localhost -p 5433 -U postgres five500
  # DATABASE_URL="postgresql://postgres@localhost:5433/five500"
  ```
- تسجيل الدخول: الرمز يظهر في الواجهة + سجل الخادم (OTP_PROVIDER=mock).
- الدفع: محاكى — التسوية عبر /api/payments/webhook (mock-confirm للتطوير فقط).

## اختبار التحمّل
```bash
BASE=http://localhost:3300 N=20 node scripts/loadtest.mjs
```

## الانتقال للإنتاج (عند جاهزية الحسابات)
1. **قاعدة البيانات:** أنشئ Postgres (Neon/Railway)، غيّر `provider` في [schema.prisma](../prisma/schema.prisma) إلى `postgresql`، ثم `prisma migrate deploy`.
2. **الأسرار (Vercel Env):** `DATABASE_URL`, `SESSION_SECRET` (openssl rand -hex 32)، `OTP_PROVIDER`+مفتاحه، `MOYASAR_*`.
3. **OTP:** فعّل مزوّداً حقيقياً (Unifonic/Msegat) في [lib/otp.js](../lib/otp.js) `sendSms`.
4. **Moyasar:** فعّل الواجهة المستضافة في [payment/page.js](../app/payment/page.js) واضبط `webhook` على `/api/payments/webhook` مع `MOYASAR_WEBHOOK_SECRET`. عند وجود المفتاح، mock-confirm يتعطّل تلقائياً.
5. **النشر:** اربط المستودع بـ Vercel، أضف متغيرات البيئة، انشر.
6. **المراقبة:** أضف Sentry (مسجّل كبند لاحق).

## قائمة ما قبل الإطلاق
- [ ] Postgres مهاجَر ومزروع
- [ ] SESSION_SECRET قوي عشوائي
- [ ] Moyasar live + webhook متحقّق
- [ ] OTP حقيقي يصل للجوال
- [ ] ZATCA (عند جاهزية السجل التجاري) — FEATURE_ZATCA
- [ ] ترقية Next 16 (بند أمني مؤجّل) واختبار
