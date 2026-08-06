"use client";
import Image from "next/image";
import { memo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I } from "./Icons";
import { useCart } from "@/context/CartContext";
import { money } from "@/data/menu";

function Thumb({ p, className, emojiClass }) {
  if (p.img) {
    return <Image src={p.img} alt={p.name} width={200} height={200} style={{ objectFit: "cover" }} className={className} />;
  }
  return (
    <div
      className={emojiClass}
      style={{ background: `radial-gradient(circle at 50% 35%, ${p.accent || "#333"}44, transparent 70%)` }}
    >
      {p.emoji || "🍔"}
    </div>
  );
}

function AddBtn({ className, onAdd }) {
  const [pop, setPop] = useState(false);
  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onAdd({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setPop(true);
    setTimeout(() => setPop(false), 500);
  };
  return (
    <button className={`${className} ${pop ? "add-pop" : ""}`} onClick={handle} aria-label={pop ? "تمت الإضافة" : "أضف للسلة"}>
      {pop ? <I.check style={{ width: 16, height: 16 }} /> : <I.plus />}
    </button>
  );
}

/* Wraps a card — navigates only on intentional tap, not accidental scroll */
function TapLink({ href, className, style, children }) {
  const router = useRouter();
  const start = useRef({ y: 0, x: 0 });
  const scrolled = useRef(false);
  const isTouch = useRef(false);

  const onTouchStart = (e) => {
    isTouch.current = true;
    start.current = { y: e.touches[0].clientY, x: e.touches[0].clientX };
    scrolled.current = false;
  };
  const onTouchMove = (e) => {
    const dy = Math.abs(e.touches[0].clientY - start.current.y);
    const dx = Math.abs(e.touches[0].clientX - start.current.x);
    if (dy > 10 || dx > 10) scrolled.current = true;
  };
  const onTouchEnd = (e) => {
    if (scrolled.current) return;
    if (e.target.closest("button, input, a")) return;
    e.preventDefault();
    router.push(href);
  };
  const onClick = (e) => {
    if (isTouch.current) return;
    if (e.target.closest("button, input, a")) return;
    router.push(href);
  };

  return (
    <div
      className={className}
      style={{ ...style, cursor: "pointer" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      role="link"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/* Horizontal list row (menu list) */
export const ProductRow = memo(function ProductRow({ p, delay = 0 }) {
  const { add } = useCart();
  return (
    <TapLink href={`/product/${p.id}`} className="prow reveal" style={{ animationDelay: `${delay}s` }}>
      <div className="prow-img">
        <Thumb p={p} className="prow-thumb" emojiClass="prow-emoji" />
      </div>
      <div className="prow-body">
        <div className="prow-top">
          <h3>{p.name}</h3>
          {p.tag && <span className="prow-tag">{p.tag}</span>}
        </div>
        <div className="prow-bottom">
          <span className="price">
            {money(p.reg)}
            {p.large && <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}> / {money(p.large)}</span>}
          </span>
        </div>
      </div>
      <AddBtn className="prow-add" onAdd={(rect) => add(p, "reg", 1, rect)} />
    </TapLink>
  );
});

/* Grid card (menu bento) */
export const GridCard = memo(function GridCard({ p, feature = false, delay = 0 }) {
  const { add } = useCart();
  return (
    <TapLink
      href={`/product/${p.id}`}
      className={`gcard reveal ${feature ? "gcard-feature" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="gcard-media">
        <Thumb p={p} className="gcard-img" emojiClass="gcard-emoji" />
        {p.tag && <span className="gcard-tag">{p.tag}</span>}
      </div>
      <div className="gcard-info">
        <h3>{p.name}</h3>
        {feature && p.desc && <p className="gcard-desc muted">{p.desc}</p>}
        <div className="gcard-foot">
          <span className="price">
            {money(p.reg)}
            {p.large && <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}> / {money(p.large)}</span>}
          </span>
          <AddBtn className="" onAdd={(rect) => add(p, "reg", 1, rect)} />
        </div>
      </div>
    </TapLink>
  );
});

/* Tall featured card (home carousel) */
export const FeatureCard = memo(function FeatureCard({ p, delay = 0 }) {
  const { add } = useCart();
  return (
    <TapLink href={`/product/${p.id}`} className="fcard reveal" style={{ animationDelay: `${delay}s` }}>
      <div className="fcard-media">
        <Thumb p={p} className="fcard-img" emojiClass="fcard-emoji" />
      </div>
      <div className="fcard-info">
        <h3>{p.name}</h3>
        <p className="muted">{p.tag || "برجر مميز"}</p>
        <div className="fcard-foot">
          <span className="price">{money(p.reg)}</span>
          <AddBtn className="" onAdd={(rect) => add(p, "reg", 1, rect)} />
        </div>
      </div>
    </TapLink>
  );
});
