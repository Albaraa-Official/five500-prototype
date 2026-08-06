// تطبيع رقم الجوال السعودي إلى صيغة E.164 (+9665XXXXXXXX).
export function normalizeSaudiPhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  // يجب أن يبدأ بـ 5 ويكون 9 أرقام (5XXXXXXXX)
  if (!/^5\d{8}$/.test(d)) return null;
  return `+966${d}`;
}
