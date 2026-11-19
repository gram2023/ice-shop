import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import TrackOrderView from "@/components/track/TrackOrderView";
import { getShopProfile } from "@/lib/shop-profile-server";
import { isValidOrderNo, normalizeOrderNo } from "@/lib/tracking";

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShopProfile();
  return {
    title: "ติดตามออเดอร์",
    description: `ตรวจสอบสถานะคำสั่งซื้อน้ำแข็งจาก ${shop.name}`,
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** เติมเลขออเดอร์จากลิงก์ ?order= (มาจากหน้าสั่งซื้อสำเร็จ) — ไม่รับเบอร์โทรจากลิงก์ */
async function TrackWithPrefill({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).order;
  const orderNo = normalizeOrderNo((Array.isArray(raw) ? raw[0] : raw) ?? "").slice(0, 20);
  return <TrackOrderView initialOrderNo={isValidOrderNo(orderNo) ? orderNo : ""} />;
}

export default function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader
        title="ติดตามออเดอร์"
        description="กรอกเลขออเดอร์และเบอร์โทรที่ใช้ตอนสั่งซื้อ"
        width="narrow"
      />
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-14 sm:px-6">
        <Suspense fallback={<TrackOrderView initialOrderNo="" />}>
          <TrackWithPrefill searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
