"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { I } from "./Icons";

export default function AddToast() {
  const { lastAdded } = useCart();
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!lastAdded) return;
    setItem(lastAdded);
    setShow(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timerRef.current);
  }, [lastAdded]);

  if (!item) return null;

  return (
    <div className={`atoast ${show ? "in" : "out"}`} aria-live="polite">
      <div className="atoast-media">
        {item.img ? (
          <Image src={item.img} alt={item.name} width={46} height={46} style={{ objectFit: "cover" }} />
        ) : (
          <span className="atoast-emoji">{item.emoji || "🍔"}</span>
        )}
        <span className="atoast-check">
          <I.check style={{ width: 13, height: 13 }} />
        </span>
      </div>
      <div className="atoast-body">
        <span className="atoast-title">تمت الإضافة للسلة</span>
        <span className="atoast-name">{item.name}</span>
      </div>

      <style jsx>{`
        .atoast {
          position: absolute;
          top: 106px;
          left: 50%;
          z-index: 210;
          display: flex;
          align-items: center;
          gap: 12px;
          width: calc(100% - 32px);
          max-width: 340px;
          padding: 10px 16px 10px 10px;
          border-radius: 20px;
          background: rgba(23, 23, 27, 0.85);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid var(--hairline-strong);
          box-shadow: 0 20px 50px -14px rgba(0, 0, 0, 0.7), var(--glow-orange);
          pointer-events: none;
        }
        .atoast.in {
          animation: atoastIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .atoast.out {
          animation: atoastOut 0.4s cubic-bezier(0.4, 0, 1, 1) both;
        }
        @keyframes atoastIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-28px) scale(0.9); }
          60% { opacity: 1; transform: translateX(-50%) translateY(4px) scale(1.02); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes atoastOut {
          to { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(0.95); }
        }
        .atoast-media {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .atoast-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .atoast-emoji {
          font-size: 22px;
        }
        .atoast-check {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(140deg, #46c37b, #2fa862);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg);
          animation: checkPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        @keyframes checkPop {
          0% { transform: scale(0); }
          70% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .atoast-body {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .atoast-title {
          font-size: 12px;
          font-weight: 700;
          color: #6fd99a;
        }
        .atoast-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
