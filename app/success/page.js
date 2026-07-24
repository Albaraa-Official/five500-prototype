"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { I } from "@/components/Icons";
import { formatSAR } from "@/lib/money";
import QRCode from "qrcode";

const STATUS_STEP = { paid: 0, preparing: 1, ready: 2, completed: 2 };

function SuccessInner() {
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const [order, setOrder] = useState(null);
  const [zatcaQrImg, setZatcaQrImg] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!order?.zatcaQr) {
      setZatcaQrImg(null);
      return;
    }
    let alive = true;
    QRCode.toDataURL(order.zatcaQr, { margin: 1, width: 160 })
      .then((url) => alive && setZatcaQrImg(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [order?.zatcaQr]);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    let failCount = 0;
    const poll = () =>
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (d.order) { setOrder(d.order); setLoadError(false); failCount = 0; }
          else { failCount += 1; if (failCount >= 2) setLoadError(true); }
        })
        .catch((e) => {
          console.error("order poll failed", e);
          if (!alive) return;
          failCount += 1;
          if (failCount >= 2) setLoadError(true);
        });
    poll();
    // تتبّع حيّ: نحدّث الحالة كل 8 ثوانٍ حتى يكتمل الطلب
    const t = setInterval(() => {
      if (!alive) return;
      poll();
    }, 8000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [orderId]);

  // رقم طلب مختصر مقروء من معرّف cuid
  const orderNo = order ? `F500-${order.id.slice(-6).toUpperCase()}` : "…";
  const step = order ? (STATUS_STEP[order.status] ?? 0) : 0;

  if (!orderId) {
    return (
      <div className="app pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", gap: 14 }}>
        <span style={{ fontSize: 48 }}>🧾</span>
        <h1 style={{ fontSize: 20, fontWeight: 900 }}>لا يوجد طلب لعرضه</h1>
        <p className="muted" style={{ fontSize: 14 }}>ابدأ من السلة لإتمام طلب جديد.</p>
        <Link href="/menu" className="btn btn-primary" style={{ padding: "0 28px", height: 48, display: "inline-flex", alignItems: "center" }}>تصفّح المنيو</Link>
      </div>
    );
  }

  if (loadError && !order) {
    return (
      <div className="app pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", gap: 14 }}>
        <span style={{ fontSize: 48 }}>😕</span>
        <h1 style={{ fontSize: 20, fontWeight: 900 }}>تعذّر تحميل حالة طلبك</h1>
        <p className="muted" style={{ fontSize: 14 }}>تحقق من اتصالك بالإنترنت وحاول مجدداً.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ padding: "0 28px", height: 48 }}>حاول مجدداً</button>
        <Link href="/account" className="btn btn-ghost" style={{ padding: "0 28px", height: 48, display: "inline-flex", alignItems: "center" }}>عرض طلباتي</Link>
      </div>
    );
  }

  return (
    <div className="app success">
      <div className="s-bg glowbg" />
      <div className="s-center">
        <div className="check-wrap">
          <span className="ring r1" />
          <span className="ring r2" />
          <div className="check-circle">
            <I.check style={{ width: 46, height: 46 }} />
          </div>
        </div>

        <h1 className="display reveal d1">تم استلام طلبك! 🎉</h1>
        <p className="s-sub muted reveal d2">
          يجهّز مطبخ فايف هاندرد طلبك الآن بكل حب.<br />نراك على ألذّ لقمة.
        </p>

        <div className="order-card glass reveal d3">
          <div className="oc-row">
            <span className="muted">رقم الطلب</span>
            <b className="price">{orderNo}</b>
          </div>
          {order && (
            <div className="oc-row" style={{ marginTop: 8 }}>
              <span className="muted">الإجمالي</span>
              <b className="price">{formatSAR(order.totalHalalas)}</b>
            </div>
          )}
          <div className="oc-divider" />
          <div className="oc-status">
            <Step done label="تم التأكيد" icon="✅" />
            <Line done={step >= 1} />
            <Step done={step >= 1} active={step === 1} label="قيد التحضير" icon="👨‍🍳" />
            <Line done={step >= 2} />
            <Step done={step >= 2} active={step === 2} label="جاهز للاستلام" icon="🛍️" />
          </div>
          <div className="eta">
            <I.clock /> جاهز خلال <b><span className="ltr">15–25</span> دقيقة</b>
          </div>
        </div>

        {zatcaQrImg && (
          <div className="zatca-card glass reveal d3">
            <span className="zatca-label muted">فاتورة ضريبية مبسطة</span>
            <img src={zatcaQrImg} alt="ZATCA QR" width={160} height={160} />
          </div>
        )}

        <div className="s-actions reveal d4">
          <Link href="/" className="btn btn-primary btn-block">العودة للرئيسية</Link>
          <Link href="/account" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>طلباتي</Link>
        </div>
      </div>

      <style jsx>{`
        .success { padding-bottom: 30px; min-height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden; background: radial-gradient(circle at 50% 22%, #1a1226, #0b0b0d 60%); }
        .s-bg { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(124,77,190,0.4), transparent 60%); filter: blur(30px); }
        .s-center { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 30px 26px 0; }
        .check-wrap { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
        .check-circle { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(140deg, #46c37b, #2fa862); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 60px -6px rgba(70,195,123,0.7); animation: popIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .ring { position: absolute; width: 96px; height: 96px; border-radius: 50%; border: 2px solid rgba(70,195,123,0.5); }
        .r1 { animation: ring 1.8s ease-out infinite; }
        .r2 { animation: ring 1.8s ease-out infinite 0.6s; }
        h1 { font-size: 27px; font-weight: 900; }
        .s-sub { font-size: 14.5px; line-height: 1.7; margin-top: 12px; }
        .order-card { width: 100%; border-radius: 24px; padding: 20px; margin-top: 28px; }
        .oc-row { display: flex; justify-content: space-between; align-items: center; }
        .oc-row b { font-size: 18px; }
        .oc-divider { height: 1px; background: var(--hairline); margin: 16px 0; }
        .oc-status { display: flex; align-items: flex-start; justify-content: space-between; }
        .eta { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 20px; font-size: 13.5px; font-weight: 600; color: var(--text-2); background: var(--surface); border: 1px solid var(--hairline); padding: 11px; border-radius: 15px; }
        .eta b { color: var(--text); }
        .s-actions { width: 100%; margin-top: auto; padding-top: 30px; }
        .zatca-card { width: 100%; border-radius: 24px; padding: 18px; margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .zatca-label { font-size: 12.5px; font-weight: 700; }
      `}</style>
    </div>
  );
}

function Step({ label, icon, done, active }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto", width: 70 }}>
      <div
        style={{
          width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          background: done ? "linear-gradient(140deg,#46c37b,#2fa862)" : active ? "linear-gradient(140deg,var(--orange-bright),var(--orange))" : "var(--surface)",
          border: done || active ? "none" : "1px solid var(--hairline)",
          boxShadow: active ? "var(--glow-orange)" : "none",
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: done || active ? "var(--text)" : "var(--text-3)" }}>{label}</span>
    </div>
  );
}

function Line({ done }) {
  return <div style={{ flex: 1, height: 2, marginTop: 22, background: done ? "#2fa862" : "var(--hairline)", borderRadius: 2 }} />;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="app success" />}>
      <SuccessInner />
    </Suspense>
  );
}
