import { extractMapEmbedSrc, normalizeMapLink } from "../map-url";

/**
 * ตรวจข้อมูลฟอร์ม "แผนที่ร้าน" — ใช้ฝั่ง server ใน Server Action
 * - โค้ดฝังแผนที่: เว้นว่าง = ไม่แสดงแผนที่ (เก็บเป็น "" ในฐานข้อมูล)
 * - ลิงก์นำทาง: เว้นว่าง = ค้นหาจากชื่อร้าน + ที่อยู่ (เก็บเป็น null)
 */

export type MapField = "mapEmbed" | "mapLink";
export type MapErrors = Partial<Record<MapField, string>>;
export type MapInput = { mapEmbedUrl: string; mapLinkUrl: string | null };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateMapInput(
  get: (name: string) => unknown,
): { ok: true; data: MapInput } | { ok: false; errors: MapErrors } {
  const errors: MapErrors = {};
  const embedRaw = text(get("mapEmbed"));
  const linkRaw = text(get("mapLink"));

  let mapEmbedUrl = "";
  if (embedRaw) {
    const src = extractMapEmbedSrc(embedRaw);
    if (src) mapEmbedUrl = src;
    else {
      errors.mapEmbed =
        "ไม่ใช่โค้ดฝังแผนที่ของ Google Maps กรุณาคัดลอกจากเมนู แชร์ → ฝังแผนที่ → คัดลอก HTML";
    }
  }

  let mapLinkUrl: string | null = null;
  if (linkRaw) {
    mapLinkUrl = normalizeMapLink(linkRaw);
    if (!mapLinkUrl) {
      errors.mapLink = "ลิงก์ต้องเป็นของ Google Maps เช่น https://maps.app.goo.gl/xxxx";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { mapEmbedUrl, mapLinkUrl } };
}
