// GET /api/products — الكتالوج من قاعدة البيانات (المصدر الموثوق للأسعار).
// الأسعار تُعاد بالهللات؛ الواجهة تعرضها بالريال (÷100).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { prices: true },
      orderBy: { createdAt: "asc" },
    });

    const data = products.map((p) => {
      const reg = p.prices.find((x) => x.size === "reg");
      const large = p.prices.find((x) => x.size === "large");
      return {
        id: p.id,
        name: p.name,
        cat: p.category,
        img: p.img,
        emoji: p.emoji,
        cal: p.calories,
        tag: p.tag,
        desc: p.description,
        reg: reg ? reg.priceHalalas / 100 : null,
        large: large ? large.priceHalalas / 100 : null,
      };
    });

    return NextResponse.json({ products: data });
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
