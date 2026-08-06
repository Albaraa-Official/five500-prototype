// GET /api/admin/integrations — حالة كل التكاملات (Moyasar من env مباشرة للقراءة فقط،
// والتكاملات القابلة للتفعيل من السجل + إعداداتها غير الحساسة من DB).
// لا يُعاد أي Secret Key فعلي هنا — فقط "مضبوط/غير مضبوط" (boolean).
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listIntegrations } from "@/lib/integrations/registry";
import { getIntegrationSetting } from "@/lib/integrations/settings";

function moyasarInfo() {
  const secret = process.env.MOYASAR_SECRET_KEY || "";
  const publishable = process.env.MOYASAR_PUBLISHABLE_KEY || "";
  const mode = secret.startsWith("sk_live_") || publishable.startsWith("pk_live_") ? "production" : "sandbox";
  return {
    key: "moyasar",
    name: "Moyasar",
    secretKeyConfigured: !!secret,
    publishableKeyConfigured: !!publishable,
    webhookSecretConfigured: !!process.env.MOYASAR_WEBHOOK_SECRET,
    mode: secret || publishable ? mode : null,
  };
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const integrations = await Promise.all(
    listIntegrations().map(async (i) => {
      const setting = await getIntegrationSetting(i.key);
      return {
        key: i.key,
        name: i.name,
        category: i.category,
        enabled: setting.enabled,
        config: setting.config || {},
        status: setting.status,
        lastError: setting.lastError,
        lastCheckedAt: setting.lastCheckedAt,
        secretsConfigured: i.isConfigured(),
      };
    })
  );

  return NextResponse.json({ moyasar: moyasarInfo(), integrations });
}
