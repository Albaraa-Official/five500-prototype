// POST /api/discounts/validate — يتحقق من كود الخصم بدون إنشاء طلب.
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveDiscount } from "@/lib/pricing";

const schema = z.object({
  code: z.string().min(1).max(50),
  subtotalHalalas: z.number().int().min(0),
}).strict();

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const result = await resolveDiscount(parsed.data.code, parsed.data.subtotalHalalas);
  if (!result) return NextResponse.json({ error: "invalid_code" }, { status: 404 });

  return NextResponse.json({ code: result.code, discountHalalas: result.discountHalalas });
}
