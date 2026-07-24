// ZATCA المرحلة الأولى — رمز QR بترميز TLV (Tag-Length-Value) لفاتورة ضريبية مبسطة.
// لا يتطلب توقيعاً رقمياً في المرحلة الأولى، فقط تشفير TLV بالحقول الخمسة.

const SELLER_NAME_TAG = 1;
const VAT_NUMBER_TAG = 2;
const TIMESTAMP_TAG = 3;
const TOTAL_TAG = 4;
const VAT_TOTAL_TAG = 5;

// اسم البائع الافتراضي إن لم يُضبط SELLER_NAME_AR
const DEFAULT_SELLER_NAME_AR = "مطعم خمس مائة لتقديم الوجبات";

function tlv(tag, value) {
  const valueBuf = Buffer.from(String(value), "utf8");
  const header = Buffer.from([tag, valueBuf.length]);
  return Buffer.concat([header, valueBuf]);
}

// يبني سلسلة base64 لترميز TLV حسب مواصفة ZATCA (المرحلة الأولى).
export function buildTlvQrBase64({ sellerName, vatNumber, timestamp, totalWithVat, vatTotal }) {
  const buf = Buffer.concat([
    tlv(SELLER_NAME_TAG, sellerName),
    tlv(VAT_NUMBER_TAG, vatNumber),
    tlv(TIMESTAMP_TAG, timestamp),
    tlv(TOTAL_TAG, totalWithVat),
    tlv(VAT_TOTAL_TAG, vatTotal),
  ]);
  return buf.toString("base64");
}

// هل إعداد ZATCA مفعّل؟ يعتمد على وجود الرقم الضريبي في متغيرات البيئة.
export function isZatcaConfigured() {
  return !!process.env.TAX_NUMBER;
}

export function getSellerNameAr() {
  return process.env.SELLER_NAME_AR || DEFAULT_SELLER_NAME_AR;
}
