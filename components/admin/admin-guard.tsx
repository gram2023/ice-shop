import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/admin/auth";
import { getLatestOrderCreatedAt } from "@/lib/admin/orders";
import AdminAccessMessage from "./AdminAccessMessage";

export type AdminGate =
  | { ok: true; email: string | null; newOrdersSince: string }
  | { ok: false; view: ReactNode };

/**
 * ตรวจสิทธิ์แอดมินสำหรับทุกหน้าแอดมิน (ด่านตรวจหลัก ไม่ใช่ proxy)
 * - ยังไม่ล็อกอิน → ไปหน้า login
 * - ล็อกอินแต่ไม่ใช่แอดมิน / ตรวจไม่สำเร็จ → คืนหน้าข้อความแจ้ง
 * - เป็นแอดมิน → คืนข้อมูลที่หัวหน้าแอดมินต้องใช้
 */
export async function guardAdmin(): Promise<AdminGate> {
  const session = await getAdminSession();
  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status !== "admin") {
    return { ok: false, view: <AdminAccessMessage session={session} /> };
  }

  const latest = await getLatestOrderCreatedAt();
  return {
    ok: true,
    email: session.email,
    // ยังไม่มีออเดอร์เลย → นับออเดอร์ใหม่ตั้งแต่ตอนนี้
    newOrdersSince: latest.ok && latest.data ? latest.data : new Date().toISOString(),
  };
}
