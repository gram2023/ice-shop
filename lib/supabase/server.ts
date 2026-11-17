import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client สำหรับฝั่ง server (Server Component, Server Action, Route Handler)
 *
 * - สร้างใหม่ทุกครั้งที่มีคำขอ (request) ห้ามเก็บไว้ใช้ซ้ำข้ามคำขอ
 * - อ่าน cookie เพื่อรองรับระบบล็อกอินแอดมินในเฟสถัดไป
 * - คอมโพเนนต์ที่เรียกใช้ต้องอยู่ใน <Suspense> เพราะเป็นข้อมูลที่โหลดตอนมีคำขอ
 */
export async function createClient() {
  // อ่าน cookie ก่อนเสมอ เพื่อให้ Next.js รู้ว่าส่วนนี้ต้องโหลดตอนมีคำขอ
  // (ถ้าตรวจ env ก่อนแล้ว error ตอน build ข้อความ error จะถูกฝังเป็นหน้า static)
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component ตั้ง cookie ไม่ได้ ไม่เป็นไร
          // (การต่ออายุ session จะทำใน proxy ตอนทำระบบล็อกอินแอดมิน)
        }
      },
    },
  });
}
