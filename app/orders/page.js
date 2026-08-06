"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I } from "@/components/Icons";
import { formatSAR } from "@/lib/money";

const STATUS_AR = {
  pending_payment: "بانتظار الدفع",
  paid: "مدفوع",
  preparing: "قيد التحضير",
  ready: "جاهز للاستلام",
  completed: "مكتمل",
  cancelled: "ملغى",
  payment_failed: "فشل الدفع",
};
const STATUS_COLOR = {
  pending_payment: "#b5ab98",
  paid: "#f5a623",
  preparing: "#ec6a2c",
  ready: "#46c37b",
  completed: "#7f8c8d",
  cancelled: "#e05252",
  payment_failed: "#e05252",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [unauthed, setUnauthed] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = () => {
    setLoadError(false);
    fetch("/api/orders/mine")
      .then((r) => {
        if (r.status === 401) { setUnauthed(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (d === null) return; // unauthed, handled above
        if (d?.orders) setOrders(d.orders);
        else setLoadError(true);
      })
      .catch((e) => { console.error("orders/mine load failed", e); setLoadError(true); });
  };

  useEffect(load, []);

  return (
    <div className="app pad" style={{ paddingBottom: 40 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
        <button className="round card" onClick={() => router.back()} aria-label="رجوع"><I.back /></button>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 900 }}>طلباتي</h1>
      </header>

      {unauthed && (
        <div className="card" style={{ padding: 24, textAlign: "center", marginTop: 20 }}>
          <p className="muted" style={{ marginBottom: 14 }}>سجّل دخولك لعرض طلباتك.</p>
          <Link href="/login?next=/orders" className="btn btn-primary btn-block">تسجيل الدخول</Link>
        </div>
      )}

      {!unauthed && loadError && (
        <div className="card" style={{ padding: 24, textAlign: "center", marginTop: 20 }}>
          <p style={{ color: "#e05252", fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>⚠️ تعذّر تحميل طلباتك.</p>
          <button className="btn btn-primary" onClick={load} style={{ padding: "0 24px", height: 42 }}>حاول مجدداً</button>
        </div>
      )}

      {!unauthed && !loadError && orders === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }} aria-hidden>
          {[0, 1, 2].map((i) => (
            <div className="skeleton-row" key={i}>
              <div className="skeleton skeleton-circle" style={{ width: 40, height: 40, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton skeleton-text" style={{ width: "55%" }} />
                <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                <div className="skeleton skeleton-text" style={{ width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!unauthed && !loadError && orders?.length === 0 && (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 10 }}>🧾</span>
          <b style={{ fontSize: 16, display: "block", marginBottom: 4 }}>لا توجد طلبات بعد</b>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>أول طلب لك بينتظرك… جرّب أشهى أصناف فايف هاندرد</p>
          <Link href="/menu" className="btn btn-primary" style={{ padding: "0 26px", height: 46, display: "inline-flex", alignItems: "center" }}>تصفّح المنيو</Link>
        </div>
      )}

      {!unauthed && !loadError && orders && orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {orders.map((o) => (
            <Link key={o.id} href={`/success?order=${o.id}`} className="card" style={{ padding: 16, borderRadius: 18, display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b className="price" style={{ fontSize: 15 }}>{o.shortId}</b>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: STATUS_COLOR[o.status] || "#888", padding: "4px 10px", borderRadius: 8 }}>
                  {STATUS_AR[o.status] || o.status}
                </span>
              </div>
              <div style={{ margin: "8px 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                {o.items.map((i, k) => (
                  <span key={k}>× {i.qty} {i.name}{k < o.items.length - 1 ? "، " : ""}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="muted" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString("ar-SA")}</span>
                <b className="price" style={{ fontSize: 15 }}>{formatSAR(o.totalHalalas)}</b>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .round { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}
