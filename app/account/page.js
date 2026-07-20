"use client";
import { I } from "@/components/Icons";

const rows = [
  { icon: "🧾", label: "طلباتي", sub: "تتبّع وأعد الطلب" },
  { icon: "📍", label: "عناويني", sub: "المنزل · العمل" },
  { icon: "❤️", label: "المفضلة", sub: "12 صنف محفوظ" },
  { icon: "💳", label: "طرق الدفع", sub: "Apple Pay · مدى" },
  { icon: "🎁", label: "نقاط المكافآت", sub: "480 نقطة" },
  { icon: "⚙️", label: "الإعدادات", sub: "اللغة · الإشعارات" },
];

export default function AccountPage() {
  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 900 }}>حسابي</h1>
      </header>

      <div className="pad">
        <div className="profile card reveal d1">
          <div className="avatar">ض</div>
          <div className="p-info">
            <b>ضيف فايف هاندرد</b>
            <span className="muted ltr">+966 55 692 7406</span>
          </div>
          <div className="tier">🏆 ذهبي</div>
        </div>
      </div>

      <div className="pad stats reveal d2">
        <Stat n="24" l="طلب" />
        <Stat n="480" l="نقطة" />
        <Stat n="12" l="مفضلة" />
      </div>

      <div className="pad rows">
        {rows.map((r, i) => (
          <div className="arow card reveal" style={{ animationDelay: `${0.04 * i}s` }} key={r.label}>
            <span className="arow-ic">{r.icon}</span>
            <div className="arow-body">
              <b>{r.label}</b>
              <span className="muted">{r.sub}</span>
            </div>
            <I.back style={{ transform: "rotate(180deg)", color: "var(--text-3)" }} />
          </div>
        ))}
      </div>

      <div className="pad" style={{ marginTop: 8 }}>
        <div className="brandline muted reveal">
          <img src="/logo.jpg" alt="FIVE 500" /> FIVE 500 · فايف هاندرد
        </div>
      </div>

      <style jsx>{`
        .profile { display: flex; align-items: center; gap: 14px; padding: 16px; margin-top: 8px; }
        .avatar { width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(140deg, var(--purple-bright), var(--purple)); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #fff; }
        .p-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .p-info b { font-size: 16px; font-weight: 800; }
        .p-info span { font-size: 13px; }
        .tier { font-size: 12px; font-weight: 800; color: var(--yellow-warm); background: rgba(245,166,35,0.12); padding: 6px 11px; border-radius: 12px; }
        .stats { display: flex; gap: 12px; margin-top: 14px; }
        .rows { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .arow { display: flex; align-items: center; gap: 14px; padding: 15px 16px; }
        .arow-ic { font-size: 22px; width: 30px; text-align: center; }
        .arow-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .arow-body b { font-size: 15px; font-weight: 800; }
        .arow-body span { font-size: 12.5px; }
        .brandline { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; font-weight: 700; margin-top: 24px; opacity: 0.7; }
        .brandline img { width: 26px; height: 26px; border-radius: 8px; }
      `}</style>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div className="card" style={{ flex: 1, padding: "16px 10px", textAlign: "center" }}>
      <b className="price" style={{ fontSize: 24, display: "block" }}>{n}</b>
      <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{l}</span>
    </div>
  );
}
