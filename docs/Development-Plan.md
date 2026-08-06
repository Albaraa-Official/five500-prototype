# Development Plan — مهام مستقلة قابلة للتنفيذ

> **حالة التنفيذ (2026-07-22):** أُنجز T0, T1, T2, T3, T4 ومعظم T5. باقٍ: مزودات OTP/Moyasar الحقيقية (تحتاج حسابات)، لوحة الإدارة، جعل الواجهة متجاوبة كلياً، Sentry. راجع Deployment.md.


كل مهمة صغيرة ومستقلة. الترتيب = التسلسل الموصى به. كل مهمة لها: هدف / ملفات / اختبار / تعريف الإنجاز (DoD).

## المسار 0 — التأسيس
- **T0.1 إعداد البيئة والأدوات**
  - الهدف: `.env.example`, `.gitignore` محدّث، `reactStrictMode:true`، إضافة `zod`, `prisma`.
  - الملفات: `.env.example`, `.gitignore`, `next.config.js`, `package.json`.
  - DoD: `npm run build` ينجح، لا أسرار في git.

## المسار 1 — قاعدة البيانات + الكتالوج
- **T1.1 مخطط Prisma + Migration** (جداول Architecture §6). DoD: migration تعمل على Postgres.
- **T1.2 Seed المنيو** من [data/menu.js](../data/menu.js) إلى DB (أسعار بالهللات). DoD: كل المنتجات في DB.
- **T1.3 API `GET /api/products`** + ربط [menu](../app/menu/page.js) و[home](../app/page.js) بالـfetch. DoD: المنيو يُحمّل من DB.

## المسار 2 — المصادقة (Phone OTP)
- **T2.1 API `POST /api/auth/request-otp`** (rate-limited، code مُجزّأ). 
- **T2.2 API `POST /api/auth/verify-otp`** → جلسة cookie HttpOnly.
- **T2.3 شاشة تسجيل الدخول** + middleware حماية المسارات.
- **T2.4 ربط [account](../app/account/page.js)** ببيانات المستخدم الحقيقية.
- DoD: دخول فعلي بالجوال، لا بيانات مزيفة.

## المسار 3 — الطلبات (القلب)
- **T3.1 API `POST /api/orders`** — يستقبل `[{productId, size, qty}]` فقط، **يحسب السعر/الضريبة/الإجمالي في السيرفر**، يُنشئ طلب `pending_payment`.
- **T3.2 توحيد التدفق:** دمج [checkout](../app/checkout/page.js) و[payment](../app/payment/page.js) في مسار واحد.
- **T3.3 API `GET /api/orders/[id]`** + ربط [success](../app/success/page.js) برقم/حالة الطلب الحقيقي.
- DoD: طلب حقيقي محفوظ، لا `setTimeout`، لا رقم ثابت.

## المسار 4 — الدفع (Moyasar)
- **T4.1 `POST /api/payments/create`** — ينشئ دفعة بمبلغ الطلب من السيرفر.
- **T4.2 `POST /api/payments/webhook`** — تحقق توقيع، تحديث الطلب إلى `paid`.
- **T4.3 استبدال دفع العميل الوهمي** بواجهة Moyasar الحقيقية.
- DoD: دفعة test تنجح وتُأكَّد عبر Webhook فقط.

## المسار 5 — الصلابة والنشر
- **T5.1** Rate limiting + Zod على كل API.
- **T5.2** اختبارات للمسارات الحرجة (تسعير، طلب، webhook).
- **T5.3** إعداد Vercel + متغيرات البيئة + Sentry.
- **T5.4** جعل الواجهة متجاوبة (إزالة إطار الجوال الثابت).

## مؤجّل (خلف flag)
- ZATCA e-invoicing · لوحة الإدارة · التوصيل · كود الخصم الفعلي.
