"use client";

export function RetryBlock({ message, onRetry }) {
  return (
    <div className="card" style={{ padding: 24, textAlign: "center" }}>
      <p style={{ color: "#e05252", fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>⚠️ {message}</p>
      <button className="btn btn-primary" onClick={onRetry} style={{ padding: "0 24px", height: 42 }}>حاول مجدداً</button>
    </div>
  );
}

export function Field({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ height: 42, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--text)", padding: "0 12px", fontSize: 14 }} />
    </label>
  );
}
