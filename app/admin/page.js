"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

function TabLoading() {
  return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;
}

const OrdersTab = dynamic(() => import("./tabs/OrdersTab"), { loading: TabLoading, ssr: false });
const ProductsTab = dynamic(() => import("./tabs/ProductsTab"), { loading: TabLoading, ssr: false });
const DiscountsTab = dynamic(() => import("./tabs/DiscountsTab"), { loading: TabLoading, ssr: false });
const CustomersTab = dynamic(() => import("./tabs/CustomersTab"), { loading: TabLoading, ssr: false });
const StatsTab = dynamic(() => import("./tabs/StatsTab"), { loading: TabLoading, ssr: false });
const IntegrationsTab = dynamic(() => import("./tabs/IntegrationsTab"), { loading: TabLoading, ssr: false });

const TABS = [
  ["orders", "🍔 الطلبات"],
  ["products", "📦 المنتجات"],
  ["discounts", "🏷️ الخصومات"],
  ["customers", "👥 العملاء"],
  ["stats", "📊 الإحصائيات"],
  ["integrations", "🔌 Integrations"],
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    fetch("/api/admin/login").then((r) => r.json()).then((d) => setAuthed(d.admin)).catch((e) => { console.error("admin login check failed", e); setAuthed(false); });
  }, []);

  const login = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) setAuthed(true);
      else setError("كلمة المرور غير صحيحة.");
    } catch (e) {
      console.error("admin login failed", e);
      setError("تعذّر الاتصال بالخادم.");
    }
  };

  if (authed === null) return <div className="app pad"><p style={{ marginTop: 40 }}>…</p></div>;

  if (!authed) {
    return (
      <div className="app pad" style={{ maxWidth: 360, margin: "0 auto" }}>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 900, marginTop: 30 }}>🔒 لوحة الإدارة</h1>
        <p className="muted" style={{ fontSize: 14, margin: "10px 0 20px" }}>أدخل كلمة مرور الإدارة.</p>
        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
          placeholder="كلمة المرور" onKeyDown={(e) => e.key === "Enter" && login()}
          style={{ width: "100%", height: 52, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 16px", fontSize: 15, fontWeight: 600 }} />
        <button className="btn btn-primary btn-block" onClick={login} style={{ marginTop: 14 }}>دخول</button>
        {error && <p style={{ color: "#e05252", fontSize: 13, marginTop: 12, fontWeight: 700 }}>⚠️ {error}</p>}
      </div>
    );
  }

  return (
    <div className="app pad" style={{ paddingBottom: 40, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <h1 className="display" style={{ fontSize: 22, fontWeight: 900 }}>⚙️ لوحة الإدارة</h1>
      </header>

      <div className="hide-scroll" role="tablist" aria-label="أقسام لوحة الإدارة" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0" }}>
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            role="tab" aria-selected={tab === v}
            style={{ flexShrink: 0, minHeight: 44, padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 800,
              background: tab === v ? "var(--orange)" : "var(--surface)", color: tab === v ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "discounts" && <DiscountsTab />}
      {tab === "customers" && <CustomersTab />}
      {tab === "stats" && <StatsTab />}
      {tab === "integrations" && <IntegrationsTab />}
    </div>
  );
}
