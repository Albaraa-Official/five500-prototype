import Link from "next/link";

export const metadata = { title: "سياسة الخصوصية — FIVE 500" };

export default function PrivacyPage() {
  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <Link href="/account" style={{ fontSize: 13, color: "var(--text-2)" }}>← رجوع</Link>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
          سياسة الخصوصية
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
          آخر تحديث: يوليو ٢٠٢٦
        </p>
      </header>

      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 14, lineHeight: 1.9, color: "var(--text-2)" }}>
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ١. مقدمة
          </h2>
          <p>
            تلتزم "مطعم خمس مائة لتقديم الوجبات" (المسجّل بموجب السجل التجاري رقم ١١٢٢١٠٤٩٤٣)
            بحماية خصوصية عملائها. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند
            استخدامك لموقعنا وتطبيقنا.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٢. البيانات التي نجمعها
          </h2>
          <ul style={{ paddingRight: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>رقم الجوال (للتحقق عبر رمز OTP وتسجيل الدخول)</li>
            <li>الاسم ورقم اللوحة (لتسليم الطلب)</li>
            <li>تفاصيل الطلبات وسجل المشتريات</li>
            <li>بيانات الدفع تُعالَج مباشرة عبر بوابة الدفع المعتمدة (Moyasar) ولا نخزّن بيانات البطاقة لدينا</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٣. كيف نستخدم بياناتك
          </h2>
          <ul style={{ paddingRight: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>معالجة الطلبات وتأكيد الدفع</li>
            <li>التواصل معك بخصوص حالة طلبك</li>
            <li>تحسين جودة الخدمة وتجربة الاستخدام</li>
            <li>الامتثال للأنظمة السعودية ذات الصلة</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٤. مشاركة البيانات
          </h2>
          <p>
            لا نبيع بياناتك لأي طرف ثالث. قد تُشارَك بيانات محدودة مع مزوّدي خدمات ضروريين
            لتشغيل الخدمة (بوابة الدفع، مزوّد الرسائل النصية) بالقدر اللازم فقط لإتمام العملية.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٥. أمن البيانات
          </h2>
          <p>
            نستخدم تشفير الاتصال (HTTPS)، وتخزين آمن لجلسات الدخول، ولا نخزّن رموز التحقق أو
            كلمات المرور كنص صريح.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٦. حقوقك
          </h2>
          <p>
            يحق لك طلب الاطلاع على بياناتك أو تعديلها أو حذفها بالتواصل معنا عبر بيانات
            التواصل أدناه.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٧. التواصل
          </h2>
          <p>لأي استفسار بخصوص هذه السياسة، يمكنكم التواصل معنا عبر الموقع.</p>
        </section>
      </div>
    </div>
  );
}
