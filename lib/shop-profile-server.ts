import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_PROFILE, mapProfileRow, PROFILE_COLUMNS, type ShopProfile } from "./shop-profile";
import { createPublicClient } from "./supabase/public";

/** แท็กของ cache ข้อมูลร้าน — แอดมินบันทึกแล้วเรียก updateTag(SHOP_PROFILE_TAG) */
export const SHOP_PROFILE_TAG = "shop-profile";

/**
 * ข้อมูลร้าน (ชื่อ ติดต่อ เวลาเปิด-ปิด แผนที่ ฯลฯ) เก็บใน cache
 * - หน้าเว็บไม่ต้องดึงจากฐานข้อมูลทุกครั้ง (เร็ว) และยังสร้างหน้าล่วงหน้าได้
 * - แอดมินกดบันทึก → ล้าง cache ทันที → เห็นข้อมูลใหม่ในคำขอถัดไป
 * - โหลดไม่ได้ → ใช้ค่าตั้งต้นจาก shop-config.ts และลองโหลดใหม่ในไม่กี่นาที (หน้าไม่พัง)
 */
export async function getShopProfile(): Promise<ShopProfile> {
  "use cache";
  cacheTag(SHOP_PROFILE_TAG);

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("settings")
      .select(PROFILE_COLUMNS)
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(`${error.code}: ${error.message}`);

    const profile = mapProfileRow(data as Record<string, unknown> | null);
    cacheLife("days");
    return profile;
  } catch (err) {
    console.error("[getShopProfile]", err instanceof Error ? err.message : err);
    cacheLife("minutes");
    return DEFAULT_PROFILE;
  }
}
