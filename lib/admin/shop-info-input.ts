/**
 * ตรวจข้อมูลฟอร์ม "ข้อมูลร้าน" (ชื่อ คำโปรย ที่อยู่ ช่องทางติดต่อ) — ใช้ฝั่ง server ใน Server Action
 * ความยาวสูงสุดต้องไม่เกินค่าที่ mapProfileRow (lib/shop-profile.ts) รับได้
 */

export const SHOP_INFO_LIMITS = {
  name: 100,
  tagline: 200,
  description: 1000,
  address: 300,
  phone: 30,
  lineId: 50,
  lineUrl: 300,
  facebookName: 100,
  facebookUrl: 300,
} as const;

export type ShopInfoField = keyof typeof SHOP_INFO_LIMITS;
export type ShopInfoErrors = Partial<Record<ShopInfoField, string>>;
export type ShopInfoFormValues = Record<ShopInfoField, string>;

export type ShopInfoInput = {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  lineId: string | null;
  /** null = สร้างลิงก์จาก LINE ID ให้อัตโนมัติ */
  lineUrl: string | null;
  facebookName: string | null;
  facebookUrl: string | null;
};

export const SHOP_INFO_FIELDS = Object.keys(SHOP_INFO_LIMITS) as ShopInfoField[];

const LINE_HOSTS = new Set(["line.me", "lin.ee", "page.line.me"]);
const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.com",
  "www.fb.com",
  "fb.me",
]);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** ลิงก์ https ที่อยู่ในรายชื่อเว็บที่อนุญาตเท่านั้น (กันลิงก์หลอก / javascript:) */
export function httpsUrlOnHosts(value: string, hosts: Set<string>): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !hosts.has(url.hostname) || url.username || url.password) {
    return null;
  }
  return url.toString();
}

/** เบอร์โทรไทย: มือถือ (06/08/09) 10 หลัก / เบอร์บ้าน 9 หลัก · ขึ้นต้น 0 หรือ +66 */
export function isThaiPhone(value: string) {
  return /^(?:0|\+66)(?:[689]\d{8}|[2-57]\d{7})$/.test(value.replace(/[\s-]/g, ""));
}

export function readShopInfoForm(get: (name: string) => unknown): ShopInfoFormValues {
  const values = {} as ShopInfoFormValues;
  for (const field of SHOP_INFO_FIELDS) values[field] = text(get(field));
  return values;
}

export function validateShopInfo(
  values: ShopInfoFormValues,
): { ok: true; data: ShopInfoInput } | { ok: false; errors: ShopInfoErrors } {
  const errors: ShopInfoErrors = {};
  const L = SHOP_INFO_LIMITS;

  const required: [ShopInfoField, string][] = [
    ["name", "ชื่อร้าน"],
    ["tagline", "คำโปรย"],
    ["description", "คำอธิบายร้าน"],
    ["address", "ที่อยู่ร้าน"],
    ["phone", "เบอร์โทร"],
  ];
  for (const [field, label] of required) {
    if (!values[field]) errors[field] = `กรุณากรอก${label}`;
  }

  // ความยาวทุกช่อง
  for (const field of SHOP_INFO_FIELDS) {
    if (values[field].length > L[field]) {
      errors[field] = `ยาวเกิน ${L[field].toLocaleString("th-TH")} ตัวอักษร`;
    }
  }

  if (values.phone && !errors.phone && !isThaiPhone(values.phone)) {
    errors.phone = "เบอร์โทรไม่ถูกต้อง ใส่เบอร์เดียว เช่น 081-234-5678 หรือ 02-123-4567";
  }

  // LINE: ID ใช้แสดงบนเว็บ / ลิงก์ไม่บังคับ (เว้นว่าง = สร้างจาก ID ให้)
  if (values.lineId && !errors.lineId && !/^@?[A-Za-z0-9._-]+$/.test(values.lineId)) {
    errors.lineId = "LINE ID ใช้ได้เฉพาะตัวอังกฤษ ตัวเลข และ . - _ (บัญชีร้านใส่ @ ข้างหน้า)";
  }
  let lineUrl: string | null = null;
  if (values.lineUrl && !errors.lineUrl) {
    lineUrl = httpsUrlOnHosts(values.lineUrl, LINE_HOSTS);
    if (!lineUrl) errors.lineUrl = "ลิงก์ LINE ต้องขึ้นต้นด้วย https://line.me/ หรือ https://lin.ee/";
    else if (!values.lineId) errors.lineId = "กรุณาใส่ LINE ID ด้วย (ใช้แสดงบนเว็บ)";
  }

  // Facebook: มีชื่อเพจต้องมีลิงก์ (ชื่อเว้นว่างได้ → ใช้ชื่อร้าน)
  let facebookUrl: string | null = null;
  if (values.facebookUrl && !errors.facebookUrl) {
    facebookUrl = httpsUrlOnHosts(values.facebookUrl, FACEBOOK_HOSTS);
    if (!facebookUrl) {
      errors.facebookUrl = "ลิงก์ต้องเป็นเพจ Facebook เช่น https://www.facebook.com/ชื่อเพจ";
    }
  } else if (values.facebookName && !values.facebookUrl) {
    errors.facebookUrl = "กรุณาใส่ลิงก์เพจ Facebook (หรือเว้นว่างทั้ง 2 ช่องถ้าไม่มีเพจ)";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: values.name,
      tagline: values.tagline,
      description: values.description,
      address: values.address,
      phone: values.phone,
      lineId: values.lineId || null,
      lineUrl,
      facebookName: facebookUrl ? values.facebookName || null : null,
      facebookUrl,
    },
  };
}
