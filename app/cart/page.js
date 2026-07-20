"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I } from "@/components/Icons";
import { useCart } from "@/context/CartContext";
import { money } from "@/data/menu";

export default function CartPage() {
  const { items, setQty, remove, subtotal, count } = useCart();
  const router = useRouter();
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + tax;

  return (
    <div className="app" style={{ paddingBottom: 150 }}>
      <header className="pad c-head reveal">
        <button className="round card" onClick={() => router.back()} aria-label="رجوع"><I.back /></button>
        <div>
          <h1 className="display">سلّتك</h1>
          <p className="muted">{count} صنف</p>
        </div>
      </header>

      {count === 0 ? (
        <div className="empty reveal d1">
          <img src="/brand-astronaut.jpg" alt="" className="empty-mascot" />
          <h2>سلّتك فاضية</h2>
          <p className="muted">رائد فايف هاندرد جاهز… أضف ألذّ برجر وابدأ رحلتك</p>
          <Link href="/menu" className="btn btn-primary" style={{ padding: "0 30px", marginTop: 20 }}>
            تصفّح المنيو
          </Link>
        </div>
      ) : (
        <>
          <div className="pad items">
            {items.map((it, i) => (
              <div className="ci reveal" style={{ animationDelay: `${0.05 * i}s` }} key={it.key}>
                <div className="ci-img">
                  {it.img ? <img src={it.img} alt={it.name} /> : <span className="ci-emoji">{it.emoji || "🍔"}</span>}
                </div>
                <div className="ci-body">
                  <h3>{it.name}</h3>
                  <span className="ci-size muted">{it.size === "large" ? "كبير" : "عادي"}</span>
                  <span className="price">{money(it.price * it.qty)}</span>
                </div>
                <div className="ci-actions">
                  <button className="ci-del" onClick={() => remove(it.key)} aria-label="حذف"><I.trash /></button>
                  <div className="ci-stepper">
                    <button className="ci-plus" onClick={() => setQty(it.key, it.qty + 1)}>+</button>
                    <span className="ci-qv">{it.qty}</span>
                    <button className="ci-minus" onClick={() => setQty(it.key, it.qty - 1)}>−</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="pad">
            <div className="promo-in card reveal">
              <span>🎁</span>
              <input placeholder="كود الخصم" />
              <button className="promo-apply">تطبيق</button>
            </div>
          </div>

          {/* Summary */}
          <div className="pad">
            <div className="summary card reveal">
              <Row label="المجموع الفرعي" value={money(subtotal)} />
              <Row label="ضريبة (15%)" value={money(tax)} />
              <div className="divider" />
              <Row label="الإجمالي" value={money(total)} big />
            </div>
          </div>

          {/* Checkout bar */}
          <div className="checkoutbar glass">
            <div className="cb-total">
              <span className="muted">الإجمالي</span>
              <b className="price">{money(total)}</b>
            </div>
            <button className="cb-btn" onClick={() => router.push("/checkout")}>
              إتمام الطلب <I.back style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .c-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 6px;
        }
        .round {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .c-head h1 {
          font-size: 26px;
          font-weight: 900;
        }
        .c-head p {
          font-size: 13px;
        }
        .items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }
        .ci {
          display: flex;
          align-items: stretch;
          gap: 14px;
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-radius: 22px;
          padding: 14px;
        }
        .ci-img {
          width: 96px;
          height: 96px;
          border-radius: 18px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ci-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ci-emoji {
          font-size: 40px;
        }
        .ci-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
        }
        .ci-body h3 {
          font-size: 16px;
          font-weight: 800;
          line-height: 1.3;
        }
        .ci-size {
          font-size: 12px;
          font-weight: 600;
        }
        .ci-body .price {
          font-size: 17px;
          margin-top: 2px;
        }
        .ci-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          padding: 2px 0;
        }
        .ci-del {
          color: var(--text-3);
          padding: 4px;
        }
        .ci-del:active {
          color: #e05252;
        }
        .ci-stepper {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          background: var(--surface-2);
          border-radius: 16px;
          padding: 6px 8px;
        }
        .ci-stepper button {
          width: 26px;
          height: 26px;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-2);
        }
        .ci-plus {
          color: var(--orange);
        }
        .ci-qv {
          font-size: 13px;
          font-weight: 800;
          min-width: 16px;
          text-align: center;
        }

        .promo-in {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 54px;
          padding: 0 8px 0 16px;
          margin-top: 16px;
        }
        .promo-in input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
        }
        .promo-apply {
          height: 40px;
          padding: 0 18px;
          border-radius: 13px;
          background: var(--surface-2);
          color: var(--text);
          font-weight: 700;
          font-size: 13px;
        }

        .summary {
          padding: 18px;
          margin-top: 16px;
        }
        .divider {
          height: 1px;
          background: var(--hairline);
          margin: 12px 0;
        }

        .checkoutbar {
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
        .cb-total {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }
        .cb-total .muted {
          font-size: 11px;
        }
        .cb-total b {
          font-size: 20px;
        }
        .cb-btn {
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
          gap: 8px;
          box-shadow: var(--glow-orange), 0 12px 28px -12px rgba(236, 106, 44, 0.8);
          transition: transform 0.15s;
        }
        .cb-btn:active {
          transform: scale(0.97);
        }

        .empty {
          text-align: center;
          padding: 70px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-mascot {
          width: 130px;
          height: 146px;
          object-fit: cover;
          border-radius: 20px;
          margin-bottom: 20px;
          border: 1px solid var(--hairline-strong);
          box-shadow: var(--glow-purple);
        }
        .empty h2 {
          font-size: 22px;
          font-weight: 900;
        }
        .empty p {
          font-size: 14px;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
      <span className={big ? "" : "muted"} style={{ fontSize: big ? 16 : 14, fontWeight: big ? 800 : 600 }}>{label}</span>
      <span className="price" style={{ fontSize: big ? 22 : 15, color: big ? "var(--orange)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
