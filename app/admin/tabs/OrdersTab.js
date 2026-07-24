"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";
import { RetryBlock } from "./shared";

const NEXT_ACTION = {
  paid: { to: "preparing", label: "ابدأ التحضير 👨‍🍳" },
  preparing: { to: "ready", label: "جاهز للاستلام 🛍️" },
  ready: { to: "completed", label: "تم التسليم ✓" },
};
const STATUS_AR = { paid: "مدفوع", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل", cancelled: "ملغى" };
const STATUS_COLOR = { paid: "#f5a623", preparing: "#ec6a2c", ready: "#46c37b", completed: "#7f8c8d", cancelled: "#e05252" };

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/orders${q}`)
      .then((r) => r.json())
      .then((d) => { if (d.orders) { setOrders(d.orders); setError(false); } else setError(true); })
      .catch((e) => { console.error("admin orders load failed", e); setError(true); });
  }, [filter]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    setActionError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) load();
      else setActionError("تعذّر تحديث حالة الطلب. حاول مجدداً.");
    } catch (e) {
      console.error("admin order status update failed", e);
      setActionError("تعذّر الاتصال بالخادم.");
    }
  };

  const filters = [["", "الكل"], ["paid", "جديد"], ["preparing", "تحضير"], ["ready", "جاهز"], ["completed", "مكتمل"]];

  return (
    <div>
      <div className="hide-scroll" role="tablist" aria-label="تصفية الطلبات حسب الحالة" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
        {filters.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            role="tab" aria-selected={filter === v}
            style={{ flexShrink: 0, minHeight: 44, padding: "6px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
              background: filter === v ? "var(--purple)" : "var(--surface)", color: filter === v ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>
            {l}
          </button>
        ))}
      </div>

      {actionError && (
        <p style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>⚠️ {actionError}</p>
      )}

      {error ? (
        <RetryBlock message="تعذّر تحميل الطلبات." onRetry={load} />
      ) : orders.length === 0 ? (
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
