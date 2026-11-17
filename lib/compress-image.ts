/**
 * ย่อรูปในเบราว์เซอร์ก่อนอัปโหลด (ใช้ใน Client Component เท่านั้น)
 *
 * - รูปจากมือถือ 3–8 MB เหลือราว 200–400 KB → อัปโหลดเร็ว หน้าร้านโหลดเร็ว
 * - เข้ารหัสรูปใหม่ทั้งหมด ข้อมูลแฝงในรูป (EXIF เช่น พิกัด GPS ที่ถ่าย) จึงถูกลบทิ้ง
 */

type Options = {
  /** ด้านที่ยาวที่สุดไม่เกินกี่พิกเซล */
  maxDimension: number;
  /** คุณภาพ JPEG 0–1 */
  quality: number;
  /** รูป PNG ให้คงเป็น PNG (เหมาะกับ QR ที่ต้องคมชัด) */
  keepPng?: boolean;
};

export async function compressImage(file: File, options: Options): Promise<File> {
  // createImageBitmap หมุนรูปตาม EXIF ให้อัตโนมัติ
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, options.maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas not supported");

    const asPng = Boolean(options.keepPng) && file.type === "image/png";
    if (!asPng) {
      // JPEG ไม่มีพื้นใส เติมพื้นขาวกันส่วนโปร่งใสกลายเป็นสีดำ
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const type = asPng ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, options.quality),
    );
    if (!blob) throw new Error("encode failed");
    return new File([blob], asPng ? "image.png" : "image.jpg", { type });
  } finally {
    bitmap.close();
  }
}
