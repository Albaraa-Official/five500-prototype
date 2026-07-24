// فوتر ثابت بأسفل كل صفحة — يعرض بيانات السجل التجاري وروابط السياسات القانونية.
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-links">
        <Link href="/legal/privacy">سياسة الخصوصية</Link>
        <span className="app-footer-dot">·</span>
        <Link href="/legal/terms">الشروط والأحكام</Link>
      </div>
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
