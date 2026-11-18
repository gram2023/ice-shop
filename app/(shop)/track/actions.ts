"use server";

import { isValidPhone, normalizePhone } from "@/lib/order-rules";
import { getShopProfile } from "@/lib/shop-profile-server";
import { createClient } from "@/lib/supabase/server";
import {
  isValidOrderNo,
  normalizeOrderNo,
  parseTrackResponse,
  type TrackedOrder,
} from "@/lib/tracking";

export type TrackField = "orderNo" | "phone";

export type TrackResult =
  | { ok: true; order: TrackedOrder }
  | {
      ok: false;
      message: string;
      /** ไม่พบออเดอร์ (เลขออเดอร์หรือเบอร์ไม่ตรงกัน) */
      notFound?: boolean;
      /** ค้นหาผิดหลายครั้ง ถูกล็อกชั่วคราว */
      locked?: boolean;
      fieldErrors?: Partial<Record<TrackField, string>>;
    };

const genericError = (phone: string) =>
  `ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือโทรถามร้านที่ ${phone}`;

/**
 * ค้นหาออเดอร์ด้วย "เลขออเดอร์ + เบอร์โทรที่ใช้สั่ง"
 * การจำกัดการเดาสุ่มอยู่ในฟังก์ชัน track_order ของฐานข้อมูล (เลี่ยงไม่ได้แม้เรียก API ตรง)
 */
export async function trackOrder(orderNoInput: unknown, phoneInput: unknown): Promise<TrackResult> {
  const orderNo = normalizeOrderNo(typeof orderNoInput === "string" ? orderNoInput : "");
  const phone = normalizePhone(typeof phoneInput === "string" ? phoneInput.trim() : "");

  const fieldErrors: Partial<Record<TrackField, string>> = {};
  if (!isValidOrderNo(orderNo)) {
    fieldErrors.orderNo = "เลขออเดอร์ไม่ถูกต้อง ตัวอย่าง: ICE-261117-4821";
  }
  if (!isValidPhone(phone)) {
    fieldErrors.phone = "กรุณากรอกเบอร์โทรที่ใช้ตอนสั่งซื้อ เช่น 081-234-5678";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors };
  }

  const shop = await getShopProfile();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("track_order", {
      p_order_no: orderNo,
      p_phone: phone,
    });

    if (error) {
      // บันทึกเฉพาะรหัส error ห้ามบันทึกเบอร์โทร/เลขออเดอร์ลง log
      console.error("[trackOrder]", error.code, error.message);
      if (error.message.includes("ICE_TOO_MANY_ATTEMPTS")) {
        return {
          ok: false,
          locked: true,
          message: `ค้นหาไม่ตรงหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่ หรือโทรถามร้านที่ ${shop.phone}`,
        };
      }
      if (error.code === "PGRST202") {
        return {
          ok: false,
          message: `ระบบติดตามออเดอร์ยังไม่พร้อมใช้งาน กรุณาโทรถามร้านที่ ${shop.phone}`,
        };
      }
      return { ok: false, message: genericError(shop.phone) };
    }

    const parsed = parseTrackResponse(data);
    if (!parsed) {
      console.error("[trackOrder] unexpected response shape");
      return { ok: false, message: genericError(shop.phone) };
    }
    if (!parsed.found) {
      return {
        ok: false,
        notFound: true,
        message:
          "ไม่พบออเดอร์ กรุณาตรวจสอบเลขออเดอร์และเบอร์โทร (ต้องเป็นเบอร์ที่ใช้ตอนสั่งซื้อ)",
      };
    }
    return { ok: true, order: parsed.order };
  } catch (err) {
    console.error("[trackOrder]", err instanceof Error ? err.message : "unknown error");
    return { ok: false, message: genericError(shop.phone) };
  }
}
