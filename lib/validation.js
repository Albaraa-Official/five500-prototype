// مخططات التحقق (Zod) لكل مدخلات الـ API. رفض الحقول الزائدة.
import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().min(9).max(20),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(9).max(20),
  code: z.string().regex(/^\d{4}$/),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.enum(["reg", "large"]),
        qty: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(50),
  customerName: z.string().trim().min(1).max(80),
  customerPhone: z.string().min(9).max(20),
  plate: z.string().trim().max(20).optional().nullable(),
  discountCode: z.string().trim().max(50).optional().nullable(),
  orderType: z.enum(["pickup", "delivery"]).optional(),
  notes: z.string().trim().max(300).optional().nullable(),
}).strict();

export const createPaymentSchema = z.object({
  orderId: z.string().min(1),
}).strict();
