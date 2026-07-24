"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I } from "@/components/Icons";

const rows = [
  { icon: "🧾", label: "طلباتي", sub: "تتبّع وأعد الطلب", href: "/orders" },
  { icon: "📍", label: "عناويني", sub: "المنزل · العمل" },
  { icon: "❤️", label: "المفضلة", sub: "أصنافك المحفوظة" },
  { icon: "💳", label: "طرق الدفع", sub: "Apple Pay · مدى" },
  { icon: "🎁", label: "نقاط المكافآت", sub: "قريباً" },
  { icon: "⚙️", label: "الإعدادات", sub: "اللغة · الإشعارات" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch((e) => console.error("auth/me failed", e))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("logout failed", e);
    }
    setUser(null);
  };

  // اسم العرض والحرف الأول للأفاتار
  const displayName = user?.name || (user ? "ضيف فايف هاندرد" : "زائر");
  const avatarChar = displayName.trim().charAt(0) || "ض";

  return (
    <div className="app">
      <header className="pad reveal" style={{ paddingTop: 6 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 900 }}>حسابي</h1>
      </header>

      {!loading && !user ? (
        // غير مسجّل — دعوة لتسجيل الدخول
        <div className="pad">
          <div className="profile card reveal d1" style={{ flexDirection: "column", alignItems: "stretch", gap: 14, textAlign: "center", padding: 24 }}>
            <div className="avatar" style={{ margin: "0 auto" }}>👋</div>
            <b style={{ fontSize: 17 }}>سجّل دخولك</b>
            <span className="muted" style={{ fontSize: 13.5 }}>لمتابعة طلباتك وحفظ مفضّلاتك</span>
            <Link href="/login?next=/account" className="btn btn-primary btn-block" style={{ marginTop: 6 }}>تسجيل الدخول بالجوال</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="pad">
            <div className="profile card reveal d1">
              <div className="avatar">{avatarChar}</div>
              <div className="p-info">
                <b>{displayName}</b>
                <span className="muted ltr">{user?.phone || "—"}</span>
              </div>
              {user && <div className="tier">🏆 عضو</div>}
            </div>
          </div>

          <div className="pad stats reveal d2">
            <Stat n={user ? String(user.orders ?? 0) : "0"} l="طلب" />
            <Stat n="—" l="نقطة" />
            <Stat n="—" l="مفضلة" />
          </div>
        </>
      )}

      <div className="pad rows">
        {rows.map((r, i) => {
          const Wrap = r.href ? Link : "div";
          const wrapProps = r.href ? { href: r.href } : {};
          return (
            <Wrap key={r.label} {...wrapProps} className="arow card reveal" style={{ animationDelay: `${0.04 * i}s` }}>
              <span className="arow-ic">{r.icon}</span>
              <div className="arow-body">
                <b>{r.label}</b>
                <span className="muted">{r.sub}</span>
              </div>
              <I.back style={{ transform: "rotate(180deg)", color: "var(--text-3)" }} />
            </Wrap>
          );
        })}
      </div>

      {user && (
        <div className="pad">
          <button className="btn btn-ghost btn-block" onClick={logout} style={{ color: "#e05252" }}>تسجيل الخروج</button>
        </div>
      )}

      <div className="pad" style={{ marginTop: 8 }}>
        <div className="brandline muted reveal">
          <Image src="/logo.jpg" alt="FIVE 500" width={24} height={24} /> FIVE 500 · فايف هاندرد
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
