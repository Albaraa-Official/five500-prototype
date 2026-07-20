"use client";
import Link from "next/link";
import { FeatureCard, GridCard } from "@/components/ProductCard";
import { I } from "@/components/Icons";
import { categories, products } from "@/data/menu";

export default function Home() {
  const featured = products.filter((p) => p.hero || p.tag === "الأكثر طلباً" || p.tag === "المفضّل").slice(0, 5);
  const list = products.filter((p) => ["beef", "chicken"].includes(p.cat)).slice(0, 4);

  return (
    <div className="app home">
      {/* HERO — simple: strong image + CTA only */}
      <section className="pad">
        <Link href="/menu" className="hero reveal d1">
          <img src="/scenes/promo-1.jpg" alt="فايف هاندرد" className="hero-bg" />
          <div className="hero-scrim" />
          <div className="hero-content">
            <span className="hero-order">
              اطلب الآن <I.back style={{ transform: "rotate(180deg)" }} />
            </span>
          </div>
        </Link>
      </section>

      {/* Categories */}
      <section>
        <div className="pad sec-head">
          <h2>الأقسام</h2>
          <Link href="/menu"><span>عرض الكل</span></Link>
        </div>
        <div className="cats hide-scroll pad">
          {categories.slice(1).map((c, i) => (
            <Link href={`/menu?cat=${c.id}`} key={c.id} className="cat reveal" style={{ animationDelay: `${0.05 * i}s` }}>
              <div className="cat-ic">
                {c.img ? <img src={c.img} alt={c.name} loading="lazy" /> : c.icon}
              </div>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured carousel */}
      <section>
        <div className="pad sec-head">
          <h2>الأكثر طلباً</h2>
          <Link href="/menu"><span>عرض الكل</span></Link>
        </div>
        <div className="feat hide-scroll pad">
          {featured.map((p, i) => (
            <FeatureCard p={p} key={p.id} delay={0.05 * i} />
          ))}
        </div>
      </section>

      {/* Night promo — rectangular image */}
      <section className="pad">
        <Link href="/product/bite-beef" className="promo reveal">
          <div className="promo-txt">
            <span className="promo-new">جديدنا 🌙</span>
            <h3 className="display">برجر نص الليل</h3>
            <p>مع مشروب و بطاطس</p>
            <span className="promo-price">27 ﷼</span>
          </div>
          <img src="/products/bite-beef.jpg" alt="برجر نص الليل" className="promo-img" loading="lazy" />
        </Link>
      </section>

      {/* Menu preview */}
      <section>
        <div className="pad sec-head">
          <h2>من المنيو</h2>
          <Link href="/menu"><span>عرض الكل</span></Link>
        </div>
        <div className="pad menu-grid" style={{ paddingBottom: 8 }}>
          {list.map((p, i) => (
            <GridCard p={p} key={p.id} delay={0.05 * i} />
          ))}
        </div>
      </section>
    </div>
  );
}
