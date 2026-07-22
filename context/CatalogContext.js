"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { products as staticProducts } from "@/data/menu";

// مزوّد الكتالوج: يبدأ ببيانات ثابتة (لا وميض)، ثم يحدّثها من /api/products (المصدر الموثوق).
const CatalogContext = createContext({ products: staticProducts, loading: false });

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.products) && d.products.length) setProducts(d.products);
      })
      .catch(() => {}) // احتياطي: نبقى على البيانات الثابتة
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return <CatalogContext.Provider value={{ products, loading }}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
