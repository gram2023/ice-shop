import type { ShopProfile } from "./shop-profile";

/**
 * ช่องรูปที่แอดมินอัปโหลดได้ในหน้า "รูปหน้าแรก" (ใช้ทั้งฝั่ง server และฟอร์ม)
 * column = ช่องในตาราง settings (supabase/phase6.sql + ui3.sql)
 */
export const HOME_IMAGE_SLOTS = ["logo", "hero", "hero2", "about"] as const;
export type HomeImageSlot = (typeof HOME_IMAGE_SLOTS)[number];

type SlotInfo = {
  label: string;
  hint: string;
  column: "logo_url" | "hero_image_url" | "hero_image2_url" | "about_image_url";
  profileKey: keyof Pick<ShopProfile, "logoUrl" | "heroImageUrl" | "heroImage2Url" | "aboutImageUrl">;
  /** logo = คงไฟล์ PNG ไว้ (พื้นใส) และย่อเล็กกว่า */
  variant: "photo" | "logo";
};

export const HOME_IMAGE_INFO: Record<HomeImageSlot, SlotInfo> = {
  logo: {
    label: "โลโก้ร้าน",
    hint: "แสดงที่เมนูด้านบนและส่วนท้ายเว็บ · รูปสี่เหลี่ยมจัตุรัส ถ้าเป็น PNG พื้นใสจะสวยที่สุด",
    column: "logo_url",
    profileKey: "logoUrl",
    variant: "logo",
  },
  hero: {
    label: "รูปหลักส่วนบน",
    hint: "กรอบใหญ่ข้างหัวข้อหน้าแรก · รูปแนวนอน เช่น หน้าร้าน หรือน้ำแข็งที่ขาย",
    column: "hero_image_url",
    profileKey: "heroImageUrl",
    variant: "photo",
  },
  hero2: {
    label: "รูปเล็กส่วนบน",
    hint: "กรอบเล็กซ้อนมุมรูปหลัก · รูปสี่เหลี่ยมจัตุรัส (ถ้ามีรูปเดียว จะแสดงเป็นกรอบใหญ่)",
    column: "hero_image2_url",
    profileKey: "heroImage2Url",
    variant: "photo",
  },
  about: {
    label: "รูปส่วนเกี่ยวกับร้าน",
    hint: "แสดงคู่กับการ์ดจุดเด่นร้าน · รูปแนวตั้ง เช่น พนักงาน หรือบรรยากาศในร้าน",
    column: "about_image_url",
    profileKey: "aboutImageUrl",
    variant: "photo",
  },
};

export function isHomeImageSlot(value: unknown): value is HomeImageSlot {
  return typeof value === "string" && (HOME_IMAGE_SLOTS as readonly string[]).includes(value);
}
