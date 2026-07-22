"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { I } from "@/components/Icons";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";

  const [step, setStep] = useState("phone"); // phone | code
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  const requestCode = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "invalid_phone" ? "رقم جوال غير صحيح." : data.error === "rate_limited" ? "حاول بعد قليل." : "تعذّر الإرسال.");
        setLoading(false);
        return;
      }
      if (data.devCode) setDevCode(data.devCode); // تطوير فقط
      setStep("code");
    } catch {
      setError("تعذّر الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (code.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("الرمز غير صحيح.");
        setLoading(false);
        return;
      }
      router.push(next);
    } catch {
      setError("تعذّر الاتصال.");
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{ paddingBottom: 40 }}>
      <header className="pad c-head reveal" style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 6 }}>
        <button className="round card" onClick={() => router.back()} aria-label="رجوع" style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><I.back /></button>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 900 }}>تسجيل الدخول</h1>
      </header>

      <div className="pad" style={{ marginTop: 20 }}>
        <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
          {step === "phone" ? "أدخل رقم جوالك لإرسال رمز التحقق." : `أدخلنا رمزاً إلى ${phone}`}
        </p>

        {step === "phone" ? (
          <>
            <div className="block-head" style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>رقم الجوال</div>
            <div className="field card" dir="ltr" style={{ display: "flex", alignItems: "center", gap: 12, height: 56, padding: "0 16px" }}>
              <span style={{ fontWeight: 800, color: "var(--text-2)" }}>+966</span>
              <input placeholder="5X XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" dir="ltr" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 15, fontWeight: 600, textAlign: "left" }} />
            </div>
            <button className="btn btn-primary btn-block" onClick={requestCode} disabled={loading || !phone.trim()} style={{ marginTop: 20 }}>
              {loading ? "جاري الإرسال…" : "إرسال الرمز"}
            </button>
          </>
        ) : (
          <>
            <div className="block-head" style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>رمز التحقق</div>
            <div className="field card" dir="ltr" style={{ display: "flex", alignItems: "center", height: 56, padding: "0 16px" }}>
              <input placeholder="0000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" dir="ltr" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 22, fontWeight: 800, letterSpacing: 8, textAlign: "center" }} />
            </div>
            {devCode && <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>🔧 وضع التطوير — الرمز: <b>{devCode}</b></p>}
            <button className="btn btn-primary btn-block" onClick={verify} disabled={loading || code.length !== 4} style={{ marginTop: 20 }}>
              {loading ? "جاري التحقق…" : "تأكيد"}
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => { setStep("phone"); setCode(""); }} style={{ marginTop: 10 }}>تغيير الرقم</button>
          </>
        )}

        {error && <div style={{ background: "rgba(224,82,82,0.12)", color: "#e05252", border: "1px solid rgba(224,82,82,0.3)", borderRadius: 14, padding: "12px 16px", fontSize: 13.5, fontWeight: 700, marginTop: 16 }}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="app" />}>
      <LoginInner />
    </Suspense>
  );
}
