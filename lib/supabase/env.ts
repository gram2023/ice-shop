/**
 * อ่านค่าการเชื่อมต่อ Supabase จาก .env.local
 *
 * ต้องเขียน process.env.NEXT_PUBLIC_... แบบตรง ๆ แบบนี้
 * เพื่อให้ Next.js ฝังค่าลงในโค้ดฝั่ง browser ได้ตอน build
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local",
    );
  }

  return { url, anonKey };
}
