// GET /api/admin/products — قائمة كل المنتجات مع أسعارها.
// POST /api/admin/products — إنشاء منتج جديد.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  id: z.string().min(1).max(60),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  img: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  calories: z.number().int().min(0).optional().nullable(),
  tag: z.string().max(40).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  active: z.boolean().optional(),
  priceRegHalalas: z.number().int().min(0),
  priceLargeHalalas: z.number().int().min(0).optional().nullable(),
}).strict();

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { prices: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  const d = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        id: d.id,
        name: d.name,
        category: d.category,
        img: d.img || null,
        emoji: d.emoji || null,
        calories: d.calories ?? null,
        tag: d.tag || null,
        description: d.description || null,
        active: d.active ?? true,
        prices: {
          create: [
            { size: "reg", priceHalalas: d.priceRegHalalas },
            ...(d.priceLargeHalalas != null ? [{ size: "large", priceHalalas: d.priceLargeHalalas }] : []),
          ],
        },
      },
      include: { prices: true },
    });
    return NextResponse.json({ product });
  } catch (err) {
    if (err.code === "P2002") return NextResponse.json({ error: "id_exists" }, { status: 409 });
    console.error("create product failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
