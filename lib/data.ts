import { unstable_rethrow } from "next/navigation";
import { mapSettingsRow, SETTINGS_COLUMNS, type ShopSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

/**
 * ฟังก์ชันดึงข้อมูลจาก Supabase สำหรับหน้าเว็บฝั่งลูกค้า
 *
 * ทุกฟังก์ชันจะไม่ throw error ออกไป แต่คืนค่า { ok: false } แทน
 * เพื่อให้แต่ละส่วนของหน้าแสดงข้อความแจ้งเองได้ โดยไม่ทำให้ทั้งหน้าพัง
 */

export type Result<T> = { ok: true; data: T } | { ok: false };

export type Product = {
  id: string;
  name: string;
  description: string | null;
  size_label: string | null;
  price: number;
  image_url: string | null;
};

/** สินค้าที่เปิดขายอยู่ (is_active = true) เรียงตาม sort_order */
export async function getActiveProducts(): Promise<Result<Product[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, size_label, price, image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[getActiveProducts]", error.message);
      return { ok: false };
    }

    const products: Product[] = (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: row.description ?? null,
      size_label: row.size_label ?? null,
      price: Number(row.price),
      image_url: row.image_url ?? null,
    }));

    return { ok: true, data: products };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getActiveProducts]", err);
    return { ok: false };
  }
}

/** ข้อความโปรโมชั่นจากตาราง settings (แถว id = 1) คืนค่า null ถ้าไม่มีโปรโมชั่น */
export async function getPromoText(): Promise<Result<string | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("promo_text")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[getPromoText]", error.message);
      return { ok: false };
    }

    const text =
      typeof data?.promo_text === "string" ? data.promo_text.trim() : "";
    return { ok: true, data: text || null };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getPromoText]", err);
    return { ok: false };
  }
}

/** ค่าส่งพื้นฐานจากตาราง settings (ก่อนหักส่งฟรี) */
/** การตั้งค่าร้าน: ค่าส่ง / จำนวนถุงส่งฟรี / ข้อมูลชำระเงิน (ตาราง settings แถว id = 1) */
export async function getShopSettings(): Promise<Result<ShopSettings>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("settings")
      .select(SETTINGS_COLUMNS)
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[getShopSettings]", error.message);
      return { ok: false };
    }

    return { ok: true, data: mapSettingsRow(data as Record<string, unknown> | null) };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getShopSettings]", err);
    return { ok: false };
  }
}

export type OrderingData = {
  products: Product[];
  settings: ShopSettings;
};

/** ข้อมูลที่หน้าตะกร้าและหน้าสั่งซื้อต้องใช้ (สินค้า + การตั้งค่าร้าน) */
export async function getOrderingData(): Promise<Result<OrderingData>> {
  const [products, settings] = await Promise.all([
    getActiveProducts(),
    getShopSettings(),
  ]);
  if (!products.ok || !settings.ok) return { ok: false };
  return {
    ok: true,
    data: { products: products.data, settings: settings.data },
  };
}
