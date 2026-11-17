import { shopConfig } from "./shop-config";

/**
 * กฎการสั่งซื้อที่ใช้ร่วมกันทั้งฝั่งเบราว์เซอร์และฝั่ง server
 *
 * ⚠️ ค่าใน ORDER_LIMITS ต้องตรงกับค่าคงที่ใน supabase/place_order.sql
 *    (ฟังก์ชันในฐานข้อมูลคือด่านตรวจจริง ฝั่งเว็บตรวจเพื่อให้ลูกค้ารู้ผลทันที)
 */
export const ORDER_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  addressMin: 10,
  addressMax: 500,
  noteMax: 500,
  maxLines: 20,
  maxQuantity: 999,
} as const;

export const PAYMENT_METHODS = [
  {
    value: "transfer",
    label: "โอนเงินผ่านบัญชีธนาคาร",
    hint: "โอนแล้วส่งสลิปทาง LINE",
  },
  {
    value: "qr",
    label: "สแกน QR พร้อมเพย์",
    hint: "สแกนจ่ายแล้วส่งสลิปทาง LINE",
  },
  {
    value: "cod",
    label: "เก็บเงินปลายทาง",
    hint: "ชำระเงินสดเมื่อได้รับน้ำแข็ง",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((m) => m.value === value);
}

export function paymentMethodLabel(value: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

/** ตัดช่องว่างและขีดออกจากเบอร์โทร เช่น "081-234 5678" → "0812345678" */
export function normalizePhone(raw: string) {
  return raw.replace(/[\s-]/g, "");
}

/** เบอร์โทรไทย 9–10 หลัก ขึ้นต้นด้วย 0 */
export function isValidPhone(phone: string) {
  return /^0\d{8,9}$/.test(phone);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** ราคารวมของสินค้า 1 รายการ (ราคาต่อถุง × จำนวน) */
export function lineTotal(price: number, quantity: number) {
  return roundMoney(price * quantity);
}

export type Totals = {
  totalQuantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  freeShipping: boolean;
  /** ต้องสั่งเพิ่มอีกกี่ถุงถึงจะส่งฟรี (0 = ส่งฟรีแล้ว) */
  remainingForFreeShipping: number;
};

/** คำนวณยอดเงิน (ใช้แสดงผลเท่านั้น ยอดจริงคำนวณในฐานข้อมูลตอนสั่งซื้อ) */
export function calculateTotals(
  lines: { price: number; quantity: number }[],
  baseDeliveryFee: number,
): Totals {
  const minQty = shopConfig.orderRules.freeShippingMinQty;
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = roundMoney(
    lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
  );
  const freeShipping = totalQuantity >= minQty;
  const deliveryFee = freeShipping ? 0 : baseDeliveryFee;

  return {
    totalQuantity,
    subtotal,
    deliveryFee,
    total: roundMoney(subtotal + deliveryFee),
    freeShipping,
    remainingForFreeShipping: Math.max(0, minQty - totalQuantity),
  };
}
