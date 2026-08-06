# Security — مراجعة إلزامية قبل البرمجة

## المخاطر الحرجة في الكود الحالي
| # | الخطر | الموقع | الإصلاح |
|---|-------|--------|---------|
| S1 | تلاعب بالأسعار | [CartContext.js](../context/CartContext.js), [checkout](../app/checkout/page.js) | حساب السعر في السيرفر من `productId+size` |
| S2 | دفع بلا تحقق | [payment/page.js](../app/payment/page.js) | Webhook موقّع فقط |
| S3 | لا مصادقة | [checkout](../app/checkout/page.js) | Phone OTP + جلسة HttpOnly |
| S4 | لا rate limiting | كل المسارات | حد على OTP والطلبات |

## قائمة التحقق (OWASP-aligned)
- **Auth:** OTP، حد محاولات، انتهاء صلاحية الكود، تجزئة الكود لا تخزينه خام.
- **Session:** cookie HttpOnly + Secure + SameSite=Lax، لا JWT في التخزين المحلي.
- **AuthZ:** كل طلب يتحقق أن المورد يخص المستخدم.
- **Input:** Zod على كل body، رفض الحقول الزائدة.
- **Injection:** Prisma (parametrized) — ممنوع SQL خام.
- **CSRF:** SameSite + التحقق من الأصل على المسارات المتغيّرة.
- **Secrets:** `.env` فقط، لا مفاتيح في git، تدوير مفاتيح Moyasar.
- **Webhook:** تحقق التوقيع + idempotency (منع إعادة التشغيل).
- **Rate limiting:** OTP والطلبات والدفع.
- **CSP/Headers:** إضافة عبر `next.config` (CSP, HSTS, X-Frame-Options).
- **Deps:** `npm audit` في CI، تثبيت الإصدارات.
- **Logging:** سجل تدقيق للطلبات والدفع بلا بيانات حساسة.

## بنود أمنية مفتوحة (Follow-ups)
- **Next.js:** رُقّي من 14.2.5 → 14.2.35 (أزال كل الثغرات الحرجة). يتبقّى تحذيرات high/moderate تتطلب الترقية لـ Next 16 (تغيير كاسر) — مؤجّلة حتى نافذة اختبار مخصّصة. تتبّع في Decision-Log D8.

## قاعدة ذهبية
لا يُوثق بأي رقم مالي أو حالة دفع قادمة من العميل — المصدر الوحيد للحقيقة هو السيرفر + Webhook.
