// آلة حالة الطلب — الانتقالات المسموحة فقط. تمنع القفزات غير المنطقية.
export const ORDER_FLOW = {
  pending_payment: ["paid", "payment_failed", "cancelled"],
  paid: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
  payment_failed: [],
};

export const KITCHEN_STATUSES = ["paid", "preparing", "ready", "completed", "cancelled"];

export function canTransition(from, to) {
  return (ORDER_FLOW[from] || []).includes(to);
}
