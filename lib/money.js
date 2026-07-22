// أدوات مالية — كل الحسابات بالهللات (عدد صحيح). ضريبة القيمة المضافة 15%.
export const VAT_RATE = 0.15;

// حساب الضريبة على مبلغ بالهللات، مقرّبة لأقرب هللة.
export function vatOf(subtotalHalalas) {
  return Math.round(subtotalHalalas * VAT_RATE);
}

// تحويل من ريال (عدد) إلى هللات.
export const toHalalas = (sar) => Math.round(sar * 100);

// تنسيق هللات كنص بالريال للعرض.
export const formatSAR = (halalas) => `${(halalas / 100).toFixed(halalas % 100 === 0 ? 0 : 2)} ﷼`;
