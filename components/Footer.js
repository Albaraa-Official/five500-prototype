// فوتر بسيط بعمودين نصّيين (الخدمة / قانوني) + بيانات السجل التجاري بالأسفل.
import Link from "next/link";

const COLUMNS = [
  {
    title: "الخدمة",
    links: [
      { href: "/", label: "الرئيسية" },
      { href: "/menu", label: "المنيو" },
      { href: "/about", label: "من نحن" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/legal/terms", label: "الشروط والأحكام" },
      { href: "/legal/privacy", label: "سياسة الخصوصية" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-cols">
        {COLUMNS.map((col) => (
          <div key={col.title} className="app-footer-col">
            <span className="app-footer-title">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="app-footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="app-footer-divider" />

      <div className="app-footer-cr">
        <span>مطعم خمس مائة لتقديم الوجبات</span>
        <span>س.ت ١١٢٢١٠٤٩٤٣</span>
      </div>
      <div className="app-footer-copy">
        © {new Date().getFullYear()} FIVE 500. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
