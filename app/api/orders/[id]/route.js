// GET /api/orders/[id] — تفاصيل وحالة الطلب (لصفحة النجاح/التتبّع).
// طلبات المستخدم المسجّل محميّة بجلسته؛ طلبات الضيف تُقرأ بالمعرّف (cuid غير قابل للتخمين).
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { buildTlvQrBase64, isZatcaConfigured, getSellerNameAr } from "@/lib/zatca";

export async function GET(req, { params }) {
  // حد معدّل لمنع تعداد/كشط معرّفات الطلبات عبر IP واحد
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  const rl = await rateLimit(`order-lookup:${ip}`, 60, 5 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { select: { name: true, img: true, emoji: true } } } },
      payment: { select: { status: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // إن كان الطلب مربوطاً بمستخدم، يجب أن تطابق الجلسة صاحبه.
  if (order.userId) {
    const uid = getSessionUserId();
    if (uid !== order.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const uid = getSessionUserId();
  // رقم الجوال يُعاد للمستخدم المسجّل فقط، لا لطلبات الضيوف
  const showPhone = !!order.userId && uid === order.userId;

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      subtotalHalalas: order.subtotalHalalas,
      vatHalalas: order.vatHalalas,
      totalHalalas: order.totalHalalas,
      customerName: order.customerName,
      ...(showPhone ? { customerPhone: order.customerPhone } : {}),
      plate: order.plate,
      createdAt: order.createdAt,
      paymentStatus: order.payment?.status || null,
      items: order.items.map((i) => ({
        name: i.product.name,
        img: i.product.img,
        emoji: i.product.emoji,
        size: i.size,
        qty: i.qty,
        unitPriceHalalas: i.unitPriceHalalas,
      })),
      // رمز QR لفاتورة ضريبية مبسطة (ZATCA المرحلة الأولى) — فقط إن كان الرقم الضريبي مضبوطاً
      ...(isZatcaConfigured()
        ? {
            zatcaQr: buildTlvQrBase64({
              sellerName: getSellerNameAr(),
              vatNumber: process.env.TAX_NUMBER,
              timestamp: order.createdAt.toISOString(),
              totalWithVat: (order.totalHalalas / 100).toFixed(2),
              vatTotal: (order.vatHalalas / 100).toFixed(2),
            }),
          }
        : {}),
    },
  });
}
