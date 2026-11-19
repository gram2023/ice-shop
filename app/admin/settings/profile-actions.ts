"use server";

import { refresh, updateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin/auth";
import { validateMapInput, type MapField } from "@/lib/admin/map-input";
import { getProfileForAdmin, updateProfileColumns } from "@/lib/admin/profile";
import {
  readShopInfoForm,
  validateShopInfo,
  type ShopInfoField,
} from "@/lib/admin/shop-info-input";
import { removeShopImage, uploadShopImage } from "@/lib/admin/storage";
import { HOME_IMAGE_INFO, isHomeImageSlot } from "@/lib/home-images";
import { validateOpeningHours } from "@/lib/opening-hours";
import { SHOP_PROFILE_TAG } from "@/lib/shop-profile-server";

/**
 * Server Action บันทึกข้อมูลร้าน (ข้อมูลร้าน / เวลาเปิด-ปิด / แผนที่ / รูปหน้าแรก)
 * ทุกตัวตรวจสิทธิ์แอดมินเองก่อน เพราะเรียกตรงด้วย POST ได้โดยไม่ผ่านหน้าเว็บ
 * บันทึกแล้วล้าง cache ข้อมูลร้าน → หน้าร้านเห็นข้อมูลใหม่ทันที
 */

export type ProfileFormState<F extends string = never> = {
  errors: Partial<Record<F, string>>;
  message: string | null;
  saved: boolean;
};

const NO_PERMISSION = "ไม่มีสิทธิ์ทำรายการนี้ กรุณาเข้าสู่ระบบใหม่";
const CHECK_INPUT = "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง";
const SAVE_FAILED =
  "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง (ถ้าเพิ่งอัปเดตระบบ ตรวจสอบว่ารัน supabase/phase6.sql และ ui3.sql แล้ว)";

function fail<F extends string>(
  message: string,
  errors: Partial<Record<F, string>> = {},
): ProfileFormState<F> {
  return { errors, message, saved: false };
}

/** บันทึกสำเร็จ: ล้าง cache ข้อมูลร้าน + รีเฟรชหน้าแอดมิน แล้วคืนข้อความสำเร็จ */
function refreshAfterSave<F extends string>(message: string): ProfileFormState<F> {
  updateTag(SHOP_PROFILE_TAG);
  refresh();
  return { errors: {}, message, saved: true };
}

/** ชื่อร้าน คำโปรย คำอธิบาย ที่อยู่ เบอร์โทร LINE Facebook */
export async function saveShopInfo(
  _prev: ProfileFormState<ShopInfoField>,
  formData: FormData,
): Promise<ProfileFormState<ShopInfoField>> {
  if (!(await isAdminRequest())) return fail(NO_PERMISSION);

  const checked = validateShopInfo(readShopInfoForm((name) => formData.get(name)));
  if (!checked.ok) return fail(CHECK_INPUT, checked.errors);

  const d = checked.data;
  const ok = await updateProfileColumns(
    {
      shop_name: d.name,
      tagline: d.tagline,
      description: d.description,
      address: d.address,
      phone: d.phone,
      line_id: d.lineId,
      line_url: d.lineUrl,
      facebook_name: d.facebookName,
      facebook_url: d.facebookUrl,
    },
    "saveShopInfo",
  );
  if (!ok) return fail(SAVE_FAILED);

  return refreshAfterSave("บันทึกข้อมูลร้านแล้ว");
}

/** เวลาเปิด-ปิด (ส่งมาเป็น JSON จากฟอร์ม) */
export async function saveOpeningHours(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  if (!(await isAdminRequest())) return fail(NO_PERMISSION);

  const raw = formData.get("openingHours");
  if (typeof raw !== "string" || raw.length > 5000) return fail(CHECK_INPUT);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail(CHECK_INPUT);
  }

  const checked = validateOpeningHours(parsed);
  if (!checked.ok) return fail(checked.message);

  const ok = await updateProfileColumns({ opening_hours: checked.data }, "saveOpeningHours");
  if (!ok) return fail(SAVE_FAILED);

  return refreshAfterSave("บันทึกเวลาเปิด-ปิดแล้ว");
}

/** แผนที่ร้าน (โค้ดฝังจาก Google Maps) + ลิงก์นำทาง */
export async function saveMap(
  _prev: ProfileFormState<MapField>,
  formData: FormData,
): Promise<ProfileFormState<MapField>> {
  if (!(await isAdminRequest())) return fail(NO_PERMISSION);

  const checked = validateMapInput((name) => formData.get(name));
  if (!checked.ok) return fail(CHECK_INPUT, checked.errors);

  const ok = await updateProfileColumns(
    { map_embed_url: checked.data.mapEmbedUrl, map_link_url: checked.data.mapLinkUrl },
    "saveMap",
  );
  if (!ok) return fail(SAVE_FAILED);

  return refreshAfterSave(checked.data.mapEmbedUrl ? "บันทึกแผนที่แล้ว" : "บันทึกแล้ว (ไม่แสดงแผนที่)");
}

/**
 * รูปหน้าแรก/โลโก้ ทีละรูป (ฟอร์มละ 1 รูป เพื่อไม่ให้เกินขนาดที่รับได้ต่อครั้ง)
 * - เลือกรูปใหม่ → อัปโหลด (server ตรวจชนิดไฟล์จากเนื้อไฟล์จริง) → บันทึก → ลบรูปเก่า
 * - ติ๊ก "ลบรูปเดิม" → ล้างช่อง → ลบรูปเก่า
 */
export async function saveHomeImage(
  _prev: ProfileFormState<"image">,
  formData: FormData,
): Promise<ProfileFormState<"image">> {
  if (!(await isAdminRequest())) return fail(NO_PERMISSION);

  const slot = formData.get("slot");
  if (!isHomeImageSlot(slot)) return fail(CHECK_INPUT);
  const info = HOME_IMAGE_INFO[slot];

  const file = formData.get("image");
  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && formData.get("removeImage") !== "on") {
    return fail("กรุณาเลือกรูป หรือติ๊ก “ลบรูปเดิม” ก่อนกดบันทึก");
  }

  const current = await getProfileForAdmin();
  if (!current.ok) return fail(SAVE_FAILED);
  const oldUrl = current.data.profile[info.profileKey];

  let newUrl: string | null = null;
  if (hasFile) {
    const uploaded = await uploadShopImage(file, "branding");
    if (!uploaded.ok) return fail("กรุณาตรวจสอบรูปอีกครั้ง", { image: uploaded.message });
    newUrl = uploaded.url;
  }

  const ok = await updateProfileColumns({ [info.column]: newUrl }, "saveHomeImage");
  if (!ok) {
    if (newUrl) await removeShopImage(newUrl);
    return fail(SAVE_FAILED);
  }
  // ลบไฟล์เก่า (ลบได้เฉพาะไฟล์ที่ระบบอัปโหลดไว้ในที่เก็บรูปของร้าน)
  if (oldUrl && oldUrl !== newUrl) await removeShopImage(oldUrl);

  return refreshAfterSave(newUrl ? `บันทึก${info.label}แล้ว` : `ลบ${info.label}แล้ว`);
}
