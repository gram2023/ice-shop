/**
 * ป้องกันการพาไปเว็บอื่นหลังล็อกอิน (open redirect)
 * รับเฉพาะ path ภายใต้ /admin ของเว็บนี้ ค่าอื่นทั้งหมดกลับไปที่ /admin
 */
export function safeAdminPath(value: unknown) {
  if (typeof value !== "string" || value.length > 200) return "/admin";
  const underAdmin =
    value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?");
  if (!underAdmin || value.includes("\\") || value.includes("//")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}
