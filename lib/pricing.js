// حساب سعر الطلب من مصدر موثوق (قاعدة البيانات) — لا يُوثق بأي سعر من العميل.
import { prisma } from "@/lib/prisma";
import { vatOf } from "@/lib/money";

// items: [{ productId, size, qty }]
// يُعيد { lines, subtotalHalalas, vatHalalas, totalHalalas } أو يرمي خطأ إن كان صنف غير صالح.
export async function priceOrder(items) {
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

  const vatHalalas = vatOf(subtotalHalalas);
  const totalHalalas = subtotalHalalas + vatHalalas;
  return { lines, subtotalHalalas, vatHalalas, totalHalalas };
}
