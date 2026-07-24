"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";
import { RetryBlock } from "./shared";

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d && d.today) { setStats(d); setLoadError(false); } else setLoadError(true); })
      .catch((e) => { console.error("admin stats load failed", e); setLoadError(true); });
  }, []);
  useEffect(load, [load]);

  if (!stats && loadError) return <RetryBlock message="تعذّر تحميل الإحصائيات." onRetry={load} />;
  if (!stats) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard label="اليوم" count={stats.today.count} total={stats.today.totalHalalas} />
        <StatCard label="آخر 7 أيام" count={stats.last7Days.count} total={stats.last7Days.totalHalalas} />
        <StatCard label="آخر 30 يوم" count={stats.last30Days.count} total={stats.last30Days.totalHalalas} />
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <b className="price" style={{ fontSize: 22, display: "block" }}>{stats.totalCustomers}</b>
          <span className="muted" style={{ fontSize: 12 }}>إجمالي العملاء</span>
        </div>
      </div>

      {stats.pendingCount > 0 && (
        <div className="card" style={{ padding: 14, marginBottom: 14, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)" }}>
          <b style={{ color: "#f5a623" }}>⏳ {stats.pendingCount} طلب قيد التنفيذ حالياً</b>
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 800, margin: "10px 0" }}>الأكثر مبيعاً (30 يوم)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stats.topProducts.map((p, i) => (
          <div key={p.productId} className="card" style={{ padding: 12, display: "flex", justifyContent: "space-between" }}>
            <span>{i + 1}. {p.name}</span>
            <b className="price">{p.qty} قطعة</b>
          </div>
        ))}
        {stats.topProducts.length === 0 && <p className="muted">لا بيانات بعد.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, count, total }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <b className="price" style={{ fontSize: 20, display: "block" }}>{formatSAR(total)}</b>
      <span className="muted" style={{ fontSize: 12 }}>{label} · {count} طلب</span>
    </div>
  );
}
