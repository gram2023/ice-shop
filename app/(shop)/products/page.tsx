import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon } from "@/components/icons";
import ProductOrderList, {
  ProductOrderListSkeleton,
} from "@/components/ProductOrderList";
import { getShopSettings } from "@/lib/data";
import { shopConfig } from "@/lib/shop-config";

export const metadata: Metadata = {
  title: "สินค้า",
  description: `เลือกซื้อน้ำแข็งจาก ${shopConfig.name} สั่งออนไลน์ ส่งถึงที่`,
};

/** "· สั่งครบ N ถุง ส่งฟรี" จากการตั้งค่าร้าน (ไม่แสดงถ้าไม่มีโปรส่งฟรีหรือโหลดไม่ได้) */
async function FreeShippingNote() {
  const settings = await getShopSettings();
  if (!settings.ok || settings.data.freeShippingMinQty <= 0) return null;
  return <> · สั่งครบ {settings.data.freeShippingMinQty} ถุง ส่งฟรี</>;
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">สินค้า</h1>
      <p className="mt-2 text-lg text-slate-600">
        เลือกจำนวนแล้วกด “ใส่ตะกร้า”
        <Suspense fallback={null}>
          <FreeShippingNote />
        </Suspense>
      </p>

      <div className="mt-6">
        <Suspense fallback={<ProductOrderListSkeleton />}>
          <ProductOrderList />
        </Suspense>
      </div>

      <div className="mt-8 flex justify-center sm:justify-end">
        <Link
          href="/cart"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          ไปที่ตะกร้า
          <ArrowRightIcon className="size-5" />
        </Link>
      </div>
    </div>
  );
}
