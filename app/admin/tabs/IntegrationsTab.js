"use client";
import { useEffect, useState, useCallback } from "react";
import { RetryBlock } from "./shared";

const STATUS_BADGE = {
  connected: { label: "متصل ✓", color: "#46c37b" },
  error: { label: "خطأ", color: "#e05252" },
  unknown: { label: "لم يُختبر", color: "#8f8f97" },
};

export default function IntegrationsTab() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [storeIdDraft, setStoreIdDraft] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/integrations")
      .then((r) => r.json())
      .then((d) => {
        if (!d || !d.integrations) { setLoadError(true); return; }
        setData(d);
        setLoadError(false);
        const loyverse = d.integrations?.find((i) => i.key === "loyverse");
        setStoreIdDraft(loyverse?.config?.storeId || "");
      })
      .catch((e) => { console.error("admin integrations load failed", e); setLoadError(true); });
  }, []);
  useEffect(load, [load]);

  if (data === null && loadError) return <RetryBlock message="تعذّر تحميل بيانات التكاملات." onRetry={load} />;
  if (data === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  const loyverse = data.integrations.find((i) => i.key === "loyverse");
  const badge = STATUS_BADGE[loyverse?.status] || STATUS_BADGE.unknown;

  const toggleLoyverse = async (enabled) => {
    setActionError("");
    try {
      const res = await fetch("/api/admin/integrations/loyverse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("toggle loyverse failed", e); setActionError("تعذّر تحديث حالة التكامل."); }
  };

  const saveStoreId = async () => {
    setActionError("");
    try {
      const res = await fetch("/api/admin/integrations/loyverse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: { storeId: storeIdDraft.trim() } }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("save storeId failed", e); setActionError("تعذّر حفظ Store ID."); }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/admin/integrations/loyverse/test", { method: "POST" });
      const d = await res.json();
      setTestMsg(d);
    } catch {
      setTestMsg({ ok: false, message: "تعذّر الاتصال بالسيرفر." });
    } finally {
      setTesting(false);
      load();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {actionError && <p style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700, textAlign: "center" }}>⚠️ {actionError}</p>}
      {/* Moyasar */}
      <div className="card" style={{ padding: 16 }}>
        <b style={{ fontSize: 15 }}>💳 Moyasar</b>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, fontSize: 13 }}>
          <StatusRow label="Publishable Key" ok={data.moyasar.publishableKeyConfigured} />
          <StatusRow label="Secret Key" ok={data.moyasar.secretKeyConfigured} />
          <StatusRow label="Webhook Secret" ok={data.moyasar.webhookSecretConfigured} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span className="muted">البيئة</span>
            <span style={{ fontWeight: 800, color: data.moyasar.mode === "production" ? "#f5a623" : "var(--text-2)" }}>
              {data.moyasar.mode === "production" ? "Production" : data.moyasar.mode === "sandbox" ? "Sandbox" : "—"}
            </span>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
          تُضبط المفاتيح عبر Environment Variables (MOYASAR_PUBLISHABLE_KEY، MOYASAR_SECRET_KEY، MOYASAR_WEBHOOK_SECRET) — لا يمكن إدخالها من هنا لأسباب أمنية.
        </p>
      </div>

      {/* Loyverse */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b style={{ fontSize: 15 }}>🧾 Loyverse POS</b>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: badge.color, padding: "4px 10px", borderRadius: 8 }}>{badge.label}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>تفعيل التكامل</span>
          <button onClick={() => toggleLoyverse(!loyverse.enabled)}
            role="switch" aria-checked={loyverse.enabled} aria-label="تفعيل تكامل Loyverse POS"
            style={{ width: 50, height: 28, borderRadius: 14, background: loyverse.enabled ? "var(--orange)" : "var(--surface)", border: "1px solid var(--hairline)", position: "relative", transition: "0.2s" }}>
            <span style={{ position: "absolute", top: 2, [loyverse.enabled ? "right" : "left"]: 2, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "0.2s" }} />
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <StatusRow label="Access Token (env)" ok={loyverse.secretsConfigured} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 4 }}>Store ID</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={storeIdDraft} onChange={(e) => setStoreIdDraft(e.target.value)}
              placeholder="Loyverse Store ID"
              aria-label="Loyverse Store ID"
              style={{ flex: 1, height: 40, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 12px", fontSize: 13 }} />
            <button className="btn btn-ghost" onClick={saveStoreId} style={{ height: 40, padding: "0 14px", fontSize: 13 }}>حفظ</button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={testConnection} disabled={testing} style={{ marginTop: 14 }}>
          {testing ? "جاري الاختبار..." : "Test Connection"}
        </button>

        {testMsg && (
          <p style={{ fontSize: 12.5, fontWeight: 700, marginTop: 10, color: testMsg.ok ? "#46c37b" : "#e05252" }}>
            {testMsg.ok ? "✓" : "⚠️"} {testMsg.message}
          </p>
        )}

        {loyverse.lastError && !testMsg && (
          <p style={{ fontSize: 12, marginTop: 10, color: "#e05252" }}>آخر خطأ: {loyverse.lastError}</p>
        )}

        <p className="muted" style={{ fontSize: 11.5, marginTop: 12 }}>
          الـ Access Token يُضبط عبر LOYVERSE_ACCESS_TOKEN في Environment Variables. عند التعطيل يستمر الموقع بالعمل طبيعياً دون أي تأثير على الطلبات أو الدفع.
        </p>
      </div>
    </div>
  );
}

function StatusRow({ label, ok }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 800, color: ok ? "#46c37b" : "#e05252" }}>{ok ? "مضبوط ✓" : "غير مضبوط"}</span>
    </div>
  );
}
