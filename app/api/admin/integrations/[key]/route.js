// PATCH /api/admin/integrations/[key] — تحديث إعدادات غير حساسة فقط (enabled، config مثل storeId).
// لا يقبل أي حقل يشبه سراً — الأسرار تُضبط في env حصراً ولا تُكتب أبداً من الواجهة.
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { getIntegration } from "@/lib/integrations/registry";
import { upsertIntegrationSetting } from "@/lib/integrations/settings";

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.string().max(200)).optional(),
}).strict();

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const integration = getIntegration(params.key);
  if (!integration) return NextResponse.json({ error: "unknown_integration" }, { status: 404 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const data = {};
  if (parsed.data.enabled !== undefined) data.enabled = parsed.data.enabled;
  if (parsed.data.config !== undefined) data.config = parsed.data.config;

  const setting = await upsertIntegrationSetting(params.key, data);
  return NextResponse.json({ setting: { key: setting.key, enabled: setting.enabled, config: setting.config } });
}
