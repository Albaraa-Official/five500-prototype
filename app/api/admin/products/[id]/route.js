// PATCH /api/admin/products/[id] — تعديل منتج (بيانات/أسعار/تفعيل).
// DELETE /api/admin/products/[id] — حذف منتج.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(60).optional(),
  img: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  calories: z.number().int().min(0).optional().nullable(),
  tag: z.string().max(40).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  active: z.boolean().optional(),
  priceRegHalalas: z.number().int().min(0).optional(),
  priceLargeHalalas: z.number().int().min(0).optional().nullable(),
  regLoyverseVariantId: z.string().max(100).optional().nullable(),
  largeLoyverseVariantId: z.string().max(100).optional().nullable(),
}).strict();

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const d = parsed.data;
  const { id } = params;

  const data = {};
  for (const k of ["name", "category", "img", "emoji", "calories", "tag", "description", "active"]) {
    if (d[k] !== undefined) data[k] = d[k];
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) await tx.product.update({ where: { id }, data });
      if (d.priceRegHalalas !== undefined || d.regLoyverseVariantId !== undefined) {
        await tx.productPrice.upsert({
          where: { productId_size: { productId: id, size: "reg" } },
          update: {
            ...(d.priceRegHalalas !== undefined ? { priceHalalas: d.priceRegHalalas } : {}),
            ...(d.regLoyverseVariantId !== undefined ? { loyverseVariantId: d.regLoyverseVariantId } : {}),
          },
          create: { productId: id, size: "reg", priceHalalas: d.priceRegHalalas ?? 0, loyverseVariantId: d.regLoyverseVariantId || null },
        });
      }
      if (d.priceLargeHalalas !== undefined) {
        if (d.priceLargeHalalas === null) {
          await tx.productPrice.deleteMany({ where: { productId: id, size: "large" } });
        } else {
          await tx.productPrice.upsert({
            where: { productId_size: { productId: id, size: "large" } },
            update: { priceHalalas: d.priceLargeHalalas },
            create: { productId: id, size: "large", priceHalalas: d.priceLargeHalalas },
          });
        }
      }
      if (d.largeLoyverseVariantId !== undefined) {
        await tx.productPrice.updateMany({ where: { productId: id, size: "large" }, data: { loyverseVariantId: d.largeLoyverseVariantId } });
      }
    });
    const product = await prisma.product.findUnique({ where: { id }, include: { prices: true } });
    return NextResponse.json({ product });
  } catch (err) {
    if (err.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
    console.error("update product failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
    // إن كان مرتبطاً بطلبات سابقة، عطّله بدلاً من حذفه
    if (err.code === "P2003") {
      await prisma.product.update({ where: { id: params.id }, data: { active: false } });
      return NextResponse.json({ ok: true, deactivatedInstead: true });
    }
    console.error("delete product failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
