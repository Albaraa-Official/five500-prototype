// POST /api/admin/integrations/[key]/test — يختبر الاتصال الفعلي بالتكامل (باستخدام أسرار env)
// ويُحدّث حالة الاتصال (status/lastError) في DB لعرضها بلوحة الإدارة.
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getIntegration } from "@/lib/integrations/registry";
import { getIntegrationSetting, recordIntegrationStatus } from "@/lib/integrations/settings";

export async function POST(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const integration = getIntegration(params.key);
  if (!integration) return NextResponse.json({ error: "unknown_integration" }, { status: 404 });

  if (!integration.isConfigured()) {
    await recordIntegrationStatus(params.key, { status: "error", lastError: "الأسرار غير مضبوطة في Environment Variables" });
    return NextResponse.json({ ok: false, message: "الأسرار غير مضبوطة في Environment Variables" }, { status: 400 });
  }

  const setting = await getIntegrationSetting(params.key);

  try {
    const result = await integration.testConnection(setting.config || {});
    await recordIntegrationStatus(params.key, {
      status: result.ok ? "connected" : "error",
      lastError: result.ok ? null : result.message,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(`اختبار الاتصال بـ ${params.key} فشل:`, err);
    await recordIntegrationStatus(params.key, { status: "error", lastError: err.message });
    return NextResponse.json({ ok: false, message: err.message }, { status: 502 });
  }
}
