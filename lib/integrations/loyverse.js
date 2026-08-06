// تكامل Loyverse POS — Official Loyverse API (https://developer.loyverse.com).
// يُرسل الطلب كـ Receipt جاهز الدفع فور تأكيد الدفع من Moyasar، دون أي تدخل يدوي.
//
// ملاحظة مهمة حول Loyverse API: كل بند (line item) يجب أن يُطابق variant_id موجود
// مسبقاً في كتالوج Loyverse. لا يدعم الـ API بنوداً حرة النص. لذا كل ProductPrice
// عندنا يحمل حقل loyverseVariantId اختيارياً (يُضبط من لوحة الإدارة). أي صنف بدون
// ربط لا يُرسل كبند، لكن يُذكر بوضوح في ملاحظة الإيصال حتى يضيفه الكاشير يدوياً.

const API_BASE = "https://api.loyverse.com/v1.0";

function accessToken() {
  return process.env.LOYVERSE_ACCESS_TOKEN || "";
}

export function isLoyverseConfigured() {
  return !!accessToken();
}

async function call(path, options = {}) {
  const token = accessToken();
  if (!token) throw new Error("LOYVERSE_ACCESS_TOKEN غير مضبوط");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    const err = new Error(`Loyverse API: ${msg}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// فحص الاتصال — يُستخدم من "Test Connection" في لوحة الإدارة، ويتحقق أيضاً أن Store ID المُدخل صالح.
export async function testLoyverseConnection(storeId) {
  const stores = await call("/stores");
  const list = stores?.stores || [];
  if (storeId) {
    const found = list.some((s) => s.id === storeId);
    if (!found) {
      return { ok: false, message: `Store ID غير موجود ضمن متاجر الحساب (${list.length} متجر متاح).` };
    }
  }
  return { ok: true, message: `متصل بنجاح. ${list.length} متجر متاح.`, stores: list.map((s) => ({ id: s.id, name: s.name })) };
}

// نوع الدفع الافتراضي — يُحدَّد يدوياً عبر LOYVERSE_PAYMENT_TYPE_ID، أو يُكتشف تلقائياً
// (يُفضَّل نوع غير نقدي كالبطاقة/الدفع الإلكتروني) ويُخزَّن مؤقتاً في الذاكرة.
let cachedPaymentTypeId = null;
async function resolvePaymentTypeId() {
  if (process.env.LOYVERSE_PAYMENT_TYPE_ID) return process.env.LOYVERSE_PAYMENT_TYPE_ID;
  if (cachedPaymentTypeId) return cachedPaymentTypeId;

  const data = await call("/payment_types");
  const types = data?.payment_types || [];
  const preferred = types.find((t) => /card|online|electronic/i.test(t.name)) || types[0];
  if (!preferred) throw new Error("لا يوجد أي payment type مُعرَّف في حساب Loyverse");
  cachedPaymentTypeId = preferred.id;
  return preferred.id;
}

// يبحث عن عميل بجواله أو ينشئه — لإرفاق سجل الطلبات بحساب العميل داخل Loyverse.
async function resolveCustomerId(name, phone) {
  if (!phone) return null;
  try {
    const found = await call(`/customers?phone_number=${encodeURIComponent(phone)}`);
    const existing = found?.customers?.[0];
    if (existing) return existing.id;

    const created = await call("/customers", {
      method: "POST",
      body: JSON.stringify({ name: name || phone, phone_number: phone }),
    });
    return created?.id || null;
  } catch (err) {
    // فشل ربط العميل لا يجب أن يمنع إرسال الطلب نفسه.
    console.error("Loyverse: تعذّر إيجاد/إنشاء العميل:", err.message);
    return null;
  }
}

function orderTypeLabel(orderType) {
  return orderType === "delivery" ? "توصيل" : "استلام من الفرع";
}

// يبني حمولة الإيصال (Receipt) من طلبنا الداخلي.
export async function buildReceiptPayload(order, storeId) {
  const mapped = [];
  const unmapped = [];

  for (const item of order.items) {
    const variantId = item.product?.prices?.find((p) => p.size === item.size)?.loyverseVariantId;
    if (variantId) {
      mapped.push({ variant_id: variantId, quantity: item.qty, price: item.unitPriceHalalas / 100 });
    } else {
      unmapped.push(`${item.qty}× ${item.product?.name || item.productId} (${item.size === "large" ? "كبير" : "عادي"})`);
    }
  }

  const mappedTotalHalalas = mapped.reduce((s, l) => s + Math.round(l.price * 100) * l.quantity, 0);

  const noteLines = [
    `طلب الموقع #F500-${order.id.slice(-6).toUpperCase()}`,
    `نوع الطلب: ${orderTypeLabel(order.orderType)}`,
  ];
  if (order.plate) noteLines.push(`لوحة السيارة: ${order.plate}`);
  if (order.notes) noteLines.push(`ملاحظات العميل: ${order.notes}`);
  if (unmapped.length) {
    noteLines.push(`⚠️ أصناف تحتاج إضافة يدوية (غير مربوطة بكتالوج Loyverse): ${unmapped.join("، ")}`);
  }
  if (order.discountHalalas > 0) {
    noteLines.push(`خصم مطبَّق: ${(order.discountHalalas / 100).toFixed(2)} ﷼${order.discountCode ? ` (${order.discountCode})` : ""}`);
  }

  const paymentTypeId = await resolvePaymentTypeId();
  const customerId = await resolveCustomerId(order.customerName, order.customerPhone);

  // مبلغ الدفعة المُسجَّلة في Loyverse يطابق مجموع البنود المُرسَلة فعلياً (لا الإجمالي الكامل)
  // حتى تبقى بيانات الإيصال متسقة داخلياً؛ الفرق (إن وجد بسبب أصناف غير مربوطة) موضّح في الملاحظة.
  return {
    store_id: storeId,
    source: "FIVE 500 Website",
    note: noteLines.join(" | "),
    line_items: mapped,
    payments: [{ payment_type_id: paymentTypeId, money_amount: mappedTotalHalalas / 100 }],
    ...(customerId ? { customer_id: customerId } : {}),
  };
}

// يُرسل الطلب كإيصال جاهز (مدفوع) إلى Loyverse. يُستدعى فقط بعد تأكيد الدفع الناجح.
export async function pushOrderToLoyverse(order, storeId) {
  if (!storeId) throw new Error("Loyverse Store ID غير مضبوط");
  if (!order.items?.length) throw new Error("الطلب بلا أصناف");

  const payload = await buildReceiptPayload(order, storeId);
  if (payload.line_items.length === 0) {
    throw new Error("كل أصناف الطلب غير مربوطة بكتالوج Loyverse — لم يُرسَل أي بند.");
  }

  const receipt = await call("/receipts", { method: "POST", body: JSON.stringify(payload) });
  return { ok: true, receiptId: receipt?.receipt_number || receipt?.id, raw: receipt };
}
