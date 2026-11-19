import type { Metadata } from "next";
import { Suspense } from "react";
import CartView, { CartSkeleton } from "@/components/cart/CartView";
import PageHeader from "@/components/PageHeader";
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
    <>
      <PageHeader title="ตะกร้าสินค้า" />
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6">
        <Suspense fallback={<CartSkeleton />}>
          <CartLoader />
        </Suspense>
      </div>
    </>
  );
}
