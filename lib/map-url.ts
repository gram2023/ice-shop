/**
 * ตรวจลิงก์แผนที่ (กันไม่ให้ฝังเว็บอื่นลงในหน้าร้าน)
 */

/**
 * รับ "โค้ดฝังแผนที่" ทั้งก้อน (<iframe src="..."></iframe>) หรือเฉพาะลิงก์ก็ได้
 * คืนค่าลิงก์ฝังที่ปลอดภัย หรือ null ถ้าไม่ใช่แผนที่ของ Google Maps
 *
 * รับเฉพาะ
 * - https://www.google.com/maps/embed?pb=...   (จากเมนู แชร์ → ฝังแผนที่)
 * - https://www.google.com/maps?...&output=embed
 */
export function extractMapEmbedSrc(input: string): string | null {
  const text = input.trim();
  if (!text || text.length > 4000) return null;

  let src = text;
  if (/<iframe/i.test(text)) {
    const match = text.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
    if (!match) return null;
    src = match[1];
  }
  src = src.replace(/&amp;/g, "&").trim();

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== "www.google.com" || url.username || url.password) {
    return null;
  }
  const isEmbed = url.pathname === "/maps/embed" && url.searchParams.has("pb");
  const isOutputEmbed = url.pathname === "/maps" && url.searchParams.get("output") === "embed";
  if (!isEmbed && !isOutputEmbed) return null;
  return url.toString();
}

const MAP_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "www.google.com", "maps.google.com", "google.com"]);

/**
 * ลิงก์ "นำทาง" ที่แอดมินใส่ (เช่น ลิงก์แชร์ https://maps.app.goo.gl/xxxx)
 * คืนค่าลิงก์ที่ปลอดภัย หรือ null ถ้าไม่ใช่ลิงก์ Google Maps
 */
export function normalizeMapLink(input: string): string | null {
  const text = input.trim();
  if (!text || text.length > 500) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !MAP_LINK_HOSTS.has(url.hostname) || url.username || url.password) {
    return null;
  }
  if (url.hostname === "goo.gl" && !url.pathname.startsWith("/maps")) return null;
  if (url.hostname.endsWith("google.com") && !url.pathname.startsWith("/maps")) return null;
  return url.toString();
}

/** ลิงก์นำทางสำรอง: ค้นหาชื่อร้าน + ที่อยู่ใน Google Maps */
export function searchMapLink(name: string, address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`.trim())}`;
}
