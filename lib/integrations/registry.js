// سجل التكاملات — نقطة التوسّع الوحيدة لإضافة أنظمة جديدة (Foodics، Salla، HyperPay، Paylink...)
// كل تكامل عبارة عن adapter بواجهة موحّدة:
//   { key, name, category, isConfigured(): boolean,
//     testConnection(config): Promise<{ok, message}>,
//     pushOrder(order, config): Promise<{ok, message}> }  // فقط لتكاملات category "pos"
// لإضافة تكامل جديد: أنشئ ملف lib/integrations/<name>.js بنفس الشكل، ثم سجّله هنا —
// لا حاجة لتعديل أي كود آخر (dispatch، الإعدادات، لوحة الإدارة تقرأ من هذا السجل).
import { isLoyverseConfigured, testLoyverseConnection, pushOrderToLoyverse } from "@/lib/integrations/loyverse";

export const INTEGRATIONS = {
  loyverse: {
    key: "loyverse",
    name: "Loyverse POS",
    category: "pos",
    isConfigured: isLoyverseConfigured,
    testConnection: (config) => testLoyverseConnection(config?.storeId),
    pushOrder: (order, config) => pushOrderToLoyverse(order, config?.storeId),
  },
};

export function getIntegration(key) {
  return INTEGRATIONS[key] || null;
}

export function listIntegrations() {
  return Object.values(INTEGRATIONS);
}

export function listPosIntegrations() {
  return listIntegrations().filter((i) => i.category === "pos");
}
