"use client";
import { useEffect, useState, useCallback } from "react";
import { formatSAR } from "@/lib/money";

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
    fetch("/api/admin/login").then((r) => r.json()).then((d) => setAuthed(d.admin)).catch(() => setAuthed(false));
  }, []);

  const login = async () => {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) setAuthed(true);
    else setError("كلمة المرور غير صحيحة.");
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

      <div className="hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0" }}>
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 800,
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

/* ---------- الطلبات ---------- */
const NEXT_ACTION = {
  paid: { to: "preparing", label: "ابدأ التحضير 👨‍🍳" },
  preparing: { to: "ready", label: "جاهز للاستلام 🛍️" },
  ready: { to: "completed", label: "تم التسليم ✓" },
};
const STATUS_AR = { paid: "مدفوع", preparing: "قيد التحضير", ready: "جاهز", completed: "مكتمل", cancelled: "ملغى" };
const STATUS_COLOR = { paid: "#f5a623", preparing: "#ec6a2c", ready: "#46c37b", completed: "#7f8c8d", cancelled: "#e05252" };

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/orders${q}`).then((r) => r.json()).then((d) => { if (d.orders) setOrders(d.orders); }).catch(() => {});
  }, [filter]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  };

  const filters = [["", "الكل"], ["paid", "جديد"], ["preparing", "تحضير"], ["ready", "جاهز"], ["completed", "مكتمل"]];

  return (
    <div>
      <div className="hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
        {filters.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
              background: filter === v ? "var(--purple)" : "var(--surface)", color: filter === v ? "#fff" : "var(--text-2)", border: "1px solid var(--hairline)" }}>
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

/* ---------- المنتجات ---------- */
function ProductsTab() {
  const [products, setProducts] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", category: "", emoji: "", priceRegHalalas: "", priceLargeHalalas: "" });
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => { if (d.products) setProducts(d.products); }).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const toggleActive = async (p) => {
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }) });
    load();
  };

  const updatePrice = async (p, size, value) => {
    const halalas = Math.round(parseFloat(value) * 100);
    if (isNaN(halalas)) return;
    const key = size === "reg" ? "priceRegHalalas" : "priceLargeHalalas";
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: halalas }) });
    load();
  };

  const updateVariant = async (p, size, value) => {
    const key = size === "reg" ? "regLoyverseVariantId" : "largeLoyverseVariantId";
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value || null }) });
    load();
  };

  const remove = async (p) => {
    if (!confirm(`حذف ${p.name}؟`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
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

  if (products === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  return (
    <div>
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

function Field({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ height: 42, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 12px", fontSize: 14 }} />
    </label>
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

/* ---------- كودات الخصم ---------- */
function DiscountsTab() {
  const [discounts, setDiscounts] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "" });
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/discounts").then((r) => r.json()).then((d) => { if (d.discounts) setDiscounts(d.discounts); }).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const create = async () => {
    setErr("");
    if (!form.code || !form.value) { setErr("عبّي الحقول المطلوبة."); return; }
    const res = await fetch("/api/admin/discounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.code.trim(), type: form.type, value: parseInt(form.value, 10), maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null }),
    });
    if (res.ok) { setForm({ code: "", type: "percent", value: "", maxUses: "" }); load(); }
    else { const d = await res.json(); setErr(d.error === "code_exists" ? "الكود مستخدم بالفعل." : "تعذّر الإنشاء."); }
  };

  const toggle = async (d) => {
    await fetch(`/api/admin/discounts/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !d.active }) });
    load();
  };
  const remove = async (d) => {
    if (!confirm(`حذف الكود ${d.code}؟`)) return;
    await fetch(`/api/admin/discounts/${d.id}`, { method: "DELETE" });
    load();
  };

  if (discounts === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  return (
    <div>
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

/* ---------- العملاء ---------- */
function CustomersTab() {
  const [customers, setCustomers] = useState(null);
  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => { if (d.customers) setCustomers(d.customers); }).catch(() => {});
  }, []);

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

/* ---------- الإحصائيات ---------- */
function StatsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

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

/* ---------- Integrations ---------- */
const STATUS_BADGE = {
  connected: { label: "متصل ✓", color: "#46c37b" },
  error: { label: "خطأ", color: "#e05252" },
  unknown: { label: "لم يُختبر", color: "#8f8f97" },
};

function IntegrationsTab() {
  const [data, setData] = useState(null);
  const [storeIdDraft, setStoreIdDraft] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState(null);

  const load = useCallback(() => {
    fetch("/api/admin/integrations").then((r) => r.json()).then((d) => {
      setData(d);
      const loyverse = d.integrations?.find((i) => i.key === "loyverse");
      setStoreIdDraft(loyverse?.config?.storeId || "");
    }).catch(() => {});
  }, []);
  useEffect(load, [load]);

  if (data === null) return <p className="muted" style={{ textAlign: "center", padding: 40 }}>جاري التحميل…</p>;

  const loyverse = data.integrations.find((i) => i.key === "loyverse");
  const badge = STATUS_BADGE[loyverse?.status] || STATUS_BADGE.unknown;

  const toggleLoyverse = async (enabled) => {
    await fetch("/api/admin/integrations/loyverse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
    load();
  };

  const saveStoreId = async () => {
    await fetch("/api/admin/integrations/loyverse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: { storeId: storeIdDraft.trim() } }) });
    load();
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
