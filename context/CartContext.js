"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [favs, setFavs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  // Read persisted cart + favorites once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("f500-cart");
      if (saved) setItems(JSON.parse(saved));
      const savedF = localStorage.getItem("f500-favs");
      if (savedF) setFavs(JSON.parse(savedF));
    } catch (e) {}
    setLoaded(true);
  }, []);

  // Persist — but only after the initial read, so we never clobber it with []
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("f500-cart", JSON.stringify(items));
    } catch (e) {}
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("f500-favs", JSON.stringify(favs));
    } catch (e) {}
  }, [favs, loaded]);

  const toggleFav = (id) =>
    setFavs((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  const isFav = (id) => favs.includes(id);

  const add = (product, size = "reg", qty = 1, buttonRect = null) => {
    setItems((prev) => {
      const key = `${product.id}-${size}`;
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      const price = size === "large" ? product.large : product.reg;
      return [
        ...prev,
        { key, id: product.id, name: product.name, img: product.img, emoji: product.emoji, accent: product.accent, size, price, qty },
      ];
    });
    setLastAdded({
      id: product.id,
      name: product.name,
      img: product.img,
      emoji: product.emoji,
      accent: product.accent,
      buttonRect,
      ts: Math.random()
    });
  };

  const setQty = (key, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  };

  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal, favs, toggleFav, isFav, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
