import { normalizeMapLink, searchMapLink } from "./map-url";
import { validateOpeningHours } from "./opening-hours";
import { shopConfig, type FaqItem, type OpeningHour } from "./shop-config";

/**
 * ข้อมูลร้านที่แอดมินแก้ได้ผ่านเว็บ (ตาราง settings แถว id = 1)
 * ช่องไหนยังไม่ได้ตั้งค่า (null) หรือค่าผิดรูปแบบ → ใช้ค่าตั้งต้นจาก lib/shop-config.ts
 */

export type Highlight = { title: string; detail: string };

export type DeliveryRules = {
  /** ต้องสั่งล่วงหน้าอย่างน้อยกี่นาที */
  leadMinutes: number;
  /** สั่งล่วงหน้าได้ไม่เกินกี่วัน */
  maxDays: number;
  /** เวลาจัดส่งให้เลือกทุก ๆ กี่นาที */
  slotMinutes: number;
};

export type ShopProfile = {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  lineId: string | null;
  lineUrl: string | null;
  facebookName: string | null;
  facebookUrl: string | null;
  /** ลิงก์ฝังแผนที่ (null = ไม่แสดงแผนที่) */
  mapEmbedUrl: string | null;
  /** ลิงก์ปุ่ม "นำทาง" (ไม่ได้ตั้ง = ค้นหาชื่อร้าน + ที่อยู่ใน Google Maps) */
  mapLinkUrl: string;
  openingHours: OpeningHour[];
  highlights: Highlight[];
  faq: FaqItem[];
  logoUrl: string | null;
  heroImageUrl: string | null;
  delivery: DeliveryRules;
};

export const PROFILE_COLUMNS = [
  "shop_name",
  "tagline",
  "description",
  "address",
  "phone",
  "line_id",
  "line_url",
  "facebook_name",
  "facebook_url",
  "map_embed_url",
  "map_link_url",
  "opening_hours",
  "highlights",
  "faq",
  "logo_url",
  "hero_image_url",
  "delivery_lead_minutes",
  "delivery_max_days",
].join(", ");

/** ลิงก์เปิดแชต LINE จาก LINE ID (@xxx = บัญชีร้าน / อื่น ๆ = บัญชีส่วนตัว) */
export function lineUrlFor(lineId: string) {
  const id = lineId.trim();
  return id.startsWith("@")
    ? `https://line.me/R/ti/p/${encodeURIComponent(id)}`
    : `https://line.me/ti/p/~${encodeURIComponent(id)}`;
}

export const DEFAULT_PROFILE: ShopProfile = {
  name: shopConfig.name,
  tagline: shopConfig.tagline,
  description: shopConfig.description,
  address: shopConfig.address,
  phone: shopConfig.phone,
  lineId: shopConfig.lineId,
  lineUrl: shopConfig.lineUrl,
  facebookName: shopConfig.facebookName,
  facebookUrl: shopConfig.facebookUrl,
  mapEmbedUrl: shopConfig.googleMapsEmbedUrl,
  mapLinkUrl: searchMapLink(shopConfig.name, shopConfig.address),
  openingHours: shopConfig.openingHours,
  highlights: shopConfig.highlights,
  faq: shopConfig.faq,
  logoUrl: null,
  heroImageUrl: null,
  delivery: {
    leadMinutes: shopConfig.orderRules.deliveryLeadMinutes,
    maxDays: shopConfig.orderRules.deliveryMaxDays,
    slotMinutes: shopConfig.orderRules.deliverySlotMinutes,
  },
};

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() && value.trim().length <= max
    ? value.trim()
    : null;
}

function intInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

function httpsUrl(value: unknown): string | null {
  const s = text(value, 500);
  if (!s) return null;
  try {
    return new URL(s).protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/** รายการ {a, b} ที่เป็นข้อความทั้งคู่ (ใช้กับ FAQ / จุดเด่น) */
function textPairs<K1 extends string, K2 extends string>(
  value: unknown,
  k1: K1,
  k2: K2,
  max: number,
): Record<K1 | K2, string>[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) return null;
  const out: Record<K1 | K2, string>[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Record<string, unknown>;
    const a = text(r[k1], max);
    const b = text(r[k2], max * 4);
    if (!a || !b) return null;
    out.push({ [k1]: a, [k2]: b } as Record<K1 | K2, string>);
  }
  return out;
}

/** แปลงแถวจากฐานข้อมูลเป็นข้อมูลร้าน (ค่าว่าง/ผิดรูปแบบ → ค่าตั้งต้น ไม่ throw) */
export function mapProfileRow(row: Record<string, unknown> | null): ShopProfile {
  const d = DEFAULT_PROFILE;
  const r = row ?? {};

  const name = text(r.shop_name, 100) ?? d.name;
  const address = text(r.address, 300) ?? d.address;

  // ช่องที่ไม่บังคับ (LINE / Facebook):
  // - แอดมินเคยบันทึกข้อมูลร้านแล้ว (มีชื่อร้านในฐานข้อมูล) → ใช้ตามที่บันทึก ช่องว่าง = ไม่แสดง
  // - ยังไม่เคยบันทึก → ใช้ค่าตั้งต้น
  const savedByAdmin = text(r.shop_name, 100) !== null;
  const optional = <T,>(saved: T | null, fallback: T | null) =>
    savedByAdmin ? saved : (saved ?? fallback);

  const lineId = optional(text(r.line_id, 50), d.lineId);
  // ไม่ได้ใส่ลิงก์ LINE เอง → สร้างจาก LINE ID (ค่าตั้งต้นก็ได้ลิงก์เดียวกับใน shop-config)
  const lineUrl = httpsUrl(r.line_url) ?? (lineId ? lineUrlFor(lineId) : null);
  const hours = validateOpeningHours(r.opening_hours);
  const mapEmbed = httpsUrl(r.map_embed_url);
  const mapLink = typeof r.map_link_url === "string" ? normalizeMapLink(r.map_link_url) : null;

  return {
    name,
    tagline: text(r.tagline, 200) ?? d.tagline,
    description: text(r.description, 1000) ?? d.description,
    address,
    phone: text(r.phone, 30) ?? d.phone,
    lineId,
    lineUrl: lineId ? lineUrl : null,
    facebookName: optional(text(r.facebook_name, 100), d.facebookName),
    facebookUrl: optional(httpsUrl(r.facebook_url), d.facebookUrl),
    // "" = แอดมินเลือกไม่แสดงแผนที่ / ไม่ได้ตั้งหรือผิดรูปแบบ = ค่าตั้งต้น
    mapEmbedUrl:
      r.map_embed_url === ""
        ? null
        : mapEmbed?.startsWith("https://www.google.com/maps")
          ? mapEmbed
          : d.mapEmbedUrl,
    mapLinkUrl: mapLink ?? searchMapLink(name, address),
    openingHours: hours.ok ? hours.data : d.openingHours,
    highlights: textPairs(r.highlights, "title", "detail", 80) ?? d.highlights,
    faq: textPairs(r.faq, "question", "answer", 200) ?? d.faq,
    logoUrl: httpsUrl(r.logo_url),
    heroImageUrl: httpsUrl(r.hero_image_url),
    delivery: {
      leadMinutes: intInRange(r.delivery_lead_minutes, 0, 2880) ?? d.delivery.leadMinutes,
      maxDays: intInRange(r.delivery_max_days, 1, 30) ?? d.delivery.maxDays,
      slotMinutes: d.delivery.slotMinutes,
    },
  };
}

/** ลิงก์โทร เช่น "081-234-5678" → "tel:0812345678" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
