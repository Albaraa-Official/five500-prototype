"use client";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { I } from "@/components/Icons";
import { useCart } from "@/context/CartContext";
import { formatSAR } from "@/lib/money";

function PaymentInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const { clear } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("apple");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // تحميل الطلب المعتمد من السيرفر (الإجمالي الموثوق)
  useEffect(() => {
    if (!orderId) {
      setError("لا يوجد طلب. ابدأ من السلة.");
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) setOrder(d.order);
        else setError("تعذّر العثور على الطلب.");
      })
      .catch(() => setError("تعذّر تحميل الطلب."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const totalHalalas = order?.totalHalalas ?? 0;

  const pay = async () => {
    setPaying(true);
    setError("");
    try {
      // 1) إنشاء الدفعة (المبلغ يأتي من السيرفر حسب الطلب)
      const cRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const cData = await cRes.json();
      if (!cRes.ok) {
        setError("تعذّر بدء الدفع.");
        setPaying(false);
        return;
      }

      // 2) وضع mock (لا يوجد Moyasar بعد): نحاكي تأكيد البوابة عبر منطق التسوية نفسه.
      if (cData.mode === "mock") {
        const mRes = await fetch("/api/payments/mock-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: cData.paymentId, outcome: "paid" }),
        });
        const mData = await mRes.json();
        if (!mData.ok) {
          setError("فشل تأكيد الدفع.");
          setPaying(false);
          return;
        }
      } else {
        // TODO(moyasar): توجيه المستخدم لواجهة Moyasar المستضافة؛ التأكيد يصل عبر webhook.
        setError("تكامل Moyasar لم يُفعّل بعد.");
        setPaying(false);
        return;
      }

      // 3) نجاح — نفرّغ السلة ونعرض صفحة الطلب
      clear();
      router.push(`/success?order=${orderId}`);
    } catch (e) {
      setError("تعذّر الاتصال بالخادم.");
      setPaying(false);
    }
  };

  return (
    <div className="app" style={{ paddingBottom: 130 }}>
      <header className="pad c-head reveal">
        <button className="round card" onClick={() => router.back()} aria-label="رجوع"><I.back /></button>
        <h1 className="display">الدفع</h1>
      </header>

      {/* Card visual */}
      <div className="pad">
        <div className="paycard reveal d1">
          <div className="pc-glow glowbg" />
          <div className="pc-top">
            <Image src="/logo.jpg" alt="FIVE 500" width={48} height={48} className="pc-logo" />
            <span className="pc-chip" />
          </div>
          <div className="pc-num ltr">•••• •••• •••• 0500</div>
          <div className="pc-bottom">
            <div>
              <span className="pc-lbl">حامل البطاقة</span>
              <b>{order?.customerName || "FIVE 500 GUEST"}</b>
            </div>
            <div>
              <span className="pc-lbl">تنتهي</span>
              <b className="ltr">05 / 28</b>
            </div>
          </div>
        </div>
      </div>

      {/* Methods */}
      <div className="pad">
        <div className="block-head"><span>اختر طريقة الدفع</span></div>
        <div className="methods">
          <Method id="apple" method={method} setMethod={setMethod} icon={<I.apple />} title="Apple Pay" sub="ادفع بلمسة عبر آيفون" badge="الأسرع" />
          <Method id="card" method={method} setMethod={setMethod} icon={<I.card />} title="بطاقة مدى / ائتمانية" sub="Visa · Mastercard · مدى" />
          <Method id="cash" method={method} setMethod={setMethod} icon={<I.cash />} title="الدفع نقداً" sub="عند الاستلام" />
        </div>
      </div>

      {error && (
        <div className="pad">
          <div style={{ background: "rgba(224,82,82,0.12)", color: "#e05252", border: "1px solid rgba(224,82,82,0.3)", borderRadius: 14, padding: "12px 16px", fontSize: 13.5, fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      <div className="pad note muted reveal d4">
        🔒 نموذج عرض — الدفع محاكى حتى تفعيل Moyasar. الإجمالي محسوب في الخادم.
      </div>

      {/* Pay bar */}
      <div className="checkoutbar glass">
        <div className="cb-total">
          <span className="muted">الإجمالي</span>
          <b className="price">{loading ? "…" : formatSAR(totalHalalas)}</b>
        </div>
        <button
          className={`cb-btn ${method === "apple" ? "apple" : ""}`}
          onClick={pay}
          disabled={paying || loading || !order}
        >
          {paying ? (
            <span className="spinner" />
          ) : method === "apple" ? (
            <><I.apple /> ادفع عبر Apple Pay</>
          ) : (
            <>تأكيد الدفع · {formatSAR(totalHalalas)}</>
          )}
        </button>
      </div>

      <style jsx>{`
        .c-head { display: flex; align-items: center; gap: 14px; padding-top: 6px; }
        .round { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .c-head h1 { font-size: 24px; font-weight: 900; }
        .paycard { position: relative; height: 200px; border-radius: 26px; margin-top: 12px; padding: 22px; overflow: hidden; background: linear-gradient(135deg, #2a1c3d 0%, #191225 45%, #0f0d15 100%); border: 1px solid var(--hairline-strong); box-shadow: var(--glow-purple), var(--shadow-card); display: flex; flex-direction: column; justify-content: space-between; }
        .pc-glow { position: absolute; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(236,106,44,0.4), transparent 60%); filter: blur(24px); top: -70px; right: -50px; }
        .pc-top { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .pc-logo { width: 54px; height: 54px; border-radius: 14px; object-fit: cover; }
        .pc-chip { width: 42px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--yellow-warm), #b8801f); }
        .pc-num { font-family: var(--font-rubik); font-size: 21px; font-weight: 700; letter-spacing: 2px; z-index: 2; }
        .pc-bottom { display: flex; justify-content: space-between; z-index: 2; }
        .pc-lbl { display: block; font-size: 10px; color: var(--text-3); margin-bottom: 3px; }
        .pc-bottom b { font-size: 14px; font-weight: 700; letter-spacing: 0.5px; }
        .block-head { margin: 26px 0 12px; font-size: 15px; font-weight: 800; }
        .methods { display: flex; flex-direction: column; gap: 12px; }
        .note { text-align: center; font-size: 12.5px; font-weight: 600; margin-top: 18px; }
        .checkoutbar { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 404px; height: 74px; border-radius: 24px; display: flex; align-items: center; gap: 12px; padding: 0 12px 0 18px; z-index: 60; box-shadow: var(--shadow-soft); }
        .cb-total { display: flex; flex-direction: column; line-height: 1.25; }
        .cb-total .muted { font-size: 11px; }
        .cb-total b { font-size: 20px; }
        .cb-btn { flex: 1; height: 56px; border-radius: 18px; background: linear-gradient(140deg, var(--orange-bright), var(--orange)); color: #fff; font-weight: 800; font-size: 15.5px; display: flex; align-items: center; justify-content: center; gap: 9px; box-shadow: var(--glow-orange), 0 12px 28px -12px rgba(236, 106, 44, 0.8); transition: transform 0.15s; }
        .cb-btn.apple { background: #000; border: 1px solid var(--hairline-strong); box-shadow: 0 12px 28px -12px rgba(0,0,0,0.9); }
        .cb-btn:active { transform: scale(0.97); }
        .cb-btn:disabled { opacity: 0.6; }
        .spinner { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Method({ id, method, setMethod, icon, title, sub, badge }) {
  const on = method === id;
  return (
    <button className={`method ${on ? "on" : ""}`} onClick={() => setMethod(id)}>
      <div className="m-ic">{icon}</div>
      <div className="m-body">
        <div className="m-title">{title} {badge && <span className="m-badge">{badge}</span>}</div>
        <span className="m-sub">{sub}</span>
      </div>
      <span className={`radio ${on ? "on" : ""}`}>{on && <I.check style={{ width: 14, height: 14 }} />}</span>
      <style jsx>{`
        .method { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 20px; background: var(--surface); border: 1px solid var(--hairline); transition: 0.2s; text-align: right; width: 100%; }
        .method.on { border-color: var(--orange); background: linear-gradient(var(--orange-soft), var(--orange-soft)), var(--surface); }
        .m-ic { width: 48px; height: 48px; border-radius: 14px; background: var(--surface-2); display: flex; align-items: center; justify-content: center; color: var(--text); flex-shrink: 0; }
        .method.on .m-ic { background: var(--orange); color: #fff; }
        .m-body { flex: 1; }
        .m-title { font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .m-badge { font-size: 10px; font-weight: 800; color: #fff; background: var(--purple-bright); padding: 2px 8px; border-radius: 8px; }
        .m-sub { font-size: 12.5px; color: var(--text-2); font-weight: 600; }
        .radio { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--hairline-strong); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .radio.on { background: var(--orange); border-color: var(--orange); }
      `}</style>
    </button>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="app" />}>
      <PaymentInner />
    </Suspense>
  );
}
