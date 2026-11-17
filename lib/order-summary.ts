import { isPaymentMethod, type PaymentMethod } from "./order-rules";

/**
 * สรุปออเดอร์ที่แสดงหลังสั่งซื้อสำเร็จ
 * ตั้งใจไม่เก็บชื่อ เบอร์โทร และที่อยู่ลูกค้าไว้ในนี้ (ลดการเก็บข้อมูลส่วนบุคคลในเบราว์เซอร์)
 */
export type OrderSummaryItem = {
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderSummary = {
  orderNo: string;
  items: OrderSummaryItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalQuantity: number;
  deliveryAt: string;
  paymentMethod: PaymentMethod;
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function isMoney(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function parseItem(value: unknown): OrderSummaryItem | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const item = {
    name: typeof v.name === "string" ? v.name : "",
    unitPrice: toNumber(v.unitPrice ?? v.unit_price),
    quantity: toNumber(v.quantity),
    lineTotal: toNumber(v.lineTotal ?? v.line_total),
  };
  if (
    !item.name ||
    !isMoney(item.unitPrice) ||
    !isMoney(item.lineTotal) ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  ) {
    return null;
  }
  return item;
}

/** ตรวจรูปแบบสรุปออเดอร์ (รับได้ทั้งแบบ camelCase และแบบ snake_case จากฐานข้อมูล) */
export function parseOrderSummary(value: unknown): OrderSummary | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;

  const orderNo = v.orderNo ?? v.order_no;
  const deliveryAt = v.deliveryAt ?? v.delivery_at;
  const paymentMethod = v.paymentMethod ?? v.payment_method;
  if (typeof orderNo !== "string" || !/^ICE-\d{6}-\d{4}$/.test(orderNo)) {
    return null;
  }
  if (typeof deliveryAt !== "string" || !isPaymentMethod(paymentMethod)) {
    return null;
  }
  if (!Array.isArray(v.items) || v.items.length === 0) return null;

  const items: OrderSummaryItem[] = [];
  for (const raw of v.items) {
    const item = parseItem(raw);
    if (!item) return null;
    items.push(item);
  }

  const subtotal = toNumber(v.subtotal);
  const deliveryFee = toNumber(v.deliveryFee ?? v.delivery_fee);
  const total = toNumber(v.total);
  const totalQuantity = toNumber(v.totalQuantity ?? v.total_quantity);
  if (
    !isMoney(subtotal) ||
    !isMoney(deliveryFee) ||
    !isMoney(total) ||
    !Number.isInteger(totalQuantity)
  ) {
    return null;
  }

  return {
    orderNo,
    items,
    subtotal,
    deliveryFee,
    total,
    totalQuantity,
    deliveryAt,
    paymentMethod,
  };
}
