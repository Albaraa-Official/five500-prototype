// تكامل Moyasar — التحقق من جهة السيرفر (المصدر الموثوق).
// التدفق: العميل يدفع عبر واجهة Moyasar (publishable key) → Moyasar ينشئ payment
// → webhook + هذا التحقق يؤكّدان النتيجة والمبلغ قبل تعليم الطلب مدفوعاً.
const MOYASAR_API = "https://api.moyasar.com/v1";

export function isMoyasarEnabled() {
  return !!process.env.MOYASAR_SECRET_KEY;
}

// يجلب تفاصيل دفعة من Moyasar بمعرّفها للتحقق (status + amount).
export async function fetchMoyasarPayment(providerPaymentId) {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) throw new Error("MOYASAR_SECRET_KEY غير مضبوط");

  const auth = Buffer.from(`${key}:`).toString("base64");
  const res = await fetch(`${MOYASAR_API}/payments/${providerPaymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Moyasar fetch فشل: ${res.status}`);
  const p = await res.json();
  // Moyasar يعيد المبلغ بالهللات مباشرة (amount) وحالة "paid"
  return { status: p.status, amountHalalas: p.amount, id: p.id, raw: p };
}
