/**
 * การตั้งค่าร้านที่เก็บในตาราง settings (แถว id = 1) — แอดมินแก้ได้ที่ /admin/settings
 */

export type PaymentInfo = {
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  promptPayId: string | null;
  promptPayQrUrl: string | null;
};

export type ShopSettings = {
  /** ค่าส่งพื้นฐาน (ก่อนหักส่งฟรี) */
  deliveryFee: number;
  /** สั่งครบกี่ถุงส่งฟรี (0 = ไม่มีส่งฟรี) */
  freeShippingMinQty: number;
  promoText: string | null;
  payment: PaymentInfo;
};

export const SETTINGS_COLUMNS =
  "delivery_fee, free_shipping_min_qty, promo_text, bank_name, bank_account_name, bank_account_number, promptpay_id, promptpay_qr_url";

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nonNegative(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** แปลงแถวจากฐานข้อมูล (snake_case) เป็นค่าที่หน้าเว็บใช้ ค่าแปลก ๆ จะกลายเป็นค่าปลอดภัย */
export function mapSettingsRow(row: Record<string, unknown> | null): ShopSettings {
  return {
    deliveryFee: nonNegative(row?.delivery_fee, 0),
    freeShippingMinQty: Math.floor(nonNegative(row?.free_shipping_min_qty, 0)),
    promoText: textOrNull(row?.promo_text),
    payment: {
      bankName: textOrNull(row?.bank_name),
      accountName: textOrNull(row?.bank_account_name),
      accountNumber: textOrNull(row?.bank_account_number),
      promptPayId: textOrNull(row?.promptpay_id),
      promptPayQrUrl: textOrNull(row?.promptpay_qr_url),
    },
  };
}
