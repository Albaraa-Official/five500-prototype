// اختبار تحمّل: يحاكي N عميلاً يطلبون في نفس اللحظة (تدفق كامل: طلب → دفعة → تأكيد).
// التشغيل: BASE=http://localhost:3200 N=20 node scripts/loadtest.mjs
const BASE = process.env.BASE || "http://localhost:3200";
const N = parseInt(process.env.N || "20", 10);

// سلة متنوعة لكل عميل (تُختار حسب الفهرس)
const CARTS = [
  [{ productId: "five-beef", size: "reg", qty: 2 }, { productId: "cola", size: "reg", qty: 2 }],
  [{ productId: "five-chicken", size: "large", qty: 1 }, { productId: "fries-five", size: "reg", qty: 1 }],
  [{ productId: "bite-beef", size: "reg", qty: 3 }],
  [{ productId: "maple-chicken", size: "large", qty: 2 }, { productId: "sprite", size: "reg", qty: 1 }],
];

async function timed(fn) {
  const t0 = performance.now();
  const r = await fn();
  return { ms: performance.now() - t0, r };
}

async function oneCustomer(i) {
  const steps = {};
  const cart = CARTS[i % CARTS.length];
  try {
    // 1) إنشاء الطلب
    let { ms, r } = await timed(() =>
      fetch(`${BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customerName: `عميل ${i + 1}`,
          customerPhone: `05${String(50000000 + i).slice(0, 8)}`,
        }),
      }).then(async (res) => ({ status: res.status, body: await res.json() }))
    );
    steps.order = ms;
    if (r.status !== 200) return { i, ok: false, stage: "order", status: r.status, body: r.body, steps };
    const orderId = r.body.orderId;
    const total = r.body.totalHalalas;

    // 2) إنشاء الدفعة
    ({ ms, r } = await timed(() =>
      fetch(`${BASE}/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).then(async (res) => ({ status: res.status, body: await res.json() }))
    ));
    steps.payment = ms;
    if (r.status !== 200) return { i, ok: false, stage: "payment", status: r.status, steps };
    const paymentId = r.body.paymentId;

    // 3) تسوية الدفع عبر webhook (يعمل في الإنتاج والتطوير)
    ({ ms, r } = await timed(() =>
      fetch(`${BASE}/api/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, providerRef: `lt_${paymentId}`, status: "paid" }),
      }).then(async (res) => ({ status: res.status, body: await res.json() }))
    ));
    steps.confirm = ms;
    if (!r.body.ok) return { i, ok: false, stage: "confirm", status: r.status, body: r.body, steps };

    return { i, ok: true, orderId, total, steps };
  } catch (e) {
    return { i, ok: false, stage: "exception", error: String(e), steps };
  }
}

function pct(arr, p) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

(async () => {
  console.log(`\n🔥 اختبار تحمّل: ${N} عميل متزامن ضد ${BASE}\n`);
  const t0 = performance.now();
  const results = await Promise.all(Array.from({ length: N }, (_, i) => oneCustomer(i)));
  const wall = performance.now() - t0;

  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  const e2e = ok.map((r) => r.steps.order + r.steps.payment + r.steps.confirm);

  console.log(`النتيجة: ✅ ${ok.length}/${N} نجح  |  ❌ ${fail.length} فشل`);
  console.log(`الزمن الكلي (wall-clock): ${wall.toFixed(0)}ms لكل الـ${N} دفعة واحدة`);
  console.log(`الإنتاجية: ${(N / (wall / 1000)).toFixed(1)} طلب/ثانية`);
  if (e2e.length) {
    console.log(`زمن التدفق الكامل لكل عميل:`);
    console.log(`   أدنى: ${Math.min(...e2e).toFixed(0)}ms | وسيط(p50): ${pct(e2e, 50).toFixed(0)}ms | p95: ${pct(e2e, 95).toFixed(0)}ms | أقصى: ${Math.max(...e2e).toFixed(0)}ms`);
    const orderMs = ok.map((r) => r.steps.order);
    console.log(`   منها إنشاء الطلب: وسيط ${pct(orderMs, 50).toFixed(0)}ms | p95 ${pct(orderMs, 95).toFixed(0)}ms`);
  }
  if (fail.length) {
    console.log(`\nعيّنة من الأخطاء:`);
    fail.slice(0, 5).forEach((f) => console.log(`   عميل ${f.i + 1}: مرحلة=${f.stage} status=${f.status || "-"} ${f.error || JSON.stringify(f.body || "")}`));
  }
  console.log("");
})();
