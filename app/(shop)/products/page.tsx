import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon } from "@/components/icons";
import PageHeader from "@/components/PageHeader";
import ProductOrderList, {
  ProductOrderListSkeleton,
} from "@/components/ProductOrderList";
import { getShopSettings } from "@/lib/data";
import { getShopProfile } from "@/lib/shop-profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShopProfile();
  return {
    title: "สินค้า",
    description: `เลือกซื้อน้ำแข็งจาก ${shop.name} สั่งออนไลน์ ส่งถึงที่`,
  };
}

/** "· สั่งครบ N ถุง ส่งฟรี" จากการตั้งค่าร้าน (ไม่แสดงถ้าไม่มีโปรส่งฟรีหรือโหลดไม่ได้) */
async function FreeShippingNote() {
  const settings = await getShopSettings();
  if (!settings.ok || settings.data.freeShippingMinQty <= 0) return null;
  return <> · สั่งครบ {settings.data.freeShippingMinQty} ถุง ส่งฟรี</>;
}

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="สินค้า"
        description={
          <>
            เลือกจำนวนแล้วกด “ใส่ตะกร้า”
            <Suspense fallback={null}>
              <FreeShippingNote />
            </Suspense>
          </>
        }
      />
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6">
        <Suspense fallback={<ProductOrderListSkeleton />}>
          <ProductOrderList />
        </Suspense>

        <div className="mt-8 flex justify-center sm:justify-end">
          <Link
            href="/cart"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sun-400 px-8 font-display text-lg text-forest-950 transition hover:bg-sun-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600 motion-safe:active:scale-98"
          >
            ไปที่ตะกร้า
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </div>
    </>
  );
}
