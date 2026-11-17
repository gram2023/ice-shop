import { unstable_rethrow } from "next/navigation";
import type { Result } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

/**
 * ข้อมูลสินค้าสำหรับหน้าแอดมิน (รวมสินค้าที่ปิดขาย)
 * ต้องเรียกหลังตรวจสิทธิ์แอดมินแล้ว — RLS ให้แอดมินเห็นสินค้าที่ปิดขายได้ผ่าน is_admin()
 */

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  sizeLabel: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

const COLUMNS = "id, name, description, size_label, price, image_url, is_active, sort_order";

function toProduct(row: Record<string, unknown>): AdminProduct {
  const textOrNull = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: textOrNull(row.description),
    sizeLabel: textOrNull(row.size_label),
    price: Number(row.price),
    imageUrl: textOrNull(row.image_url),
    isActive: row.is_active === true,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export async function listAllProducts(): Promise<Result<AdminProduct[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[listAllProducts]", error.code, error.message);
      return { ok: false };
    }
    return { ok: true, data: (data ?? []).map((r) => toProduct(r as Record<string, unknown>)) };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[listAllProducts]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

export async function getAdminProduct(id: string): Promise<Result<AdminProduct | null>> {
  if (!isUuid(id)) return { ok: true, data: null };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[getAdminProduct]", error.code, error.message);
      return { ok: false };
    }
    return { ok: true, data: data ? toProduct(data as Record<string, unknown>) : null };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getAdminProduct]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
