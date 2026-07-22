// اختبار آلة حالة الطلب — الانتقالات المسموحة والممنوعة.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canTransition } from "../lib/orderStatus.js";

test("الانتقالات المسموحة", () => {
  assert.ok(canTransition("pending_payment", "paid"));
  assert.ok(canTransition("paid", "preparing"));
  assert.ok(canTransition("preparing", "ready"));
  assert.ok(canTransition("ready", "completed"));
  assert.ok(canTransition("paid", "cancelled"));
});

test("الانتقالات الممنوعة (قفزات/رجوع)", () => {
  assert.ok(!canTransition("paid", "completed")); // قفزة
  assert.ok(!canTransition("preparing", "paid")); // رجوع
  assert.ok(!canTransition("completed", "preparing")); // بعد الاكتمال
  assert.ok(!canTransition("ready", "cancelled")); // لا إلغاء بعد الجاهزية
  assert.ok(!canTransition("cancelled", "paid"));
});
