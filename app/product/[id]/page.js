"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { I } from "@/components/Icons";
import { getProduct, money } from "@/data/menu";
import { useCart } from "@/context/CartContext";

export default function ProductPage({ params }) {
  const p = getProduct(params.id);
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState("reg");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!p) return <div className="app pad"><p style={{ marginTop: 40 }}>الصنف غير موجود</p></div>;

  const hasLarge = !!p.large;
  const unit = size === "large" ? p.large : p.reg;
  const total = unit * qty;

  const doAdd = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    add(p, size, qty, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="app" style={{ paddingBottom: 120 }}>
      {/* Media stage */}
      <div className="stage-media">
        <div className="stage-glow glowbg" />
        <div className="topbar pad">
          <button className="round glass" onClick={() => router.back()} aria-label="رجوع">
            <I.back />
          </button>
          <Link href="/menu" className="round glass" aria-label="المنيو">
            <I.grid />
          </Link>
        </div>

        {p.img ? (
          <Image src={p.img} alt={p.name} fill style={{ objectFit: "cover" }} className="stage-burger" />
        ) : (
          <div className="stage-emoji">{p.emoji || "🍔"}</div>
        )}

        <div className="stage-cal glass">
          <I.fire style={{ color: "var(--orange)" }} /> {p.cal ? `${p.cal} سعرة` : "منعش"}
        </div>
      </div>

      {/* Sheet */}
      <div className="sheet reveal">
        <div className="grip" />
        <div className="sheet-top">
          <div>
            {p.tag && <span className="p-tag">{p.tag}</span>}
            <h1 className="p-name">{p.name}</h1>
          </div>
          <div className="p-price price">{money(unit)}</div>
        </div>

        <p className="p-desc muted">{p.desc}</p>

        {p.ingredients && (
          <div className="ings hide-scroll">
            {p.ingredients.map((ing) => (
              <span className="ing" key={ing}>{ing}</span>
            ))}
          </div>
        )}

        {/* Size */}
        {hasLarge && (
          <div className="block">
            <div className="block-head">
              <span>الحجم</span>
              <span className="muted req">مطلوب</span>
            </div>
            <div className="seg">
              <button className={size === "reg" ? "on" : ""} onClick={() => setSize("reg")}>
                عادي · {money(p.reg)}
              </button>
              <button className={size === "large" ? "on" : ""} onClick={() => setSize("large")}>
                كبير · {money(p.large)}
              </button>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="block qty-block">
          <span>الكمية</span>
          <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="تقليل الكمية">−</button>
            <span className="qv" aria-live="polite">{qty}</span>
            <button className="plus" onClick={() => setQty(qty + 1)} aria-label="زيادة الكمية">+</button>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="actionbar glass">
        <div className="ab-total">
          <span className="muted">الإجمالي</span>
          <b className="price">{money(total)}</b>
        </div>
        <button className={`ab-btn ${added ? "ab-added" : ""}`} onClick={doAdd}>
          {added ? (
            <>تمت الإضافة ✓</>
          ) : (
            <>أضف للسلة <I.bag style={{ width: 20, height: 20 }} /></>
          )}
        </button>
      </div>

      <style jsx>{`
        .stage-media {
          position: relative;
          height: 400px;
          background: #0c0c0f;
          overflow: hidden;
        }
        .stage-media::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(to top, var(--bg) 0%, rgba(11, 11, 13, 0.45) 10%, transparent 26%);
          pointer-events: none;
        }
        .stage-glow { display: none; }
        .topbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          z-index: 5;
        }
        .round {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .stage-burger {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .stage-emoji {
          font-size: 150px;
          z-index: 3;
        }
        .stage-cal {
          position: absolute;
          bottom: 34px;
          right: 22px;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          padding: 8px 13px;
          border-radius: 13px;
        }

        .sheet {
          position: relative;
          margin-top: -26px;
          background: var(--bg);
          border-radius: 30px 30px 0 0;
          border-top: 1px solid var(--hairline-strong);
          padding: 14px 20px 20px;
          z-index: 6;
        }
        .grip {
          width: 42px;
          height: 4px;
          border-radius: 2px;
          background: var(--hairline-strong);
          margin: 0 auto 16px;
        }
        .sheet-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }
        .p-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          color: var(--orange);
          background: var(--orange-soft);
          padding: 3px 10px;
          border-radius: 9px;
          margin-bottom: 8px;
        }
        .p-name {
          font-size: 25px;
          font-weight: 900;
          line-height: 1.2;
        }
        .p-rate {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-top: 8px;
          color: var(--yellow-warm);
        }
        .p-rate .muted {
          font-weight: 600;
        }
        .p-price {
          font-size: 26px;
          color: #fff;
          white-space: nowrap;
        }
        .p-desc {
          font-size: 14px;
          line-height: 1.7;
          margin-top: 14px;
        }
        .ings {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .ing {
          flex-shrink: 0;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-2);
          background: var(--surface);
          border: 1px solid var(--hairline);
          padding: 8px 14px;
          border-radius: 12px;
        }
        .block {
          margin-top: 22px;
        }
        .block-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 800;
        }
        .req {
          font-size: 11px;
          font-weight: 700;
          background: var(--purple-soft);
          color: var(--purple-bright);
          padding: 3px 10px;
          border-radius: 8px;
        }
        .qty-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
          font-weight: 800;
        }

        .actionbar {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 404px;
          height: 74px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px 0 18px;
          z-index: 60;
          box-shadow: var(--shadow-soft);
        }
        .ab-total {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .ab-total .muted {
          font-size: 11px;
        }
        .ab-total b {
          font-size: 20px;
        }
        .ab-btn {
          flex: 1;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(140deg, var(--orange-bright), var(--orange));
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: var(--glow-orange), 0 12px 28px -12px rgba(236, 106, 44, 0.8);
          transition: transform 0.15s;
        }
        .ab-btn:active {
          transform: scale(0.97);
        }
        .ab-added {
          background: linear-gradient(140deg, #27ae60, #1e8449) !important;
          box-shadow: 0 0 40px -8px rgba(39, 174, 96, 0.6), 0 12px 28px -12px rgba(39, 174, 96, 0.7) !important;
          animation: btnPop 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes btnPop {
          0% { transform: scale(0.92); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }

      `}</style>
    </div>
  );
}
