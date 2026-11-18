import { isPaymentMethod, type PaymentMethod } from "./order-rules";
import {
  isOrderStatus,
  isPaymentStatus,
  type OrderStatus,
  type PaymentStatus,
} from "./order-status";

/**
 * ติดตามออเดอร์ฝั่งลูกค้า (ฟังก์ชันล้วน ใช้ได้ทั้งเบราว์เซอร์และ server)
 */

export type TrackedOrder = {
  orderNo: string;
  customerNameMasked: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAt: string;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: { name: string; quantity: number; lineTotal: number }[];
};

/** " ice-261117-4821 " → "ICE-261117-4821" */
export function normalizeOrderNo(raw: string) {
  return raw.trim().toUpperCase();
}

export function isValidOrderNo(orderNo: string) {
  return /^ICE-\d{6}-\d{4}$/.test(orderNo);
}

/** ขั้นตอนบนแถบสถานะ (ข้อความสำหรับลูกค้า) */
export const TRACK_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "ร้านได้รับคำสั่งซื้อ" },
  { status: "accepted", label: "ร้านยืนยันแล้ว" },
  { status: "preparing", label: "กำลังเตรียมน้ำแข็ง" },
  { status: "delivering", label: "กำลังจัดส่ง" },
  { status: "delivered", label: "ส่งถึงแล้ว" },
];

/** ตำแหน่งขั้นปัจจุบันบนแถบสถานะ (-1 = ยกเลิก) */
export function currentStepIndex(status: OrderStatus) {
  return TRACK_STEPS.findIndex((step) => step.status === status);
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

const isMoney = (n: number) => Number.isFinite(n) && n >= 0;

/**
 * ตรวจข้อมูลที่ฟังก์ชัน track_order ส่งกลับ
 * คืนค่า { found: false } เมื่อไม่พบ, null เมื่อรูปแบบข้อมูลผิด
 */
export function parseTrackResponse(
  value: unknown,
): { found: true; order: TrackedOrder } | { found: false } | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (v.found === false) return { found: false };
  if (v.found !== true) return null;

  const orderNo = typeof v.order_no === "string" ? v.order_no : "";
  if (
    !isValidOrderNo(orderNo) ||
    !isOrderStatus(v.status) ||
    !isPaymentStatus(v.payment_status) ||
    !isPaymentMethod(v.payment_method) ||
    typeof v.delivery_at !== "string" ||
    typeof v.created_at !== "string"
  ) {
    return null;
  }

  const subtotal = toNumber(v.subtotal);
  const deliveryFee = toNumber(v.delivery_fee);
  const total = toNumber(v.total);
  if (!isMoney(subtotal) || !isMoney(deliveryFee) || !isMoney(total)) return null;

  const rawItems = Array.isArray(v.items) ? v.items : null;
  if (!rawItems) return null;
  const items: TrackedOrder["items"] = [];
  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) return null;
    const item = raw as Record<string, unknown>;
    const quantity = toNumber(item.quantity);
    const lineTotal = toNumber(item.line_total);
    if (typeof item.name !== "string" || !Number.isInteger(quantity) || quantity < 1 || !isMoney(lineTotal)) {
      return null;
    }
    items.push({ name: item.name, quantity, lineTotal });
  }

  return {
    found: true,
    order: {
      orderNo,
      customerNameMasked: typeof v.customer_name_masked === "string" ? v.customer_name_masked : "",
      status: v.status,
      paymentStatus: v.payment_status,
      paymentMethod: v.payment_method,
      deliveryAt: v.delivery_at,
      createdAt: v.created_at,
      subtotal,
      deliveryFee,
      total,
      items,
    },
  };
}
