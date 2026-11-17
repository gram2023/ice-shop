/**
 * ตรวจชนิดไฟล์รูปจาก "เนื้อไฟล์จริง" (magic bytes) ไม่เชื่อนามสกุลหรือชนิดที่เบราว์เซอร์บอกมา
 * รับเฉพาะ JPG / PNG / WebP (ต้องตรงกับ allowed_mime_types ของ bucket shop-images)
 */

/** ขนาดไฟล์รูปสูงสุด 2 MB (ต้องตรงกับ file_size_limit ใน supabase/phase4.sql) */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type ImageType = {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
};

export function detectImageType(bytes: Uint8Array): ImageType | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) {
    return { mime: "image/png", ext: "png" };
  }
  // WebP: "RIFF" .... "WEBP"
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}
