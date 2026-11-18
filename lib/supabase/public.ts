import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client แบบไม่อ่าน cookie — ใช้อ่าน "ข้อมูลสาธารณะ" ในฟังก์ชันที่มี "use cache"
 * (ฟังก์ชัน cache อ่าน cookies() ไม่ได้ และข้อมูลที่ cache ต้องเหมือนกันสำหรับทุกคน)
 * สิทธิ์ = anon (คนทั่วไป) เสมอ ห้ามใช้อ่านข้อมูลที่ต้องล็อกอิน
 */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
