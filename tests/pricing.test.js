// اختبارات وحدة للمنطق المالي الحرج (بدون إطار خارجي — node --test).
// التشغيل: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { vatOf, toHalalas } from "../lib/money.js";
import { normalizeSaudiPhone } from "../lib/phone.js";

test("VAT = 15% مقرّبة لأقرب هللة", () => {
  assert.equal(vatOf(4100), 615); // 4100 * 0.15 = 615
  assert.equal(vatOf(100), 15);
  assert.equal(vatOf(333), 50); // 49.95 → 50
});

test("toHalalas يحوّل الريال لهللات", () => {
  assert.equal(toHalalas(19), 1900);
  assert.equal(toHalalas(2.5), 250);
});

test("تطبيع الجوال السعودي إلى E.164", () => {
  assert.equal(normalizeSaudiPhone("0556927406"), "+966556927406");
  assert.equal(normalizeSaudiPhone("+966556927406"), "+966556927406");
  assert.equal(normalizeSaudiPhone("966556927406"), "+966556927406");
  assert.equal(normalizeSaudiPhone("556927406"), "+966556927406");
});

test("رفض أرقام الجوال غير الصالحة", () => {
  assert.equal(normalizeSaudiPhone("123"), null);
  assert.equal(normalizeSaudiPhone("0446927406"), null); // لا يبدأ بـ 5
  assert.equal(normalizeSaudiPhone(""), null);
  assert.equal(normalizeSaudiPhone(null), null);
});
