import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ShopProfileProvider } from "@/components/ShopProfileProvider";
import { getShopProfile } from "@/lib/shop-profile-server";

/** layout ของหน้าฝั่งลูกค้า (โฟลเดอร์ในวงเล็บไม่มีผลกับ URL) */
export default async function ShopLayout({ children }: { children: ReactNode }) {
  // ข้อมูลร้านอยู่ใน cache → ไม่ต้องรอฐานข้อมูลทุกครั้ง และยังสร้างหน้าล่วงหน้าได้
  const shop = await getShopProfile();
  return (
    <ShopProfileProvider profile={shop}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ShopProfileProvider>
  );
}
