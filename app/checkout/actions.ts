"use server";

import { validateCheckout, type FieldErrors } from "@/lib/checkout";
import { parseOrderSummary, type OrderSummary } from "@/lib/order-summary";
import { shopConfig } from "@/lib/shop-config";
import { createClient } from "@/lib/supabase/server";

export type PlaceOrderResult =
  | { ok: true; order: OrderSummary }
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
      /** true = สินค้าบางรายการหยุดขาย ให้ลูกค้ากลับไปแก้ตะกร้า */
      cartChanged?: boolean;
    };

const GENERIC_ERROR = `ส่งคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือโทรสั่งที่ ${shopConfig.phone}`;

/**
 * รับคำสั่งซื้อจากหน้า /checkout
 *
 * Server Action ถูกเรียกตรง ๆ ด้วย POST ได้โดยไม่ผ่านหน้าเว็บ จึงต้องตรวจข้อมูลซ้ำทุกครั้ง
 * ส่วนราคา ค่าส่ง และสถานะออเดอร์ ฟังก์ชัน place_order ในฐานข้อมูลเป็นผู้กำหนดเอง
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const checked = validateCheckout(input, Date.now());
  if (!checked.ok) {
    return {
      ok: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง",
      fieldErrors: checked.errors,
    };
  }

  const order = checked.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("place_order", {
      p_customer_name: order.name,
      p_phone: order.phone,
      p_address: order.address,
      p_delivery_at: order.deliveryAtIso,
      p_payment_method: order.paymentMethod,
      p_items: order.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      p_note: order.note,
    });

    if (error) {
      // บันทึกเฉพาะรหัสและข้อความ error ห้ามบันทึก error.details เพราะอาจมีข้อมูลลูกค้า
      console.error("[placeOrder]", error.code, error.message);
      return mapRpcError(error.code, error.message);
    }

    const summary = parseOrderSummary({
      ...(typeof data === "object" && data !== null ? data : {}),
      delivery_at: order.deliveryAtIso,
      payment_method: order.paymentMethod,
    });

    if (!summary) {
      console.error("[placeOrder] unexpected response shape");
      return {
        ok: false,
        message: `ระบบได้รับคำสั่งซื้อแล้วแต่แสดงผลไม่ได้ กรุณาโทรยืนยันกับร้านที่ ${shopConfig.phone}`,
      };
    }

    return { ok: true, order: summary };
  } catch (err) {
    console.error("[placeOrder]", err instanceof Error ? err.message : "unknown error");
    return { ok: false, message: GENERIC_ERROR };
  }
}

function mapRpcError(code: string | undefined, message: string): PlaceOrderResult {
  const reason = message.match(/ICE_[A-Z_]+/)?.[0];

  switch (reason) {
    case "ICE_PRODUCT_UNAVAILABLE":
      return {
        ok: false,
        cartChanged: true,
        message: "สินค้าบางรายการหยุดขายแล้ว กรุณากลับไปตรวจสอบตะกร้าอีกครั้ง",
      };
    case "ICE_RATE_LIMITED":
      return {
        ok: false,
        message: `เบอร์นี้สั่งซื้อหลายครั้งในเวลาสั้น ๆ กรุณารอประมาณ 10 นาที หรือโทรสั่งที่ ${shopConfig.phone}`,
      };
    case "ICE_INVALID_DELIVERY_TIME":
      return {
        ok: false,
        message: "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง",
        fieldErrors: { deliveryTime: "เวลาที่เลือกจัดส่งไม่ได้แล้ว กรุณาเลือกเวลาใหม่" },
      };
    case "ICE_INVALID_NAME":
      return fieldError("name", "ชื่อผู้สั่งไม่ถูกต้อง");
    case "ICE_INVALID_PHONE":
      return fieldError("phone", "เบอร์โทรไม่ถูกต้อง");
    case "ICE_INVALID_ADDRESS":
      return fieldError("address", "ที่อยู่จัดส่งไม่ถูกต้อง");
    case "ICE_INVALID_NOTE":
      return fieldError("note", "หมายเหตุยาวเกินไป");
    case "ICE_INVALID_PAYMENT":
      return fieldError("paymentMethod", "วิธีชำระเงินไม่ถูกต้อง");
    case "ICE_INVALID_ITEMS":
      return {
        ok: false,
        cartChanged: true,
        message: "ข้อมูลสินค้าในตะกร้าไม่ถูกต้อง กรุณากลับไปตรวจสอบตะกร้าอีกครั้ง",
      };
  }

  // PGRST202 = หาฟังก์ชัน place_order ไม่เจอ (ยังไม่ได้รัน supabase/place_order.sql)
  if (code === "PGRST202") {
    return {
      ok: false,
      message: `ระบบสั่งซื้อออนไลน์ยังไม่พร้อมใช้งาน กรุณาโทรสั่งที่ ${shopConfig.phone}`,
    };
  }

  return { ok: false, message: GENERIC_ERROR };
}

function fieldError(field: keyof FieldErrors, text: string): PlaceOrderResult {
  return {
    ok: false,
    message: "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง",
    fieldErrors: { [field]: text },
  };
}
