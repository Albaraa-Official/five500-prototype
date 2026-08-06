// PATCH /api/admin/discounts/[id] — تفعيل/تعطيل أو تعديل كود خصم.
// DELETE /api/admin/discounts/[id] — حذف كود خصم.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  active: z.boolean().optional(),
  value: z.number().int().min(1).optional(),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
}).strict();

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const d = parsed.data;
  const data = {};
  if (d.active !== undefined) data.active = d.active;
  if (d.value !== undefined) data.value = d.value;
  if (d.maxUses !== undefined) data.maxUses = d.maxUses;
  if (d.expiresAt !== undefined) data.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;

  try {
    const discount = await prisma.discountCode.update({ where: { id: params.id }, data });
    return NextResponse.json({ discount });
  } catch (err) {
    if (err.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
    console.error("update discount failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await prisma.discountCode.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") return NextResponse.json({ error: "not_found" }, { status: 404 });
    console.error("delete discount failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
