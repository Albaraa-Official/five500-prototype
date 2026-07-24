import Link from "next/link";

export const metadata = { title: "من نحن — FIVE 500" };

export default function AboutPage() {
  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <Link href="/account" style={{ fontSize: 13, color: "var(--text-2)" }}>← رجوع</Link>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
          من نحن
        </h1>
      </header>

      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 14, lineHeight: 1.9, color: "var(--text-2)" }}>
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            FIVE 500 — فايف هاندرد
          </h2>
          <p>
            "مطعم خمس مائة لتقديم الوجبات" مطعم متخصص في تقديم أشهى أصناف البرجر، مصنوعة
            بمكونات طازجة ووصفات مدروسة بعناية، لنقدّم لكم تجربة برجر فاخرة تليق بذوقكم.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            نشاطنا
          </h2>
          <p>
            نشاطنا التجاري مسجّل رسمياً في المملكة العربية السعودية تحت مجال تقديم الوجبات
            (المطاعم)، ونلتزم بأعلى معايير الجودة والسلامة الغذائية في كل طبق نقدّمه.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
            رؤيتنا
          </h2>
          <p>
            أن نكون الوجهة الأولى لمحبي البرجر، من خلال تجربة طلب سلسة سواء عبر الموقع أو من
            داخل الفرع، وخدمة تليق بكل زيارة.
          </p>
        </section>
      </div>
    </div>
  );
}
