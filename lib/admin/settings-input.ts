import { parsePrice } from "./product-input";

/**
 * ตรวจข้อมูลฟอร์มตั้งค่าร้าน (ใช้ฝั่ง server ใน Server Action)
 */

export const SETTINGS_LIMITS = {
  deliveryFeeMax: 10000,
  freeShippingMax: 999,
  promoTextMax: 200,
  bankNameMax: 100,
  accountNameMax: 100,
} as const;

export type SettingsField =
  | "deliveryFee"
  | "freeShippingMinQty"
  | "promoText"
  | "bankName"
  | "accountName"
  | "accountNumber"
  | "promptPayId";

export type SettingsErrors = Partial<Record<SettingsField | "qrImage", string>>;

export type SettingsFormValues = Record<SettingsField, string>;

export type SettingsInput = {
  deliveryFee: number;
  freeShippingMinQty: number;
  promoText: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  promptPayId: string | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function readSettingsForm(get: (name: string) => unknown): SettingsFormValues {
  return {
    deliveryFee: text(get("deliveryFee")),
    freeShippingMinQty: text(get("freeShippingMinQty")),
    promoText: text(get("promoText")),
    bankName: text(get("bankName")),
    accountName: text(get("accountName")),
    accountNumber: text(get("accountNumber")),
    promptPayId: text(get("promptPayId")),
  };
}

export function validateSettingsInput(
  values: SettingsFormValues,
): { ok: true; data: SettingsInput } | { ok: false; errors: SettingsErrors } {
  const errors: SettingsErrors = {};

  const deliveryFee = parsePrice(values.deliveryFee);
  if (!values.deliveryFee) errors.deliveryFee = "กรุณากรอกค่าส่ง (ใส่ 0 ถ้าส่งฟรีทุกออเดอร์)";
  else if (deliveryFee === null || deliveryFee > SETTINGS_LIMITS.deliveryFeeMax) {
    errors.deliveryFee = `ค่าส่งไม่ถูกต้อง กรอกตัวเลข 0–${SETTINGS_LIMITS.deliveryFeeMax.toLocaleString("th-TH")}`;
  }

  const freeShipping = /^\d{1,3}$/.test(values.freeShippingMinQty)
    ? Number(values.freeShippingMinQty)
    : null;
  if (freeShipping === null || freeShipping > SETTINGS_LIMITS.freeShippingMax) {
    errors.freeShippingMinQty = `กรอกจำนวนถุงเป็นตัวเลข 0–${SETTINGS_LIMITS.freeShippingMax} (0 = ไม่มีส่งฟรี)`;
  }

  if (values.promoText.length > SETTINGS_LIMITS.promoTextMax) {
    errors.promoText = `ข้อความโปรโมชั่นยาวเกิน ${SETTINGS_LIMITS.promoTextMax} ตัวอักษร`;
  }

  if (values.bankName.length > SETTINGS_LIMITS.bankNameMax) {
    errors.bankName = `ชื่อธนาคารยาวเกิน ${SETTINGS_LIMITS.bankNameMax} ตัวอักษร`;
  }
  if (values.accountName.length > SETTINGS_LIMITS.accountNameMax) {
    errors.accountName = `ชื่อบัญชียาวเกิน ${SETTINGS_LIMITS.accountNameMax} ตัวอักษร`;
  }

  // เลขบัญชี: ตัวเลข 10–15 หลัก (เว้นวรรค/ขีดได้)
  const accountDigits = values.accountNumber.replace(/[\s-]/g, "");
  if (values.accountNumber && !/^\d{10,15}$/.test(accountDigits)) {
    errors.accountNumber = "เลขบัญชีไม่ถูกต้อง กรอกตัวเลข 10–15 หลัก เช่น 123-4-56789-0";
  }
  if (values.accountNumber && !values.bankName) {
    errors.bankName = "กรุณากรอกชื่อธนาคารของเลขบัญชีนี้";
  }
  if (values.accountNumber && !values.accountName) {
    errors.accountName = "กรุณากรอกชื่อบัญชี";
  }

  // พร้อมเพย์: เบอร์มือถือ 10 หลัก / เลขบัตรประชาชน 13 หลัก / e-Wallet 15 หลัก
  const promptPayDigits = values.promptPayId.replace(/[\s-]/g, "");
  if (values.promptPayId && !/^(0\d{9}|\d{13}|\d{15})$/.test(promptPayDigits)) {
    errors.promptPayId = "พร้อมเพย์ไม่ถูกต้อง กรอกเบอร์มือถือ 10 หลัก หรือเลขบัตรประชาชน 13 หลัก";
  }

  if (Object.keys(errors).length > 0 || deliveryFee === null || freeShipping === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      deliveryFee,
      freeShippingMinQty: freeShipping,
      promoText: values.promoText || null,
      bankName: values.bankName || null,
      accountName: values.accountName || null,
      accountNumber: values.accountNumber || null,
      promptPayId: values.promptPayId || null,
    },
  };
}
