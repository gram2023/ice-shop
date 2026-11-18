"use client";

import type { Ref } from "react";
import { formatDeliveryAt } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-rules";
import { PAYMENT_STATUS_LABELS } from "@/lib/order-status";
import { telHref } from "@/lib/shop-profile";
import { currentStepIndex, TRACK_STEPS, type TrackedOrder } from "@/lib/tracking";
import OrderTotals from "../cart/OrderTotals";
import { AlertIcon, ChatIcon, CheckIcon, PhoneIcon } from "../icons";
import { useShopProfile } from "../ShopProfileProvider";

const timeFormat = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});

type Props = {
  order: TrackedOrder;
  updatedAt: number | null;
  headingRef: Ref<HTMLHeadingElement>;
  onReset: () => void;
};

/** แถบสถานะ 5 ขั้น: ขั้นที่ผ่านแล้ว ✓ / ขั้นปัจจุบัน (ไฮไลต์) / ขั้นถัดไป (สีจาง) */
function StatusSteps({ current }: { current: number }) {
  return (
    <ol className="space-y-0">
      {TRACK_STEPS.map((step, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <li
            key={step.status}
            aria-current={isCurrent ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {i < TRACK_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-8 left-3.75 h-[calc(100%-2rem)] w-0.5 ${
                  done ? "bg-green-500" : "bg-slate-200"
                }`}
              />
            )}
            <span
              className={`relative grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                done
                  ? "bg-green-600 text-white"
                  : isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className="pt-1">
              <span
                className={`block ${
                  isCurrent
                    ? "font-bold text-blue-900"
                    : done
                      ? "font-medium text-slate-700"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {isCurrent && <span className="text-sm font-semibold text-blue-700">สถานะตอนนี้</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** ผลการติดตามออเดอร์ (ไม่มีที่อยู่ เบอร์โทร หรือหมายเหตุ — ฐานข้อมูลไม่ส่งมา) */
export default function TrackResult({ order, updatedAt, headingRef, onReset }: Props) {
  const shop = useShopProfile();
  const line = shop.lineId && shop.lineUrl ? { id: shop.lineId, url: shop.lineUrl } : null;
  const current = currentStepIndex(order.status);
  const cancelled = order.status === "cancelled";
  const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const needsSlip =
    !cancelled && order.paymentStatus === "unpaid" && order.paymentMethod !== "cod";

  return (
    <section aria-labelledby="track-heading" className="space-y-5">
      <div className="rounded-2xl border border-sky-100 bg-white p-5">
        <p className="text-sm text-slate-500">เลขที่คำสั่งซื้อ</p>
        <h2
          id="track-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-extrabold tracking-wide text-blue-950 focus:outline-none"
        >
          {order.orderNo}
        </h2>
        {order.customerNameMasked && (
          <p className="mt-1 text-slate-600">ผู้สั่ง: {order.customerNameMasked}</p>
        )}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-5">
        <h3 className="mb-4 text-lg font-bold text-blue-950">สถานะคำสั่งซื้อ</h3>
        {/* ประกาศให้โปรแกรมอ่านหน้าจอเฉพาะตอนสถานะเปลี่ยน (ไม่รวมเวลาอัปเดตที่เปลี่ยนทุกนาที) */}
        <div aria-live="polite">
        {cancelled ? (
          <div role="status" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-900">
            <AlertIcon className="size-6 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">ออเดอร์นี้ถูกยกเลิก</p>
              <p className="text-sm">สอบถามรายละเอียดได้ที่ร้านทางโทรศัพท์หรือ LINE</p>
            </div>
          </div>
        ) : (
          <StatusSteps current={current} />
        )}
        {order.status === "delivered" && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 font-semibold text-green-800">
            <CheckIcon className="size-5 shrink-0" />
            ส่งถึงเรียบร้อยแล้ว ขอบคุณที่ใช้บริการครับ
          </p>
        )}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {updatedAt ? `อัปเดตล่าสุด ${timeFormat.format(new Date(updatedAt))} น. · ` : ""}
          หน้านี้อัปเดตสถานะเองทุก 1 นาที
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5">
        <h3 className="text-lg font-bold text-blue-950">รายละเอียด</h3>
        <dl className="space-y-1">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-slate-600">จัดส่ง:</dt>
            <dd className="font-semibold text-slate-800">{formatDeliveryAt(order.deliveryAt)}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-slate-600">ชำระเงิน:</dt>
            <dd className="font-semibold text-slate-800">
              {paymentMethodLabel(order.paymentMethod)} ·{" "}
              <span className={order.paymentStatus === "paid" ? "text-green-700" : "text-amber-700"}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
            </dd>
          </div>
        </dl>
        {needsSlip && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            {line
              ? `ถ้าชำระเงินแล้ว ส่งสลิปพร้อมเลขคำสั่งซื้อทาง LINE ${line.id} ได้เลย`
              : `ถ้าชำระเงินแล้ว แจ้งร้านพร้อมเลขคำสั่งซื้อที่เบอร์ ${shop.phone} ได้เลย`}
          </p>
        )}
        <ul className="divide-y divide-sky-100 border-y border-sky-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2">
              <span className="text-slate-700">
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold text-slate-800">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <OrderTotals
          totalQuantity={totalQuantity}
          subtotal={order.subtotal}
          deliveryFee={order.deliveryFee}
          total={order.total}
        />
      </div>

      <div className={`grid gap-3 ${line ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <button
          type="button"
          onClick={onReset}
          className="h-12 rounded-full border border-sky-200 bg-white px-5 font-semibold text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          ค้นหาออเดอร์อื่น
        </button>
        <a
          href={telHref(shop.phone)}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PhoneIcon className="size-5" />
          โทรถามร้าน
        </a>
        {line && (
          <a
            href={line.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-5 font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <ChatIcon className="size-5" />
            LINE ร้าน
          </a>
        )}
      </div>
    </section>
  );
}
