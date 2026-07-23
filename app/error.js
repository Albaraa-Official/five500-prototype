"use client";

export default function Error({ error, reset }) {
  return (
    <div className="app pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", gap: 14 }}>
      <span style={{ fontSize: 48 }}>😕</span>
      <h1 style={{ fontSize: 20, fontWeight: 900 }}>حدث خطأ غير متوقع</h1>
      <p className="muted" style={{ fontSize: 14 }}>حاول مرة أخرى أو ارجع لاحقاً.</p>
      <button className="btn btn-primary" onClick={() => reset()} style={{ padding: "0 28px", height: 48 }}>حاول مجدداً</button>
    </div>
  );
}
