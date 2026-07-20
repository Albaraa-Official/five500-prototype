"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { I } from "./Icons";
import { useCart } from "@/context/CartContext";

/* Persistent top header — logo centered, cart + account grouped at the left.
   Fixed across every screen so the brand and cart are always one tap away.
   Also plays a brief brand-colored sweep on every route change. */
export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [sweep, setSweep] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSweep(true);
    const t = setTimeout(() => setSweep(false), 550);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <header className="gheader">
      <div className="gheader-icons">
        <Link href="/cart" className="ghead-btn" aria-label="السلة">
          <I.bag />
          {count > 0 && <span className="ghead-badge">{count}</span>}
        </Link>
        <Link href="/account" className="ghead-btn" aria-label="حسابي">
          <I.user />
        </Link>
      </div>
      <Link href="/" className="ghead-logo-wrap" aria-label="الرئيسية">
        <img src="/logo-transparent.png" alt="FIVE 500 — فايف هاندرد" className="ghead-logo" />
      </Link>
      <span className={`ghead-sweep ${sweep ? "on" : ""}`} aria-hidden />
    </header>
  );
}
