/** ที่เก็บรูปสินค้า รูป QR และรูปหน้าแรก/โลโก้ (ต้องตรงกับ supabase/phase4.sql) */
export const SHOP_IMAGES_BUCKET = "shop-images";

/** branding = โลโก้และรูปหน้าแรก (เฟส UI-3) */
export type ImageFolder = "products" | "qr" | "branding";

/**
 * แปลงลิงก์รูปกลับเป็นตำแหน่งไฟล์ใน bucket เพื่อใช้ลบรูป
 * คืนค่า null ถ้าไม่ใช่รูปที่ระบบเราอัปโหลดเอง (ต่างโดเมน / ต่าง bucket / ชื่อไฟล์ไม่ตรงรูปแบบ)
 * กันไม่ให้ลบไฟล์อื่นนอกเหนือจากที่ระบบสร้าง
 */
export function storagePathFromUrl(url: string | null, supabaseUrl: string): string | null {
  if (!url) return null;
  try {
    const target = new URL(url);
    const expected = new URL(supabaseUrl);
    if (target.origin !== expected.origin) return null;
    const prefix = `/storage/v1/object/public/${SHOP_IMAGES_BUCKET}/`;
    if (!target.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(target.pathname.slice(prefix.length));
    return /^(products|qr|branding)\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path) ? path : null;
  } catch {
    return null;
  }
}
