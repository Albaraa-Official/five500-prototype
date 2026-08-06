"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";
import { RetryBlock, Field } from "./shared";

export default function DiscountsTab() {
  const [discounts, setDiscounts] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "" });
  const [err, setErr] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/discounts")
      .then((r) => r.json())
      .then((d) => { if (d.discounts) { setDiscounts(d.discounts); setLoadError(false); } else setLoadError(true); })
      .catch((e) => { console.error("admin discounts load failed", e); setLoadError(true); });
  }, []);
  useEffect(load, [load]);

  const create = async () => {
    setErr("");
    if (!form.code || !form.value) { setErr("عبّي الحقول المطلوبة."); return; }
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.code.trim(), type: form.type, value: parseInt(form.value, 10), maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null }),
      });
      if (res.ok) { setForm({ code: "", type: "percent", value: "", maxUses: "" }); load(); }
      else { const d = await res.json(); setErr(d.error === "code_exists" ? "الكود مستخدم بالفعل." : "تعذّر الإنشاء."); }
    } catch (e) { console.error("create discount failed", e); setErr("تعذّر الاتصال بالخادم."); }
  };

  const toggle = async (d) => {
    setActionError("");
    try {
      const res = await fetch(`/api/admin/discounts/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !d.active }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("toggle discount failed", e); setActionError("تعذّر تحديث الكود."); }
  };
  const remove = async (d) => {
    if (!confirm(`حذف الكود ${d.code}؟`)) return;
    setActionError("");
    try {
      const res = await fetch(`/api/admin/discounts/${d.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("remove discount failed", e); setActionError("تعذّر حذف الكود."); }
  };

  if (discounts === null && loadError) return <RetryBlock message="تعذّر تحميل الخصومات." onRetry={load} />;
  if (discounts === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  return (
    <div>
      {actionError && <p style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>⚠️ {actionError}</p>}
      <div className="card" style={{ padding: 14, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <Field label="الكود" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v }))} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setForm((f) => ({ ...f, type: "percent" }))} style={{ flex: 1, height: 38, borderRadius: 10, fontWeight: 700, fontSize: 13, background: form.type === "percent" ? "var(--orange)" : "var(--surface)", color: form.type === "percent" ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>نسبة %</button>
          <button onClick={() => setForm((f) => ({ ...f, type: "fixed" }))} style={{ flex: 1, height: 38, borderRadius: 10, fontWeight: 700, fontSize: 13, background: form.type === "fixed" ? "var(--orange)" : "var(--surface)", color: form.type === "fixed" ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>مبلغ ثابت (هللة)</button>
        </div>
        <Field label={form.type === "percent" ? "القيمة (%)" : "القيمة (هللة)"} value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} />
        <Field label="أقصى عدد استخدام (اختياري)" value={form.maxUses} onChange={(v) => setForm((f) => ({ ...f, maxUses: v }))} />
        {err && <span style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700 }}>{err}</span>}
        <button className="btn btn-primary" onClick={create}>إنشاء كود</button>
      </div>

      {discounts.length === 0 && (
        <p className="muted" style={{ textAlign: "center", padding: 24 }}>لا توجد أكواد خصم بعد.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {discounts.map((d) => (
          <div key={d.id} className="card" style={{ padding: 14, opacity: d.active ? 1 : 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b className="price">{d.code}</b>
              <div className="muted" style={{ fontSize: 12 }}>
                {d.type === "percent" ? `${d.value}%` : formatSAR(d.value)} · استُخدم {d.uses}{d.maxUses ? `/${d.maxUses}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => toggle(d)} style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: d.active ? "var(--surface)" : "#46c37b", color: d.active ? "var(--text-2)" : "#fff", border: "1px solid var(--hairline)" }}>{d.active ? "مفعّل" : "معطّل"}</button>
              <button onClick={() => remove(d)} style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: "none", color: "#e05252", border: "1px solid #e05252" }}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
