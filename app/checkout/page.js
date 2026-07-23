"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { I } from "@/components/Icons";
import { useCart } from "@/context/CartContext";
import { money } from "@/data/menu";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, count, clear } = useCart();
  const [plateLetters, setPlateLetters] = useState("");
  const [plateNumbers, setPlateNumbers] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState("apple");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState(null); // { code, discountHalalas }
  const [discountChecking, setDiscountChecking] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // ملاحظة: هذه الأرقام للعرض فقط — الإجمالي المعتمد يُحسب في السيرفر.
  const subtotalHalalas = Math.round(subtotal * 100);
  const discountHalalas = discount ? discount.discountHalalas : 0;
  const taxableHalalas = subtotalHalalas - discountHalalas;
  const tax = Math.round(taxableHalalas * 0.15);
  const total = Math.round((taxableHalalas + tax) / 100);

  const applyDiscount = async () => {
    if (!discountInput.trim()) return;
    setDiscountChecking(true);
    setDiscountError("");
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput.trim(), subtotalHalalas }),
      });
      const data = await res.json();
      if (!res.ok) { setDiscountError("كود غير صالح أو منتهي."); setDiscount(null); }
      else setDiscount(data);
    } catch {
      setDiscountError("تعذّر التحقق من الكود.");
    } finally {
      setDiscountChecking(false);
    }
  };

  const onPlateLetters = (e) => {
    const v = e.target.value
      .replace(/[^a-zA-Zء-ي]/g, "")
      .toUpperCase()
      .slice(0, 3);
    setPlateLetters(v);
  };
  const onPlateNumbers = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setPlateNumbers(v);
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim() || items.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const plate = [plateLetters, plateNumbers].filter(Boolean).join(" ").trim();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, size: i.size, qty: i.qty })),
          customerName: name.trim(),
          customerPhone: phone.trim(),
          plate: plate || null,
          discountCode: discount?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "تعذّر إنشاء الطلب. تحقّق من البيانات وحاول مجدداً.");
        setSubmitting(false);
        return;
      }
      // إلى الدفع مع معرّف الطلب — الإجمالي المعتمد يأتي من السيرفر هناك.
      router.push(`/payment?order=${data.orderId}`);
    } catch (e) {
      setError("تعذّر الاتصال بالخادم. حاول مجدداً.");
      setSubmitting(false);
    }
  };

  return (
    <div className="app" style={{ paddingBottom: 130 }}>
      <header className="pad c-head reveal">
        <button className="round card" onClick={() => router.back()} aria-label="رجوع"><I.back /></button>
        <h1 className="display">إتمام الطلب</h1>
      </header>

      {/* Pickup mode label */}
      <div className="pad">
        <div className="pickup-badge reveal d1">
          <span>🏃</span> استلام من الفرع
        </div>
      </div>

      {/* Car plate (optional) */}
      <div className="pad">
        <div className="block-head">رقم لوحة السيارة <span className="opt">(اختياري — للسيارة)</span></div>
        <div className="plate-box reveal d1" dir="ltr">
          <input
            className="plate-letters"
            placeholder="ABC"
            value={plateLetters}
            onChange={onPlateLetters}
          />
          <span className="plate-sep" />
          <input
            className="plate-numbers"
            placeholder="1234"
            value={plateNumbers}
            onChange={onPlateNumbers}
            inputMode="numeric"
          />
          <div className="plate-ksa">
            <span>KSA</span>
            <span>سعودي</span>
          </div>
        </div>
        <p className="plate-hint muted">عشان الموظف يوصّل طلبك لسيارتك بسهولة عند وصولك</p>
      </div>

      {/* Customer name */}
      <div className="pad">
        <div className="block-head">الاسم</div>
        <div className="field card reveal d2">
          <I.user />
          <input
            placeholder="اسمك الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="pad">
        <div className="block-head">رقم الجوال</div>
        <div className="field card reveal d3" dir="ltr">
          <span style={{ fontWeight: 800, color: "var(--text-2)" }}>+966</span>
          <input
            placeholder="5X XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            style={{ textAlign: "left" }}
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="pad">
        <div className="block-head">طريقة الدفع</div>
        <div className="pay-opts reveal d4">
          <button className={`pay-opt ${pay === "apple" ? "on" : ""}`} onClick={() => setPay("apple")}>
            <span className="pay-ic"> Pay</span>
            <span className="pay-label">Apple Pay</span>
            {pay === "apple" && <span className="pay-check">✓</span>}
          </button>
          <button className={`pay-opt ${pay === "cash" ? "on" : ""}`} onClick={() => setPay("cash")}>
            <span className="pay-ic">💵</span>
            <span className="pay-label">كاش</span>
            {pay === "cash" && <span className="pay-check">✓</span>}
          </button>
        </div>
      </div>

      {/* Discount code */}
      <div className="pad">
        <div className="block-head">كود الخصم <span className="opt">(اختياري)</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="field card" style={{ flex: 1 }} dir="ltr">
            <input
              placeholder="CODE"
              value={discountInput}
              onChange={(e) => { setDiscountInput(e.target.value); setDiscountError(""); }}
              style={{ textAlign: "left", textTransform: "uppercase" }}
              disabled={!!discount}
            />
          </div>
          {discount ? (
            <button className="btn btn-ghost" onClick={() => { setDiscount(null); setDiscountInput(""); }} style={{ height: 56, padding: "0 16px", color: "#e05252" }}>إزالة</button>
          ) : (
            <button className="btn btn-primary" onClick={applyDiscount} disabled={discountChecking || !discountInput.trim()} style={{ height: 56, padding: "0 20px" }}>
              {discountChecking ? "..." : "تطبيق"}
            </button>
          )}
        </div>
        {discountError && <p style={{ color: "#e05252", fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>⚠️ {discountError}</p>}
        {discount && <p style={{ color: "#46c37b", fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>✓ تم تطبيق الكود {discount.code}</p>}
      </div>

      {/* Summary */}
      <div className="pad">
        <div className="summary card reveal d5">
          <Row label={`المجموع (${count})`} value={money(subtotal)} />
          {discount && <Row label="الخصم" value={`- ${money(discountHalalas / 100)}`} />}
          <Row label="ضريبة (15%)" value={money(tax / 100)} />
          <div className="divider" />
          <Row label="الإجمالي" value={money(total)} big />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pad">
          <div style={{ background: "rgba(224,82,82,0.12)", color: "#e05252", border: "1px solid rgba(224,82,82,0.3)", borderRadius: 14, padding: "12px 16px", fontSize: 13.5, fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="pad" style={{ marginTop: 10 }}>
        <button
          className={`submit-btn reveal d6 ${submitting ? "loading" : ""}`}
          onClick={submit}
          disabled={submitting || !name.trim() || !phone.trim()}
        >
          {submitting ? "جاري الإرسال..." : `إتمام ودفع الطلب · ${money(total)}`}
        </button>
      </div>

      <style jsx>{`
        .c-head { display: flex; align-items: center; gap: 14px; padding-top: 6px; }
        .round { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .c-head h1 { font-size: 24px; font-weight: 900; }

        .pickup-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 10px 18px;
          border-radius: 14px;
          background: var(--purple-soft);
          color: var(--purple-bright);
          font-weight: 800;
          font-size: 14px;
        }

        .block-head {
          margin: 20px 0 8px;
          font-size: 15px;
          font-weight: 800;
        }
        .opt {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
        }

        .plate-box {
          display: flex;
          align-items: stretch;
          height: 58px;
          border-radius: 14px;
          overflow: hidden;
          background: #f2ece1;
          border: 2px solid #d8cdb8;
        }
        .plate-letters,
        .plate-numbers {
          background: none;
          border: none;
          outline: none;
          color: #17171b;
          font-family: var(--font-rubik), sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 5px;
          text-align: center;
        }
        .plate-letters {
          width: 88px;
          flex-shrink: 0;
        }
        .plate-numbers {
          flex: 1;
          min-width: 0;
        }
        .plate-letters::placeholder,
        .plate-numbers::placeholder {
          color: #b5ab98;
          letter-spacing: 5px;
        }
        .plate-sep {
          width: 1px;
          margin: 12px 0;
          background: #d8cdb8;
          flex-shrink: 0;
        }
        .plate-ksa {
          flex-shrink: 0;
          width: 58px;
          background: #17171b;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-weight: 800;
        }
        .plate-ksa span:first-child {
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .plate-ksa span:last-child {
          font-size: 9.5px;
          font-weight: 700;
          font-family: var(--font-tajawal), sans-serif;
        }
        .plate-hint {
          font-size: 11.5px;
          margin-top: 8px;
        }

        .field {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 56px;
          padding: 0 16px;
          color: var(--text-2);
        }
        .field input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
        }

        .pay-opts {
          display: flex;
          gap: 10px;
        }
        .pay-opt {
          flex: 1;
          height: 72px;
          border-radius: 18px;
          background: var(--surface);
          border: 1.5px solid var(--hairline);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 700;
          font-size: 14px;
          transition: 0.2s;
          position: relative;
        }
        .pay-opt.on {
          border-color: var(--orange);
          background: var(--orange-soft);
        }
        .pay-ic {
          font-size: 20px;
        }
        .pay-label {
          font-size: 13px;
          font-weight: 700;
        }
        .pay-check {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 14px;
          font-weight: 900;
          color: var(--orange);
        }

        .summary { padding: 18px; margin-top: 10px; }
        .divider { height: 1px; background: var(--hairline); margin: 12px 0; }

        .submit-btn {
          width: 100%;
          height: 62px;
          border-radius: 20px;
          background: linear-gradient(140deg, var(--orange-bright), var(--orange));
          color: #fff;
          font-weight: 800;
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--glow-orange), 0 14px 34px -14px rgba(236, 106, 44, 0.8);
          transition: transform 0.15s, opacity 0.2s;
        }
        .submit-btn:active { transform: scale(0.97); }
        .submit-btn:disabled { opacity: 0.5; }
        .submit-btn.loading { opacity: 0.7; }
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
