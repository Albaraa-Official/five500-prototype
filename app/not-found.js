import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", gap: 14 }}>
      <span style={{ fontSize: 48 }}>🍔</span>
      <h1 style={{ fontSize: 20, fontWeight: 900 }}>الصفحة غير موجودة</h1>
      <p className="muted" style={{ fontSize: 14 }}>الرابط اللي فتحته مو موجود.</p>
      <Link href="/" className="btn btn-primary" style={{ padding: "0 28px", height: 48, display: "inline-flex", alignItems: "center" }}>الرجوع للرئيسية</Link>
    </div>
  );
}
