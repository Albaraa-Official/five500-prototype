"use client";
import { useEffect, useState, useCallback } from "react";
import { RetryBlock, Field } from "./shared";

export default function ProductsTab() {
  const [products, setProducts] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", category: "", emoji: "", priceRegHalalas: "", priceLargeHalalas: "" });
  const [err, setErr] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => { if (d.products) { setProducts(d.products); setLoadError(false); } else setLoadError(true); })
      .catch((e) => { console.error("admin products load failed", e); setLoadError(true); });
  }, []);
  useEffect(load, [load]);

  const toggleActive = async (p) => {
    setActionError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("toggleActive failed", e); setActionError("تعذّر تحديث حالة المنتج."); }
  };

  const updatePrice = async (p, size, value) => {
    const halalas = Math.round(parseFloat(value) * 100);
    if (isNaN(halalas)) return;
    const key = size === "reg" ? "priceRegHalalas" : "priceLargeHalalas";
    setActionError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: halalas }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("updatePrice failed", e); setActionError("تعذّر تحديث السعر."); }
  };

  const updateVariant = async (p, size, value) => {
    const key = size === "reg" ? "regLoyverseVariantId" : "largeLoyverseVariantId";
    setActionError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value || null }) });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("updateVariant failed", e); setActionError("تعذّر تحديث Loyverse variant."); }
  };

  const remove = async (p) => {
    if (!confirm(`حذف ${p.name}؟`)) return;
    setActionError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("bad status");
      load();
    } catch (e) { console.error("remove product failed", e); setActionError("تعذّر حذف المنتج."); }
  };

  const create = async () => {
    setErr("");
    if (!form.id || !form.name || !form.category || !form.priceRegHalalas) { setErr("عبّي الحقول المطلوبة."); return; }
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id.trim(), name: form.name.trim(), category: form.category.trim(), emoji: form.emoji.trim() || null,
        priceRegHalalas: Math.round(parseFloat(form.priceRegHalalas) * 100),
        priceLargeHalalas: form.priceLargeHalalas ? Math.round(parseFloat(form.priceLargeHalalas) * 100) : null,
      }),
    });
    if (res.ok) {
      setShowNew(false);
      setForm({ id: "", name: "", category: "", emoji: "", priceRegHalalas: "", priceLargeHalalas: "" });
      load();
    } else {
      const d = await res.json();
      setErr(d.error === "id_exists" ? "المعرّف مستخدم بالفعل." : "تعذّر الإنشاء.");
    }
  };

  if (products === null && loadError) return <RetryBlock message="تعذّر تحميل المنتجات." onRetry={load} />;
  if (products === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  return (
    <div>
      {actionError && <p style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>⚠️ {actionError}</p>}
      <button className="btn btn-primary btn-block" onClick={() => setShowNew((s) => !s)} style={{ marginBottom: 14 }}>
        {showNew ? "إلغاء" : "+ منتج جديد"}
      </button>

      {showNew && (
        <div className="card" style={{ padding: 14, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <Field label="المعرّف (id)" value={form.id} onChange={(v) => setForm((f) => ({ ...f, id: v }))} />
          <Field label="الاسم" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Field label="الفئة" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} />
          <Field label="إيموجي" value={form.emoji} onChange={(v) => setForm((f) => ({ ...f, emoji: v }))} />
          <Field label="سعر عادي (ريال)" value={form.priceRegHalalas} onChange={(v) => setForm((f) => ({ ...f, priceRegHalalas: v }))} />
          <Field label="سعر كبير (ريال، اختياري)" value={form.priceLargeHalalas} onChange={(v) => setForm((f) => ({ ...f, priceLargeHalalas: v }))} />
          {err && <span style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700 }}>{err}</span>}
          <button className="btn btn-primary" onClick={create}>إنشاء</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((p) => {
          const reg = p.prices.find((pr) => pr.size === "reg");
          const large = p.prices.find((pr) => pr.size === "large");
          return (
            <div key={p.id} className="card" style={{ padding: 14, opacity: p.active ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>{p.emoji} {p.name}</b>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => toggleActive(p)} style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: p.active ? "var(--surface)" : "#46c37b", color: p.active ? "var(--text-2)" : "#fff", border: "1px solid var(--hairline)" }}>
                    {p.active ? "متاح" : "غير متاح"}
                  </button>
                  <button onClick={() => remove(p)} style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: "none", color: "#e05252", border: "1px solid #e05252" }}>حذف</button>
                </div>
              </div>
              <span className="muted" style={{ fontSize: 12 }}>{p.category}</span>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <PriceInput label="عادي" value={reg?.priceHalalas} onSave={(v) => updatePrice(p, "reg", v)} />
                {large && <PriceInput label="كبير" value={large?.priceHalalas} onSave={(v) => updatePrice(p, "large", v)} />}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <VariantInput label="Loyverse variant (عادي)" value={reg?.loyverseVariantId} onSave={(v) => updateVariant(p, "reg", v)} />
                {large && <VariantInput label="Loyverse variant (كبير)" value={large?.loyverseVariantId} onSave={(v) => updateVariant(p, "large", v)} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VariantInput({ label, value, onSave }) {
  const [v, setV] = useState(value || "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
      <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>{label}</span>
      <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onSave(v)}
        placeholder="variant_id"
        style={{ flex: 1, minWidth: 0, height: 30, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 8px", fontSize: 11 }} />
    </div>
  );
}

function PriceInput({ label, value, onSave }) {
  const [v, setV] = useState((value / 100).toFixed(2));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span className="muted" style={{ fontSize: 12 }}>{label}</span>
      <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onSave(v)}
        style={{ width: 70, height: 34, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 8px", fontSize: 13, textAlign: "center" }} />
    </div>
  );
}
