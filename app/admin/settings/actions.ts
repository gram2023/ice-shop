"use server";

import { refresh } from "next/cache";
import { isAdminRequest } from "@/lib/admin/auth";
import {
  readSettingsForm,
  validateSettingsInput,
  type SettingsErrors,
} from "@/lib/admin/settings-input";
import { removeShopImage, uploadShopImage } from "@/lib/admin/storage";
import { getShopSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = {
  errors: SettingsErrors;
  message: string | null;
  saved: boolean;
};

const SAVE_FAILED = "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

/** บันทึกการตั้งค่าร้าน (ตาราง settings แถว id = 1) — ตรวจสิทธิ์แอดมินเองก่อน */
export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const values = readSettingsForm((name) => formData.get(name));
  const fail = (message: string, errors: SettingsErrors = {}): SettingsFormState => ({
    errors,
    message,
    saved: false,
  });

  if (!(await isAdminRequest())) return fail("ไม่มีสิทธิ์ทำรายการนี้ กรุณาเข้าสู่ระบบใหม่");

  const checked = validateSettingsInput(values);
  if (!checked.ok) return fail("กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง", checked.errors);

  const current = await getShopSettings();
  if (!current.ok) return fail(SAVE_FAILED);
  const oldQrUrl = current.data.payment.promptPayQrUrl;

  // รูป QR: อัปโหลดใหม่ / ลบรูปเดิม / ไม่เปลี่ยน (undefined)
  const qr = formData.get("qrImage");
  let newQrUrl: string | null | undefined;
  if (qr instanceof File && qr.size > 0) {
    const uploaded = await uploadShopImage(qr, "qr");
    if (!uploaded.ok) return fail("กรุณาตรวจสอบรูป QR", { qrImage: uploaded.message });
    newQrUrl = uploaded.url;
  } else if (formData.get("removeQrImage") === "on") {
    newQrUrl = null;
  }

  const d = checked.data;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .update({
        delivery_fee: d.deliveryFee,
        free_shipping_min_qty: d.freeShippingMinQty,
        promo_text: d.promoText,
        bank_name: d.bankName,
        bank_account_name: d.accountName,
        bank_account_number: d.accountNumber,
        promptpay_id: d.promptPayId,
        ...(newQrUrl !== undefined ? { promptpay_qr_url: newQrUrl } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select("id");

    if (error || !data?.length) {
      console.error("[saveSettings]", error?.code ?? "no row updated", error?.message);
      if (newQrUrl) await removeShopImage(newQrUrl);
      return fail(SAVE_FAILED);
    }
  } catch (err) {
    console.error("[saveSettings]", err instanceof Error ? err.message : err);
    if (newQrUrl) await removeShopImage(newQrUrl);
    return fail(SAVE_FAILED);
  }

  if (newQrUrl !== undefined && oldQrUrl) await removeShopImage(oldQrUrl);

  refresh();
  return { errors: {}, message: "บันทึกการตั้งค่าแล้ว", saved: true };
}
