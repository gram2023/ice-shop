import { unstable_rethrow } from "next/navigation";
import type { Result } from "@/lib/data";
import { mapProfileRow, PROFILE_COLUMNS, type ShopProfile } from "@/lib/shop-profile";
import { createClient } from "@/lib/supabase/server";

/**
 * ข้อมูลร้านสำหรับหน้าแอดมิน (อ่านสดจากฐานข้อมูล ไม่ผ่าน cache)
 * - profile = ค่าที่หน้าร้านแสดงอยู่ตอนนี้ (ช่องที่ยังไม่ได้ตั้ง = ค่าตั้งต้น)
 * - raw = ค่าที่บันทึกไว้จริง สำหรับช่องที่หน้าร้าน "สร้างให้อัตโนมัติ" ถ้าเว้นว่าง
 *   (ใส่ในฟอร์มตามจริง ไม่งั้นกดบันทึกแล้วค่าอัตโนมัติจะถูกบันทึกค้างไว้)
 */
export type AdminProfile = {
  profile: ShopProfile;
  raw: { lineUrl: string | null; mapLinkUrl: string | null };
};

function rawText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function getProfileForAdmin(): Promise<Result<AdminProfile>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .select(PROFILE_COLUMNS)
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      // 42703 / PGRST204 = ยังไม่มีคอลัมน์ (ยังไม่ได้รัน phase6.sql)
      console.error("[getProfileForAdmin]", error?.code ?? "no settings row", error?.message);
      return { ok: false };
    }

    // รายชื่อคอลัมน์ต่อกันเป็นข้อความ → supabase-js เดา type ไม่ได้ (mapProfileRow ตรวจค่าทุกช่องเอง)
    const row = data as unknown as Record<string, unknown>;
    return {
      ok: true,
      data: {
        profile: mapProfileRow(row),
        raw: { lineUrl: rawText(row.line_url), mapLinkUrl: rawText(row.map_link_url) },
      },
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getProfileForAdmin]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

/**
 * บันทึกข้อมูลร้านบางช่อง (ตาราง settings แถว id = 1)
 * ผู้เรียก (Server Action) ต้องตรวจสิทธิ์แอดมินและตรวจค่ามาก่อนแล้ว · RLS กันอีกชั้น
 */
export async function updateProfileColumns(
  columns: Record<string, unknown>,
  logTag: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .update({ ...columns, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select("id");

    if (error || !data?.length) {
      console.error(`[${logTag}]`, error?.code ?? "no row updated", error?.message);
      return false;
    }
    return true;
  } catch (err) {
    unstable_rethrow(err);
    console.error(`[${logTag}]`, err instanceof Error ? err.message : err);
    return false;
  }
}
