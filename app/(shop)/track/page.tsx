import type { Metadata } from "next";
import { Suspense } from "react";
import TrackOrderView from "@/components/track/TrackOrderView";
import { shopConfig } from "@/lib/shop-config";
import { isValidOrderNo, normalizeOrderNo } from "@/lib/tracking";

export const metadata: Metadata = {
  title: "ติดตามออเดอร์",
  description: `ตรวจสอบสถานะคำสั่งซื้อน้ำแข็งจาก ${shopConfig.name}`,
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** เติมเลขออเดอร์จากลิงก์ ?order= (มาจากหน้าสั่งซื้อสำเร็จ) — ไม่รับเบอร์โทรจากลิงก์ */
async function TrackWithPrefill({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).order;
  const orderNo = normalizeOrderNo((Array.isArray(raw) ? raw[0] : raw) ?? "").slice(0, 20);
  return <TrackOrderView initialOrderNo={isValidOrderNo(orderNo) ? orderNo : ""} />;
}

export default function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">ติดตามออเดอร์</h1>
      <p className="mt-2 text-lg text-slate-600">
        กรอกเลขออเดอร์และเบอร์โทรที่ใช้ตอนสั่งซื้อ
      </p>
      <div className="mt-6">
        <Suspense fallback={<TrackOrderView initialOrderNo="" />}>
          <TrackWithPrefill searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
