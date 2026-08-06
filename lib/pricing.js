// حساب سعر الطلب من مصدر موثوق (قاعدة البيانات) — لا يُوثق بأي سعر من العميل.
import { prisma } from "@/lib/prisma";
import { vatOf } from "@/lib/money";

// يتحقق من كود الخصم ويعيد { code, discountHalalas } أو null إن كان غير صالح.
// subtotalHalalas: المجموع قبل الخصم.
export async function resolveDiscount(rawCode, subtotalHalalas) {
  if (!rawCode) return null;
  const code = String(rawCode).trim().toUpperCase();
  const dc = await prisma.discountCode.findUnique({ where: { code } });
  if (!dc || !dc.active) return null;
  if (dc.expiresAt && dc.expiresAt < new Date()) return null;
  if (dc.maxUses != null && dc.uses >= dc.maxUses) return null;

  let discount = dc.type === "percent"
    ? Math.round((subtotalHalalas * dc.value) / 100)
    : dc.value;
  discount = Math.max(0, Math.min(discount, subtotalHalalas)); // لا يتجاوز المجموع
  return { code, discountHalalas: discount };
}

// items: [{ productId, size, qty }], discountCode اختياري
// يُعيد { lines, subtotalHalalas, discountHalalas, discountCode, vatHalalas, totalHalalas }
export async function priceOrder(items, discountCode = null) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const prices = await prisma.productPrice.findMany({
    where: { productId: { in: ids } },
    include: { product: { select: { active: true, name: true } } },
  });

  const lookup = new Map(prices.map((p) => [`${p.productId}:${p.size}`, p]));

  const lines = [];
  let subtotalHalalas = 0;
  for (const it of items) {
    const rec = lookup.get(`${it.productId}:${it.size}`);
    if (!rec || !rec.product.active) {
      const err = new Error(`صنف غير متاح: ${it.productId} (${it.size})`);
      err.code = "INVALID_ITEM";
      throw err;
    }
    const lineTotal = rec.priceHalalas * it.qty;
    subtotalHalalas += lineTotal;
    lines.push({
      productId: it.productId,
      size: it.size,
      qty: it.qty,
      unitPriceHalalas: rec.priceHalalas,
      name: rec.product.name,
    });
  }

  const discount = await resolveDiscount(discountCode, subtotalHalalas);
  const discountHalalas = discount ? discount.discountHalalas : 0;
  const taxable = subtotalHalalas - discountHalalas;
  const vatHalalas = vatOf(taxable);
  const totalHalalas = taxable + vatHalalas;

  return {
    lines,
    subtotalHalalas,
    discountHalalas,
    discountCode: discount ? discount.code : null,
    vatHalalas,
    totalHalalas,
  };
}
