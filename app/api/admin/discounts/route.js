// GET /api/admin/discounts — قائمة كودات الخصم.
// POST /api/admin/discounts — إنشاء كود خصم.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  code: z.string().min(2).max(50),
  type: z.enum(["percent", "fixed"]),
  value: z.number().int().min(1),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
}).strict();

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ discounts });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const d = parsed.data;
  if (d.type === "percent" && d.value > 100) {
    return NextResponse.json({ error: "invalid_percent" }, { status: 400 });
  }

  try {
    const discount = await prisma.discountCode.create({
      data: {
        code: d.code.trim().toUpperCase(),
        type: d.type,
        value: d.value,
        maxUses: d.maxUses ?? null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });
    return NextResponse.json({ discount });
  } catch (err) {
    if (err.code === "P2002") return NextResponse.json({ error: "code_exists" }, { status: 409 });
    console.error("create discount failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
