"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminActionResult } from "@/app/admin/actions";
import { isAdminRequest } from "@/lib/admin/auth";
import {
  readProductForm,
  validateProductInput,
  type ProductErrors,
} from "@/lib/admin/product-input";
import { getAdminProduct } from "@/lib/admin/products";
import { reorderIds, sortOrderUpdates } from "@/lib/admin/reorder";
import { removeShopImage, uploadShopImage } from "@/lib/admin/storage";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

/**
 * Server Action จัดการสินค้า — ทุกตัวตรวจสิทธิ์แอดมินเองก่อนแตะข้อมูล
 * (RLS ของตาราง products และ Storage ตรวจ is_admin() ซ้ำอีกชั้น)
 */

export type ProductFormState = {
  errors: ProductErrors;
  message: string | null;
};

const NO_PERMISSION = "ไม่มีสิทธิ์ทำรายการนี้ กรุณาเข้าสู่ระบบใหม่";
const SAVE_FAILED = "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

/**
 * เพิ่มสินค้า (productId = null) หรือแก้ไขสินค้า
 * ใช้กับ useActionState: saveProduct.bind(null, productId)
 */
export async function saveProduct(
  productId: string | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const values = readProductForm((name) => formData.get(name));
  if (!(await isAdminRequest())) return { errors: {}, message: NO_PERMISSION };
  if (productId !== null && !isUuid(productId)) {
    return { errors: {}, message: "ไม่พบสินค้านี้" };
  }

  const checked = validateProductInput(values);
  if (!checked.ok) {
    return { errors: checked.errors, message: "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง" };
  }

  let existingImage: string | null = null;
  if (productId) {
    const existing = await getAdminProduct(productId);
    if (!existing.ok) return { errors: {}, message: SAVE_FAILED };
    if (!existing.data) return { errors: {}, message: "ไม่พบสินค้านี้ (อาจถูกลบไปแล้ว)" };
    existingImage = existing.data.imageUrl;
  }

  // รูป: อัปโหลดใหม่ / ลบรูปเดิม / ไม่เปลี่ยน (undefined)
  const image = formData.get("image");
  let newImageUrl: string | null | undefined;
  if (image instanceof File && image.size > 0) {
    const uploaded = await uploadShopImage(image, "products");
    if (!uploaded.ok) {
      return { errors: { image: uploaded.message }, message: "กรุณาตรวจสอบรูปสินค้า" };
    }
    newImageUrl = uploaded.url;
  } else if (formData.get("removeImage") === "on") {
    newImageUrl = null;
  }

  const row = {
    name: checked.data.name,
    description: checked.data.description,
    size_label: checked.data.sizeLabel,
    price: checked.data.price,
    is_active: checked.data.isActive,
    ...(newImageUrl !== undefined ? { image_url: newImageUrl } : {}),
  };

  try {
    const supabase = await createClient();
    let error: { code?: string; message: string } | null = null;

    if (productId) {
      ({ error } = await supabase.from("products").update(row).eq("id", productId));
    } else {
      // สินค้าใหม่ต่อท้ายสุด
      const { data: last } = await supabase
        .from("products")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const sortOrder = Number(last?.sort_order ?? 0) + 1;
      ({ error } = await supabase.from("products").insert({ ...row, sort_order: sortOrder }));
    }

    if (error) {
      console.error("[saveProduct]", error.code, error.message);
      if (newImageUrl) await removeShopImage(newImageUrl); // บันทึกไม่สำเร็จ ลบรูปที่เพิ่งอัปโหลด
      return { errors: {}, message: SAVE_FAILED };
    }
  } catch (err) {
    console.error("[saveProduct]", err instanceof Error ? err.message : err);
    if (newImageUrl) await removeShopImage(newImageUrl);
    return { errors: {}, message: SAVE_FAILED };
  }

  // เปลี่ยน/ลบรูปสำเร็จแล้ว ค่อยลบรูปเก่าทิ้ง
  if (newImageUrl !== undefined && existingImage) await removeShopImage(existingImage);

  redirect("/admin/products");
}

/** เปิด/ปิดขาย (อัปเดตเฉพาะเมื่อสถานะยังเป็นค่าเดิม กันกดซ้อนกัน) */
export async function setProductActive(
  productId: unknown,
  from: unknown,
  to: unknown,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return { ok: false, message: NO_PERMISSION };
  if (!isUuid(productId) || typeof from !== "boolean" || typeof to !== "boolean" || from === to) {
    return { ok: false, message: SAVE_FAILED };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: to })
      .eq("id", productId)
      .eq("is_active", from)
      .select("id");
    if (error) {
      console.error("[setProductActive]", error.code, error.message);
      return { ok: false, message: SAVE_FAILED };
    }
    if (!data?.length) {
      return { ok: false, conflict: true, message: "สินค้านี้ถูกแก้ไปแล้ว กรุณาโหลดหน้าใหม่" };
    }
  } catch (err) {
    console.error("[setProductActive]", err instanceof Error ? err.message : err);
    return { ok: false, message: SAVE_FAILED };
  }
  refresh();
  return { ok: true };
}

/** เลื่อนลำดับสินค้าขึ้น/ลง 1 ตำแหน่ง (จัดเลขลำดับใหม่เป็น 1, 2, 3, ...) */
export async function moveProduct(
  productId: unknown,
  direction: unknown,
): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return { ok: false, message: NO_PERMISSION };
  if (!isUuid(productId) || (direction !== "up" && direction !== "down")) {
    return { ok: false, message: SAVE_FAILED };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) {
      console.error("[moveProduct]", error?.code, error?.message);
      return { ok: false, message: SAVE_FAILED };
    }

    const ids = data.map((r) => String(r.id));
    const ordered = reorderIds(ids, productId, direction);
    if (!ordered) return { ok: true }; // อยู่บนสุด/ล่างสุดแล้ว

    const current = new Map(data.map((r) => [String(r.id), Number(r.sort_order)]));
    for (const update of sortOrderUpdates(ordered, current)) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ sort_order: update.sortOrder })
        .eq("id", update.id);
      if (updateError) {
        console.error("[moveProduct]", updateError.code, updateError.message);
        return { ok: false, message: SAVE_FAILED };
      }
    }
  } catch (err) {
    console.error("[moveProduct]", err instanceof Error ? err.message : err);
    return { ok: false, message: SAVE_FAILED };
  }
  refresh();
  return { ok: true };
}

/** ลบสินค้า (ออเดอร์เก่าไม่กระทบ เพราะเก็บชื่อ/ราคาไว้ในออเดอร์แล้ว) แล้วลบรูปตาม */
export async function deleteProduct(productId: unknown): Promise<AdminActionResult> {
  if (!(await isAdminRequest())) return { ok: false, message: NO_PERMISSION };
  if (!isUuid(productId)) return { ok: false, message: SAVE_FAILED };

  const existing = await getAdminProduct(productId);
  if (!existing.ok) return { ok: false, message: SAVE_FAILED };
  if (!existing.data) {
    refresh();
    return { ok: true }; // ถูกลบไปแล้ว
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      console.error("[deleteProduct]", error.code, error.message);
      return { ok: false, message: "ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
    }
  } catch (err) {
    console.error("[deleteProduct]", err instanceof Error ? err.message : err);
    return { ok: false, message: "ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }

  await removeShopImage(existing.data.imageUrl);
  refresh();
  return { ok: true };
}
