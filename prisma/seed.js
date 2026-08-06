// Seed: ينقل المنيو من data/menu.js إلى قاعدة البيانات.
// الأسعار في المصدر بالريال (أعداد صحيحة) → نخزّنها بالهللات (×100).
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();

// نقرأ بيانات المنيو (ملف ESM) عبر تحويل بسيط: نعيد تعريفها هنا للاستقلالية عن الاستيراد.
// المصدر الوحيد للحقيقة يبقى data/menu.js — أي تعديل هناك يُعاد تشغيله عبر `npm run db:seed`.
async function loadMenu() {
  const mod = await import(path.join(process.cwd(), "data", "menu.js"));
  return { products: mod.products, categories: mod.categories };
}

async function main() {
  const { products } = await loadMenu();

  // فرع افتراضي واحد للإطلاق (المخطط يدعم عدة فروع)
  const branch = await prisma.branch.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", name: "الفرع الرئيسي" },
  });
  console.log("Branch:", branch.name);

  let count = 0;
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        category: p.cat,
        img: p.img ?? null,
        emoji: p.emoji ?? null,
        calories: p.cal ?? null,
        tag: p.tag ?? null,
        description: p.desc ?? null,
        active: true,
      },
      create: {
        id: p.id,
        name: p.name,
        category: p.cat,
        img: p.img ?? null,
        emoji: p.emoji ?? null,
        calories: p.cal ?? null,
        tag: p.tag ?? null,
        description: p.desc ?? null,
      },
    });

    // الأسعار: reg دائماً، large إن وُجد
    const prices = [{ size: "reg", priceHalalas: p.reg * 100 }];
    if (p.large) prices.push({ size: "large", priceHalalas: p.large * 100 });
    for (const pr of prices) {
      await prisma.productPrice.upsert({
        where: { productId_size: { productId: p.id, size: pr.size } },
        update: { priceHalalas: pr.priceHalalas },
        create: { productId: p.id, size: pr.size, priceHalalas: pr.priceHalalas },
      });
    }
    count++;
  }
  console.log(`Seeded ${count} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
