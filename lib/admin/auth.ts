import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * ตรวจสิทธิ์แอดมิน (ด่านตรวจหลักของหน้าแอดมิน)
 *
 * ต้องเรียกในทุกหน้าและทุก Server Action ที่แตะข้อมูลแอดมิน
 * proxy.ts เป็นแค่ด่านแรกที่พาคนที่ยังไม่ล็อกอินไปหน้า login เท่านั้น
 * และฐานข้อมูลยังมี RLS (is_admin()) กันอีกชั้น
 */
export type AdminSession =
  | { status: "anonymous" }
  | { status: "forbidden"; email: string | null }
  | { status: "admin"; userId: string; email: string | null }
  | { status: "error" };

export const getAdminSession = cache(async (): Promise<AdminSession> => {
  try {
    const supabase = await createClient();

    // getClaims ตรวจลายเซ็นของ token (ไม่เชื่อค่าใน cookie ตรง ๆ)
    const { data, error } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (error || !userId) return { status: "anonymous" };

    const email =
      typeof data.claims.email === "string" ? data.claims.email : null;

    // ใช้ฟังก์ชัน is_admin() ที่มีอยู่ใน schema.sql (ตาราง admins)
    const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
    if (rpcError) {
      console.error("[getAdminSession]", rpcError.code, rpcError.message);
      return { status: "error" };
    }

    return isAdmin === true
      ? { status: "admin", userId, email }
      : { status: "forbidden", email };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getAdminSession]", err instanceof Error ? err.message : err);
    return { status: "error" };
  }
});

/** ใช้ใน Server Action: คืนค่า true เฉพาะเมื่อเป็นแอดมินจริง */
export async function isAdminRequest() {
  const session = await getAdminSession();
  return session.status === "admin";
}
