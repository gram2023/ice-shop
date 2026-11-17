import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { authCookieOptions } from "./cookie-options";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client สำหรับฝั่ง server (Server Component, Server Action, Route Handler)
 *
 * - สร้างใหม่ทุกครั้งที่มีคำขอ (request) ห้ามเก็บไว้ใช้ซ้ำข้ามคำขอ
 * - อ่าน cookie เพื่อรู้ว่าใครล็อกอินอยู่ (ใช้กับหน้าแอดมิน)
 * - คอมโพเนนต์ที่เรียกใช้ต้องอยู่ใน <Suspense> เพราะเป็นข้อมูลที่โหลดตอนมีคำขอ
 */
export async function createClient() {
  // รอให้มีคำขอจริงจากผู้ใช้ก่อน: ระหว่าง prerender (รวมถึงแบบที่อ่าน cookie ได้)
  // ฟังก์ชันนี้จะหยุดรอตรงนี้ ไม่ยิงคำขอไป Supabase
  // ถ้าไม่หยุด Next.js จะยกเลิก fetch ตอน prerender จบ แล้ว supabase-js แปลงเป็น error
  // ทำให้หน้าเว็บแสดง "โหลดข้อมูลไม่สำเร็จ" ทั้งที่ Supabase ปกติ
  await connection();

  // อ่าน cookie ก่อนตรวจ env เสมอ
  // (ถ้าตรวจ env ก่อนแล้ว error ตอน build ข้อความ error จะถูกฝังเป็นหน้า static)
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookieOptions: authCookieOptions,
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
          // (proxy.ts ต่ออายุ session ให้แล้วก่อนถึงหน้าแอดมิน)
        }
      },
    },
  });
}
