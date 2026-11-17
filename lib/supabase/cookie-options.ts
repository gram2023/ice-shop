/**
 * ตั้งค่า cookie ล็อกอินของ Supabase (ใช้ทั้งใน server client และ proxy)
 *
 * - httpOnly: JavaScript ในหน้าเว็บอ่าน cookie ไม่ได้ ถ้าเว็บมีช่องโหว่ XSS ก็ขโมย session ไม่ได้
 *   (ระบบนี้ล็อกอินและต่ออายุ session ฝั่ง server ทั้งหมด จึงไม่ต้องให้เบราว์เซอร์อ่าน)
 * - sameSite lax: กันเว็บอื่นแอบส่งคำขอพร้อม cookie
 * - secure: ส่ง cookie เฉพาะ https ตอนใช้งานจริง (ตอน npm run dev ใช้ http จึงปิดไว้)
 *
 * ⚠️ ถ้าวันหน้าจะใช้ lib/supabase/client.ts (ฝั่งเบราว์เซอร์) ทำงานที่ต้องล็อกอิน
 *    client ฝั่งเบราว์เซอร์จะมองไม่เห็น session นี้ ให้ทำผ่าน Server Action แทน
 */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
