import Link from "next/link";

export const metadata = { title: "الشروط والأحكام — FIVE 500" };

export default function TermsPage() {
  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <Link href="/account" style={{ fontSize: 13, color: "var(--text-2)" }}>← رجوع</Link>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
          الشروط والأحكام
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
          آخر تحديث: يوليو ٢٠٢٦
        </p>
      </header>

      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 14, lineHeight: 1.9, color: "var(--text-2)" }}>
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ١. عن الخدمة
          </h2>
          <p>
            يقدَّم هذا الموقع من قبل "مطعم خمس مائة لتقديم الوجبات"، سجل تجاري رقم ١١٢٢١٠٤٩٤٣،
            المملكة العربية السعودية. استخدامك للموقع يعني موافقتك على هذه الشروط.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٢. الطلبات والأسعار
          </h2>
          <ul style={{ paddingRight: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>جميع الأسعار المعروضة تشمل ضريبة القيمة المضافة (١٥٪) ما لم يُذكر خلاف ذلك</li>
            <li>الأسعار والمنتجات قابلة للتغيير دون إشعار مسبق</li>
            <li>يُعتبر الطلب مؤكداً فقط بعد إتمام الدفع بنجاح</li>
            <li>نحتفظ بالحق في رفض أو إلغاء أي طلب لأسباب تشغيلية (نفاد الصنف، خطأ في السعر، إلخ)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٣. الدفع
          </h2>
          <p>
            تُعالَج المدفوعات عبر بوابة دفع إلكترونية معتمدة (Moyasar). لا تُخزَّن بيانات بطاقتك
            لدينا. جميع المعاملات مؤمَّنة ومشفّرة.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٤. الاستلام والتوصيل
          </h2>
          <p>
            يلتزم العميل بتقديم بيانات صحيحة (رقم الجوال، رقم اللوحة عند الاستلام من السيارة).
            المطعم غير مسؤول عن تأخر الاستلام الناتج عن بيانات خاطئة من العميل.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٥. الإلغاء والاسترجاع
          </h2>
          <p>
            لطلبات الإلغاء أو الاسترجاع بعد الدفع، يُرجى التواصل مباشرة مع فريق المطعم في أقرب
            وقت ممكن. تُدرَس كل حالة على حدة وفق طبيعة الطلب وحالة التحضير.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٦. المسؤولية
          </h2>
          <p>
            نبذل قصارى جهدنا لضمان دقة المعلومات المعروضة (الأسعار، المكونات، الصور)، إلا أننا
            غير مسؤولين عن أي فروقات طفيفة قد تحدث.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٧. التعديلات
          </h2>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يُعتبر استمرار استخدامك للموقع بعد
            التعديل موافقة ضمنية على الشروط المحدّثة.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            ٨. القانون المعمول به
          </h2>
          <p>تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية.</p>
        </section>
      </div>
    </div>
  );
}
