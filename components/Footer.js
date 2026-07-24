// فوتر ثابت بأسفل كل صفحة — روابط قانونية/تعريفية بأيقونات موحّدة + بيانات السجل التجاري.
import Link from "next/link";

const LINKS = [
  { href: "/about", icon: "🏠", label: "من نحن" },
  { href: "/contact", icon: "💬", label: "تواصل معنا" },
  { href: "/legal/privacy", icon: "🔒", label: "الخصوصية" },
  { href: "/legal/terms", icon: "📄", label: "الشروط" },
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <nav className="app-footer-grid">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="app-footer-item">
            <span className="app-footer-icon">{l.icon}</span>
            <span className="app-footer-label">{l.label}</span>
          </Link>
        ))}
      </nav>

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
