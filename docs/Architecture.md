# FIVE 500 — Architecture

> الحالة: مسودة معتمدة للمرحلة 2/3. آخر تحديث يتبع Decision-Log.

## 1. الأهداف
تطبيق طلب برجر (استلام من الفرع) جاهز للإنتاج: كتالوج ديناميكي، سلة، إنشاء طلب آمن، دفع حقيقي عبر Moyasar، تسجيل دخول بالجوال (OTP)، وتتبّع حالة الطلب.

## 2. القرارات المعتمدة
| # | القرار | الاختيار |
|---|--------|----------|
| ❶ | نموذج الخدمة | استلام من الفرع فقط (Pickup) |
| ❷ | الفروع | مخطط DB متعدد الفروع، إطلاق بفرع واحد |
| ❸ | بوابة الدفع | Moyasar (مدى + Apple Pay)، Hosted/Tokenized + Webhook موقّع |
| ❹ | السطح | Web / PWA متجاوب |
| ❺ | Backend | Next.js Route Handlers + Prisma + Postgres + OTP (Unifonic/Msegat) |
| — | ZATCA | مؤجّل خلف feature flag حتى جاهزية السجل التجاري |

## 3. المعمارية عالية المستوى
```
[PWA / Next.js Client]
        │  (fetch, HttpOnly cookie session)
        ▼
[Next.js Route Handlers /app/api/*]  ── Prisma ──> [Postgres]
        │                                              ▲
        ├── Moyasar (create payment) ─────────────────┘
        │        ▲
        │        └── Webhook موقّع ──> تأكيد الدفع وتحديث حالة الطلب
        ├── OTP Provider (SMS)
        └── (لاحقاً) لوحة الإدارة /admin
```

## 4. المبادئ الأمنية غير القابلة للتفاوض
1. **السعر يُعاد حسابه في السيرفر** وقت إنشاء الطلب من `product.id + size` — لا يُوثق بأي سعر من العميل.
2. الدفع يتأكد عبر **Webhook موقّع** فقط، لا عبر رد المتصفح.
3. الجلسة عبر **cookie HttpOnly + SameSite**، لا JWT في localStorage.
4. كل مدخل يُتحقق منه في السيرفر (Zod)، وليس في الواجهة فقط.
5. الأسرار في `.env` فقط، لا شيء hardcoded.

## 5. حالات الطلب (State Machine)
```
pending_payment → paid → preparing → ready → completed
       └────────────→ cancelled / payment_failed
```
الانتقال إلى `paid` يحدث **فقط** من Webhook الدفع.

## 6. مخطط قاعدة البيانات (مبدئي)
- `branches(id, name, active)`
- `products(id, name, category, img, calories, active, branch_scope)`
- `product_prices(id, product_id, size, price_halalas)` — الأسعار بالهللات (عدد صحيح) لا كسور عائمة.
- `users(id, phone_e164, name, created_at)`
- `otp_codes(id, phone, code_hash, expires_at, attempts)`
- `orders(id, user_id, branch_id, status, subtotal_halalas, vat_halalas, total_halalas, plate, created_at)`
- `order_items(id, order_id, product_id, size, qty, unit_price_halalas)` — snapshot السعر وقت الطلب.
- `payments(id, order_id, provider, provider_ref, status, amount_halalas)`

## 7. ما يُعاد تشكيله في الكود الحالي
- توحيد `/checkout` و`/payment` في تدفق واحد.
- نقل حساب الضريبة/الإجمالي من العميل ([context/CartContext.js](../context/CartContext.js)) إلى API.
- استبدال `setTimeout` الوهمي في [app/payment/page.js](../app/payment/page.js) بنداء Moyasar.
- ربط [app/account/page.js](../app/account/page.js) و[app/success/page.js](../app/success/page.js) ببيانات حقيقية.
