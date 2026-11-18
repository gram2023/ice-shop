import type { Metadata } from "next";
import { Suspense } from "react";
import CartView, { CartSkeleton } from "@/components/cart/CartView";
import SectionMessage from "@/components/SectionMessage";
import { getOrderingData } from "@/lib/data";
import { getShopProfile } from "@/lib/shop-profile-server";

export const metadata: Metadata = {
  title: "ตะกร้าสินค้า",
};

/** ดึงราคาสินค้าและค่าส่งล่าสุดจากฐานข้อมูล (ตะกร้าในเบราว์เซอร์เก็บแค่รหัสสินค้ากับจำนวน) */
async function CartLoader() {
  const result = await getOrderingData();
  if (!result.ok) {
    const shop = await getShopProfile();
    return (
      <SectionMessage variant="error">
        ไม่สามารถโหลดข้อมูลตะกร้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
        หรือโทรสั่งที่ {shop.phone}
      </SectionMessage>
    );
  }
  return (
    <CartView
      products={result.data.products}
      settings={result.data.settings}
    />
  );
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">
        ตะกร้าสินค้า
      </h1>
      <div className="mt-6">
        <Suspense fallback={<CartSkeleton />}>
          <CartLoader />
        </Suspense>
      </div>
    </div>
  );
}
