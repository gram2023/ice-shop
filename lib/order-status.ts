/**
 * สถานะออเดอร์และกฎการเปลี่ยนสถานะ (ตรงกับ check constraint ในตาราง orders)
 *
 * ลำดับปกติ: ใหม่ → รับแล้ว → กำลังเตรียม → กำลังส่ง → ส่งแล้ว
 * - ไปข้างหน้าได้ทีละ 1 ขั้น และย้อนกลับได้ 1 ขั้น (กรณีกดพลาด)
 * - ยกเลิกได้ก่อนถึง "ส่งแล้ว"
 * - ออเดอร์ที่ยกเลิก กู้คืนได้ (กลับไปเป็น "ใหม่")
 */

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** ลำดับปกติของงาน (ไม่รวม "ยกเลิก") */
const FLOW: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "delivering",
  "delivered",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "ใหม่",
  accepted: "รับแล้ว",
  preparing: "กำลังเตรียม",
  delivering: "กำลังส่ง",
  delivered: "ส่งแล้ว",
  cancelled: "ยกเลิก",
};

/** ข้อความบนปุ่มไปขั้นถัดไป */
const NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  pending: "รับออเดอร์",
  accepted: "เริ่มเตรียมของ",
  preparing: "ออกไปส่ง",
  delivering: "ส่งถึงลูกค้าแล้ว",
};

/** แท็บที่งานยังไม่จบ เรียงตามเวลาจัดส่ง (ใกล้สุดก่อน) */
export const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "delivering",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = FLOW.indexOf(status);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
}

export function previousStatus(status: OrderStatus): OrderStatus | null {
  const i = FLOW.indexOf(status);
  return i > 0 ? FLOW[i - 1] : null;
}

export function canCancel(status: OrderStatus) {
  return status !== "delivered" && status !== "cancelled";
}

export type StatusAction = {
  to: OrderStatus;
  label: string;
  kind: "next" | "back" | "cancel" | "restore";
};

/** ปุ่มที่ควรแสดงสำหรับสถานะปัจจุบัน */
export function getStatusActions(status: OrderStatus): StatusAction[] {
  if (status === "cancelled") {
    return [{ to: "pending", label: "กู้คืนออเดอร์ (กลับเป็น “ใหม่”)", kind: "restore" }];
  }

  const actions: StatusAction[] = [];
  const next = nextStatus(status);
  if (next) {
    actions.push({ to: next, label: NEXT_LABELS[status] ?? STATUS_LABELS[next], kind: "next" });
  }
  const prev = previousStatus(status);
  if (prev) {
    actions.push({ to: prev, label: `ย้อนกลับเป็น “${STATUS_LABELS[prev]}”`, kind: "back" });
  }
  if (canCancel(status)) {
    actions.push({ to: "cancelled", label: "ยกเลิกออเดอร์", kind: "cancel" });
  }
  return actions;
}

/** ตรวจว่าเปลี่ยนจากสถานะหนึ่งไปอีกสถานะได้หรือไม่ (ใช้ตรวจซ้ำฝั่ง server) */
export function isAllowedTransition(from: OrderStatus, to: OrderStatus) {
  return getStatusActions(from).some((a) => a.to === to);
}

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "ยังไม่ชำระ",
  paid: "ชำระแล้ว",
};

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(value as PaymentStatus);
}
