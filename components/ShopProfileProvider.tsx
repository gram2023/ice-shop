"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_PROFILE, type ShopProfile } from "@/lib/shop-profile";

/**
 * ส่งข้อมูลร้าน (จาก layout ฝั่ง server) ให้ Client Component ทุกตัวใช้ได้
 * โดยไม่ต้องส่ง props ต่อกันหลายชั้น — อ่านด้วย useShopProfile()
 */
const ShopProfileContext = createContext<ShopProfile>(DEFAULT_PROFILE);

export function ShopProfileProvider({
  profile,
  children,
}: {
  profile: ShopProfile;
  children: ReactNode;
}) {
  return <ShopProfileContext value={profile}>{children}</ShopProfileContext>;
}

export function useShopProfile() {
  return useContext(ShopProfileContext);
}
