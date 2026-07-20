"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GridCard } from "@/components/ProductCard";
import { I } from "@/components/Icons";
import { categories, products } from "@/data/menu";

function MenuInner() {
  const sp = useSearchParams();
  const initial = sp.get("cat") || "all";
  const [cat, setCat] = useState(initial);
  const [q, setQ] = useState("");

  let list = cat === "all" ? products : products.filter((p) => p.cat === cat);
  if (q.trim()) list = list.filter((p) => p.name.includes(q.trim()));

  return (
    <div className="app">
      <header className="pad menu-head reveal">
        <h1 className="display">المنيو</h1>
        <p className="muted">اختر صنفك المفضّل من فايف هاندرد</p>
      </header>

      <div className="pad">
        <div className="msearch card reveal d1">
          <I.search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن برجر، فرايز، صوص…"
          />
        </div>
      </div>

      <div className="catbar-wrap">
        <div className="catbar hide-scroll pad">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${cat === c.id ? "active" : ""}`}
              onClick={() => setCat(c.id)}
            >
              <span style={{ fontSize: 15 }}>{c.icon}</span> {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="pad count-line muted reveal d2">
        {list.length} صنف {cat !== "all" && `· ${categories.find((c) => c.id === cat)?.name}`}
      </div>

      <div className="pad menu-grid">
        {list.map((p, i) => (
          <GridCard p={p} key={p.id} delay={0.03 * i} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="pad empty muted">ما لقينا نتائج… جرّب كلمة ثانية</div>
      )}

      <style jsx>{`
        .menu-head {
          padding-top: 6px;
        }
        .menu-head h1 {
          font-size: 30px;
          font-weight: 900;
        }
        .menu-head p {
          font-size: 13.5px;
          margin-top: 4px;
        }
        .msearch {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 54px;
          padding: 0 18px;
          margin-top: 14px;
          color: var(--text-2);
        }
        .msearch input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
        }
        .catbar-wrap {
          position: sticky;
          top: 0;
          z-index: 30;
          background: linear-gradient(var(--bg) 70%, transparent);
          padding: 14px 0 8px;
        }
        .catbar {
          display: flex;
          gap: 10px;
        }
        .count-line {
          font-size: 13px;
          font-weight: 600;
          margin: 6px 0 12px;
        }
        .empty {
          text-align: center;
          padding: 50px 0;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="app" />}>
      <MenuInner />
    </Suspense>
  );
}
