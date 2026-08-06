"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";
import { RetryBlock } from "./shared";

export default function CustomersTab() {
  const [customers, setCustomers] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => { if (d.customers) { setCustomers(d.customers); setLoadError(false); } else setLoadError(true); })
      .catch((e) => { console.error("admin customers load failed", e); setLoadError(true); });
  }, []);
  useEffect(load, [load]);

  if (customers === null && loadError) return <RetryBlock message="تعذّر تحميل العملاء." onRetry={load} />;
  if (customers === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;
  if (customers.length === 0) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>لا يوجد عملاء بعد.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {customers.map((c) => (
        <div key={c.id} className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <b>{c.name || "بدون اسم"}</b>
            <div className="muted ltr" style={{ fontSize: 12.5 }}>{c.phoneE164}</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <b className="price" style={{ fontSize: 14 }}>{formatSAR(c.totalSpentHalalas)}</b>
            <div className="muted" style={{ fontSize: 12 }}>{c.ordersCount} طلب</div>
          </div>
        </div>
      ))}
    </div>
  );
}
