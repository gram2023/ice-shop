import { parseCartLines, type CartLine } from "./cart";
import { isValidDeliverySlot, toBangkokIso, type DeliverySchedule } from "./delivery";
import {
  isPaymentMethod,
  isValidPhone,
  normalizePhone,
  ORDER_LIMITS,
  type PaymentMethod,
} from "./order-rules";

/**
 * ตรวจข้อมูลฟอร์มสั่งซื้อ ใช้ทั้ง 2 ฝั่ง:
 * - เบราว์เซอร์: แจ้งข้อผิดพลาดทันทีตอนกดสั่งซื้อ
 * - Server Action: ตรวจซ้ำ เพราะคำขอปลอมส่งมาตรง ๆ ได้โดยไม่ผ่านหน้าเว็บ
 */

export type CheckoutField =
  | "name"
  | "phone"
  | "address"
  | "deliveryDate"
  | "deliveryTime"
  | "paymentMethod"
  | "note"
  | "items";

export type FieldErrors = Partial<Record<CheckoutField, string>>;

export type CheckoutInput = {
  name: string;
  phone: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
  note: string;
  items: CartLine[];
};

export type ValidCheckout = {
  name: string;
  phone: string;
  address: string;
  deliveryAtIso: string;
  paymentMethod: PaymentMethod;
  note: string | null;
  items: CartLine[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCheckout(
  input: unknown,
  nowMs: number,
  schedule: DeliverySchedule,
): { ok: true; data: ValidCheckout } | { ok: false; errors: FieldErrors } {
  const raw = (
    typeof input === "object" && input !== null ? input : {}
  ) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = text(raw.name);
  if (name.length < ORDER_LIMITS.nameMin) {
    errors.name = "กรุณากรอกชื่อผู้สั่ง";
  } else if (name.length > ORDER_LIMITS.nameMax) {
    errors.name = `ชื่อยาวเกิน ${ORDER_LIMITS.nameMax} ตัวอักษร`;
  }

  const phone = normalizePhone(text(raw.phone));
  if (!phone) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!isValidPhone(phone)) {
    errors.phone = "เบอร์โทรไม่ถูกต้อง กรุณากรอกตัวเลข 9–10 หลัก เช่น 081-234-5678";
  }

  const address = text(raw.address);
  if (address.length < ORDER_LIMITS.addressMin) {
    errors.address = "กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน (บ้านเลขที่ ถนน/ซอย ตำบล)";
  } else if (address.length > ORDER_LIMITS.addressMax) {
    errors.address = `ที่อยู่ยาวเกิน ${ORDER_LIMITS.addressMax} ตัวอักษร`;
  }

  const note = text(raw.note);
  if (note.length > ORDER_LIMITS.noteMax) {
    errors.note = `หมายเหตุยาวเกิน ${ORDER_LIMITS.noteMax} ตัวอักษร`;
  }

  const deliveryDate = text(raw.deliveryDate);
  const deliveryTime = text(raw.deliveryTime);
  if (!deliveryDate) {
    errors.deliveryDate = "กรุณาเลือกวันจัดส่ง";
  } else if (!deliveryTime) {
    errors.deliveryTime = "กรุณาเลือกเวลาจัดส่ง";
  } else if (!isValidDeliverySlot(deliveryDate, deliveryTime, nowMs, schedule)) {
    errors.deliveryTime = "เวลาที่เลือกจัดส่งไม่ได้แล้ว กรุณาเลือกเวลาใหม่";
  }

  const paymentMethod = raw.paymentMethod;
  if (!isPaymentMethod(paymentMethod)) {
    errors.paymentMethod = "กรุณาเลือกวิธีชำระเงิน";
  }

  const items = parseCartLines(raw.items, "strict");
  if (!items) {
    errors.items = "ข้อมูลสินค้าในตะกร้าไม่ถูกต้อง กรุณากลับไปตรวจสอบตะกร้า";
  }

  if (Object.keys(errors).length > 0 || !items || !isPaymentMethod(paymentMethod)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      address,
      deliveryAtIso: toBangkokIso(deliveryDate, deliveryTime),
      paymentMethod,
      note: note || null,
      items,
    },
  };
}
