"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/admin/auth";
import { countOrdersSince } from "@/lib/admin/orders";
import {
  isAllowedTransition,
  isOrderStatus,
  isPaymentStatus,
} from "@/lib/order-status";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

/**
 * Server Action ของหน้าแอดมิน
 * ทุกตัวตรวจสิทธิ์แอดมินเองก่อนแตะข้อมูล เพราะเรียกตรงด้วย POST ได้โดยไม่ผ่านหน้าเว็บ
 */

export type AdminActionResult =
  | { ok: true }
  | { ok: false; message: string; conflict?: boolean };

const NO_PERMISSION: AdminActionResult = {
  ok: false,
  message: "ไม่มีสิทธิ์ทำรายการนี้ กรุณาเข้าสู่ระบบใหม่",
};
const GENERIC_ERROR: AdminActionResult = {
  ok: false,
  message: "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};
const CONFLICT: AdminActionResult = {
  ok: false,
  conflict: true,
  message: "ออเดอร์นี้ถูกเปลี่ยนไปแล้ว (อาจมีแอดมินคนอื่นแก้ก่อน) กรุณาโหลดหน้าใหม่",
};

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[signOut]", err instanceof Error ? err.message : err);
  }
  redirect("/admin/login");
}

/**
 * เปลี่ยนสถานะออเดอร์
 * - ตรวจว่าการเปลี่ยนนี้อนุญาตตามกฎ (ทีละขั้น / ย้อน 1 ขั้น / ยกเลิก / กู้คืน)
 * - อัปเดตเฉพาะเมื่อสถานะในฐานข้อมูลยังเป็น `from` อยู่ (กันแอดมิน 2 คนกดพร้อมกัน)
 */
export async function updateOrderStatus(
  orderId: unknown,
  from: unknown,
  to: unknown,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return NO_PERMISSION;
  if (!isUuid(orderId) || !isOrderStatus(from) || !isOrderStatus(to)) return GENERIC_ERROR;
  if (!isAllowedTransition(from, to)) return GENERIC_ERROR;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: to })
      .eq("id", orderId)
      .eq("status", from)
      .select("id");

    if (error) {
      console.error("[updateOrderStatus]", error.code, error.message);
      return GENERIC_ERROR;
    }
    if (!data || data.length === 0) return CONFLICT;
  } catch (err) {
    console.error("[updateOrderStatus]", err instanceof Error ? err.message : err);
    return GENERIC_ERROR;
  }

  refresh();
  return { ok: true };
}

/** บันทึก/ยกเลิกการชำระเงิน */
export async function updatePaymentStatus(
  orderId: unknown,
  from: unknown,
  to: unknown,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return NO_PERMISSION;
  if (!isUuid(orderId) || !isPaymentStatus(from) || !isPaymentStatus(to) || from === to) {
    return GENERIC_ERROR;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: to })
      .eq("id", orderId)
      .eq("payment_status", from)
      .select("id");

    if (error) {
      console.error("[updatePaymentStatus]", error.code, error.message);
      return GENERIC_ERROR;
    }
    if (!data || data.length === 0) return CONFLICT;
  } catch (err) {
    console.error("[updatePaymentStatus]", err instanceof Error ? err.message : err);
    return GENERIC_ERROR;
  }

  refresh();
  return { ok: true };
}

/** จำนวนออเดอร์ที่เข้ามาหลังเวลาที่กำหนด (ใช้แจ้งเตือนออเดอร์ใหม่ทุก 30 วินาที) */
export async function checkNewOrders(
  sinceIso: unknown,
): Promise<{ ok: true; count: number } | { ok: false }> {
  if (!(await isAdminRequest())) return { ok: false };
  if (
    typeof sinceIso !== "string" ||
    sinceIso.length > 40 ||
    !/^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/.test(sinceIso) ||
    Number.isNaN(Date.parse(sinceIso))
  ) {
    return { ok: false };
  }
  // ส่งค่าเดิมจากฐานข้อมูล (ละเอียดถึงไมโครวินาที) ห้ามแปลงผ่าน Date ซึ่งเหลือแค่มิลลิวินาที
  // ไม่งั้นออเดอร์ล่าสุดจะถูกนับเป็น "ใหม่" ซ้ำทุกครั้ง
  const result = await countOrdersSince(sinceIso);
  return result.ok ? { ok: true, count: result.data } : { ok: false };
}
