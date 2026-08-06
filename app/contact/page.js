import Link from "next/link";

export const metadata = { title: "تواصل معنا — FIVE 500" };

const CHANNELS = [
  { icon: "📞", label: "الهاتف", value: "أضف رقم التواصل هنا" },
  { icon: "✉️", label: "البريد الإلكتروني", value: "أضف بريد التواصل هنا" },
  { icon: "📍", label: "الفرع", value: "أضف عنوان الفرع هنا" },
  { icon: "🕐", label: "أوقات العمل", value: "أضف أوقات العمل هنا" },
];

export default function ContactPage() {
  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <Link href="/account" style={{ fontSize: 13, color: "var(--text-2)" }}>← رجوع</Link>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
          تواصل معنا
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>
          يسعدنا تواصلكم معنا لأي استفسار أو ملاحظة.
        </p>
      </header>

      <div className="pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CHANNELS.map((c) => (
          <div
            key={c.label}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}
          >
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{c.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
