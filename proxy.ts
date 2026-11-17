import type { NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";

/**
 * ทำงานก่อนเข้าหน้า /admin ทุกหน้า
 * - ต่ออายุ session การล็อกอิน
 * - ยังไม่ล็อกอิน → พาไปหน้า /admin/login
 * - ล็อกอินแล้วแต่เปิดหน้า login → พากลับ /admin
 *
 * ⚠️ ไม่ใช่ด่านตรวจสิทธิ์แอดมิน (ตามคำแนะนำของ Next.js)
 *    การตรวจสิทธิ์จริงอยู่ที่ getAdminSession() ในทุกหน้าและทุก Server Action
 */
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!isLoggedIn && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(url, response);
  }

  if (isLoggedIn && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
