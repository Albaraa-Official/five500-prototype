"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";

const NEXT_ACTION = {
  paid: { to: "preparing", label: "ابدأ التحضير 👨‍🍳" },
  preparing: { to: "ready", label: "جاهز للاستلام 🛍️" },
  ready: { to: "completed", label: "تم التسليم ✓" },
};
const STATUS_AR = { paid: "مدفوع", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل", cancelled: "ملغى" };
const STATUS_COLOR = { paid: "#f5a623", preparing: "#ec6a2c", ready: "#46c37b", completed: "#7f8c8d", cancelled: "#e05252" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/login").then((r) => r.json()).then((d) => setAuthed(d.admin)).catch(() => setAuthed(false));
  }, []);

  const load = useCallback(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/orders${q}`)
      .then((r) => r.json())
      .then((d) => { if (d.orders) setOrders(d.orders); })
      .catch(() => {});
  }, [filter]);

  useEffect(() => {
    if (!authed) return;
    load();
    const t = setInterval(load, 5000); // تحديث تلقائي كل 5 ثوانٍ
    return () => clearInterval(t);
  }, [authed, load]);

  const login = async () => {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) setAuthed(true);
    else setError("كلمة المرور غير صحيحة.");
  };

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  };

  if (authed === null) return <div className="app pad"><p style={{ marginTop: 40 }}>…</p></div>;

  if (!authed) {
    return (
      <div className="app pad" style={{ maxWidth: 360, margin: "0 auto" }}>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 900, marginTop: 30 }}>🔒 لوحة المطبخ</h1>
        <p className="muted" style={{ fontSize: 14, margin: "10px 0 20px" }}>أدخل كلمة مرور الموظفين.</p>
        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
          placeholder="كلمة المرور" onKeyDown={(e) => e.key === "Enter" && login()}
          style={{ width: "100%", height: 52, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 16px", fontSize: 15, fontWeight: 600 }} />
        <button className="btn btn-primary btn-block" onClick={login} style={{ marginTop: 14 }}>دخول</button>
        {error && <p style={{ color: "#e05252", fontSize: 13, marginTop: 12, fontWeight: 700 }}>⚠️ {error}</p>}
      </div>
    );
  }

  const filters = [["", "الكل"], ["paid", "جديد"], ["preparing", "تحضير"], ["ready", "جاهز"], ["completed", "مكتمل"]];

  return (
    <div className="app pad" style={{ paddingBottom: 40 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <h1 className="display" style={{ fontSize: 22, fontWeight: 900 }}>🍔 المطبخ</h1>
        <span className="muted" style={{ fontSize: 12 }}>تحديث تلقائي · {orders.length} طلب</span>
      </header>

      <div className="hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0" }}>
        {filters.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 800,
              background: filter === v ? "var(--orange)" : "var(--surface)", color: filter === v ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>
            {l}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: 40 }}>لا طلبات في هذه الحالة.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => {
            const action = NEXT_ACTION[o.status];
            return (
              <div key={o.id} className="card" style={{ padding: 16, borderRadius: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b className="price" style={{ fontSize: 16 }}>{o.shortId}</b>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: STATUS_COLOR[o.status], padding: "4px 10px", borderRadius: 8 }}>{STATUS_AR[o.status] || o.status}</span>
                </div>
                <div style={{ margin: "10px 0", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.7 }}>
                  {o.items.map((i, k) => <div key={k}>× {i.qty} {i.name} <span className="muted">({i.size === "large" ? "كبير" : "عادي"})</span></div>)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }} className="muted">
                  <span>{o.customerName} · {o.customerPhone}{o.plate ? ` · 🚗 ${o.plate}` : ""}</span>
                  <b className="price" style={{ fontSize: 15 }}>{formatSAR(o.totalHalalas)}</b>
                </div>
                {action && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" style={{ flex: 1, height: 44, fontSize: 14 }} onClick={() => setStatus(o.id, action.to)}>{action.label}</button>
                    {o.status !== "ready" && <button className="btn btn-ghost" style={{ height: 44, fontSize: 13, color: "#e05252", padding: "0 14px" }} onClick={() => setStatus(o.id, "cancelled")}>إلغاء</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
