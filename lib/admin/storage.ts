import { detectImageType, MAX_IMAGE_BYTES } from "@/lib/image-type";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { SHOP_IMAGES_BUCKET, storagePathFromUrl, type ImageFolder } from "./storage-path";

/**
 * อัปโหลด/ลบรูปใน Supabase Storage (เรียกจาก Server Action ของแอดมินเท่านั้น)
 * ใช้ session ของแอดมินที่ล็อกอินอยู่ Storage จึงตรวจสิทธิ์ is_admin() ซ้ำอีกชั้น
 */

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

export async function uploadShopImage(file: File, folder: ImageFolder): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, message: "ไม่พบไฟล์รูป" };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "รูปใหญ่เกิน 2 MB กรุณาเลือกรูปที่เล็กลง" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // ตรวจจากเนื้อไฟล์จริง ไม่เชื่อชนิดไฟล์/นามสกุลที่เบราว์เซอร์ส่งมา
  const type = detectImageType(bytes);
  if (!type || bytes.length > MAX_IMAGE_BYTES) {
    return { ok: false, message: "รองรับเฉพาะรูป JPG, PNG หรือ WebP ไม่เกิน 2 MB" };
  }

  // ชื่อไฟล์สร้างโดย server เสมอ (ผู้ใช้กำหนดตำแหน่งไฟล์เองไม่ได้)
  const path = `${folder}/${crypto.randomUUID()}.${type.ext}`;

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(SHOP_IMAGES_BUCKET)
      .upload(path, bytes, {
        contentType: type.mime,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) {
      console.error("[uploadShopImage]", error.message);
      return { ok: false, message: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
    }
    const { data } = supabase.storage.from(SHOP_IMAGES_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    console.error("[uploadShopImage]", err instanceof Error ? err.message : err);
    return { ok: false, message: "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

/** ลบรูปเก่า (ลบเฉพาะรูปที่ระบบอัปโหลดไว้ใน bucket ของเรา) ไม่ throw */
export async function removeShopImage(url: string | null) {
  try {
    const path = storagePathFromUrl(url, getSupabaseEnv().url);
    if (!path) return;
    const supabase = await createClient();
    const { error } = await supabase.storage.from(SHOP_IMAGES_BUCKET).remove([path]);
    if (error) console.error("[removeShopImage]", error.message);
  } catch (err) {
    console.error("[removeShopImage]", err instanceof Error ? err.message : err);
  }
}
