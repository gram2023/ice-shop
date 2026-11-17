import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions } from "./cookie-options";

/**
 * ต่ออายุ session ของ Supabase (ใช้ใน proxy.ts)
 *
 * Server Component เขียน cookie ไม่ได้ จึงต้องต่ออายุ token ที่นี่ก่อนถึงหน้าเว็บ
 * คืนค่า isLoggedIn ไว้ใช้พาคนที่ยังไม่ล็อกอินไปหน้า login (ไม่ใช่การตรวจสิทธิ์แอดมิน)
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { response, isLoggedIn: false };

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // ห้าม CDN cache คำตอบที่มี cookie ล็อกอิน
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  let isLoggedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    isLoggedIn = Boolean(data?.claims?.sub);
  } catch (err) {
    console.error("[updateSession]", err instanceof Error ? err.message : err);
  }

  return { response, isLoggedIn };
}

/** redirect โดยพา cookie ที่เพิ่งต่ออายุไปด้วย (ไม่งั้นผู้ใช้จะหลุดล็อกอิน) */
export function redirectWithCookies(target: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(target);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() === "cache-control") redirect.headers.set(key, value);
  });
  return redirect;
}
