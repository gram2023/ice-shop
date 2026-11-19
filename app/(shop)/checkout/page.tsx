import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutView, {
  CheckoutSkeleton,
} from "@/components/checkout/CheckoutView";
import PageHeader from "@/components/PageHeader";
import SectionMessage from "@/components/SectionMessage";
import { getOrderingData } from "@/lib/data";
import { getShopProfile } from "@/lib/shop-profile-server";

export const metadata: Metadata = {
  title: "สั่งซื้อ",
  robots: { index: false },
};

async function CheckoutLoader() {
  const result = await getOrderingData();
  if (!result.ok) {
    const shop = await getShopProfile();
    return (
      <SectionMessage variant="error">
        ไม่สามารถโหลดข้อมูลสำหรับสั่งซื้อได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
        หรือโทรสั่งที่ {shop.phone}
      </SectionMessage>
    );
  }
  return (
    <CheckoutView
      products={result.data.products}
      settings={result.data.settings}
    />
  );
}

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="สั่งซื้อน้ำแข็ง" />
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutLoader />
        </Suspense>
      </div>
    </>
  );
}
