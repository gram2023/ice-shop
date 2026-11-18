"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatDeliveryAt } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-rules";
import type { OrderSummary } from "@/lib/order-summary";
import type { PaymentInfo } from "@/lib/settings";
import { telHref } from "@/lib/shop-profile";
import OrderTotals from "../cart/OrderTotals";
import { ChatIcon, CheckIcon, PhoneIcon } from "../icons";
import { useShopProfile } from "../ShopProfileProvider";

/** หน้าแสดงผลหลังสั่งซื้อสำเร็จ (payment = ข้อมูลชำระเงินที่แอดมินตั้งไว้) */
export default function OrderSuccess({
  order,
  payment,
}: {
  order: OrderSummary;
  payment: PaymentInfo;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // ย้ายโฟกัสมาที่หัวข้อ เพื่อให้โปรแกรมอ่านหน้าจออ่านว่าสั่งซื้อสำเร็จ
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby="success-heading" className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckIcon className="mx-auto size-14 text-green-600" />
        <h2
          id="success-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 text-2xl font-bold text-green-900 focus:outline-none"
        >
          สั่งซื้อสำเร็จ
        </h2>
        <p className="mt-1 text-green-800">ร้านจะโทรยืนยันคำสั่งซื้อก่อนจัดส่ง</p>
        <p className="mt-5 text-sm text-slate-600">เลขที่คำสั่งซื้อ</p>
        <p className="text-3xl font-extrabold tracking-wide text-blue-950">
          {order.orderNo}
        </p>
        <p className="mt-1 text-sm text-slate-500">กรุณาจดหรือแคปหน้าจอนี้ไว้</p>
      </div>

      <PaymentInstructions order={order} payment={payment} />

      <div className="space-y-4 rounded-2xl border border-sky-100 bg-white p-5">
        <h3 className="text-lg font-bold text-blue-950">รายละเอียดคำสั่งซื้อ</h3>
        <dl className="space-y-1 text-base">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-slate-600">จัดส่ง:</dt>
            <dd className="font-semibold text-slate-800">
              {formatDeliveryAt(order.deliveryAt)}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-slate-600">ชำระเงิน:</dt>
            <dd className="font-semibold text-slate-800">
              {paymentMethodLabel(order.paymentMethod)}
            </dd>
          </div>
        </dl>
        <ul className="divide-y divide-sky-100 border-y border-sky-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2">
              <span className="text-slate-700">
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold text-slate-800">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <OrderTotals
          totalQuantity={order.totalQuantity}
          subtotal={order.subtotal}
          deliveryFee={order.deliveryFee}
          total={order.total}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* ส่งเฉพาะเลขออเดอร์ในลิงก์ (ไม่ใส่เบอร์โทร เพราะลิงก์ถูกเก็บในประวัติ/ล็อก) */}
        <Link
          href={`/track?order=${encodeURIComponent(order.orderNo)}`}
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          ติดตามออเดอร์
        </Link>
        <Link
          href="/products"
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-sky-200 bg-white px-6 font-semibold text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          สั่งซื้อเพิ่ม
        </Link>
        <Link
          href="/"
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-sky-200 bg-white px-6 font-semibold text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </section>
  );
}

function PaymentInstructions({
  order,
  payment,
}: {
  order: OrderSummary;
  payment: PaymentInfo;
}) {
  const shop = useShopProfile();
  const amount = formatPrice(order.total);
  // ร้านไม่มี LINE → ให้ติดต่อทางโทรศัพท์แทน
  const line = shop.lineId && shop.lineUrl ? { id: shop.lineId, url: shop.lineUrl } : null;
  const channel = line ? "LINE" : `โทรศัพท์ ${shop.phone}`;

  if (order.paymentMethod === "cod") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <h3 className="text-lg font-bold text-blue-950">การชำระเงิน</h3>
        <p className="mt-1 text-slate-700">
          ชำระเงินสด <strong className="text-blue-950">{amount}</strong>{" "}
          กับพนักงานเมื่อได้รับน้ำแข็ง
        </p>
      </div>
    );
  }

  const isTransfer = order.paymentMethod === "transfer";
  const what = isTransfer ? "เลขบัญชี" : "QR พร้อมเพย์";
  // ร้านใส่ข้อมูลชำระเงินจริงไว้แล้วหรือยัง (ยังไม่ใส่ = ให้ลูกค้าทัก LINE ขอแทน)
  const ready = isTransfer
    ? Boolean(payment.accountNumber)
    : Boolean(payment.promptPayId || payment.promptPayQrUrl);

  return (
    <div className="space-y-4 rounded-2xl border border-sky-100 bg-sky-50 p-5">
      <div>
        <h3 className="text-lg font-bold text-blue-950">ชำระเงิน {amount}</h3>
        <p className="text-sm text-slate-600">
          {ready
            ? `ชำระแล้วแจ้งร้านทาง${channel} พร้อมเลขคำสั่งซื้อ ${order.orderNo}`
            : `ร้านจะแจ้ง${what}ให้ทาง${channel} กรุณาติดต่อร้านพร้อมแจ้งเลขคำสั่งซื้อ ${order.orderNo} และส่งสลิปหลังชำระเงิน`}
        </p>
      </div>

      {ready && isTransfer && (
        <dl className="space-y-1 rounded-xl bg-white p-4">
          {payment.bankName && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-600">ธนาคาร:</dt>
              <dd className="font-semibold">{payment.bankName}</dd>
            </div>
          )}
          {payment.accountName && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-600">ชื่อบัญชี:</dt>
              <dd className="font-semibold">{payment.accountName}</dd>
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-slate-600">เลขที่บัญชี:</dt>
            <dd className="text-xl font-bold tracking-wide text-blue-950">
              {payment.accountNumber}
            </dd>
          </div>
        </dl>
      )}

      {ready && !isTransfer && (
        <div className="rounded-xl bg-white p-4 text-center">
          {payment.promptPayQrUrl && (
            // unoptimized: แสดงไฟล์ต้นฉบับ ไม่ให้การบีบอัดรูปทำให้ QR สแกนยาก
            <Image
              src={payment.promptPayQrUrl}
              alt={`QR พร้อมเพย์${payment.accountName ? ` ${payment.accountName}` : ""}`}
              width={240}
              height={240}
              unoptimized
              className="mx-auto h-auto w-60 max-w-full"
            />
          )}
          {payment.promptPayId && (
            <>
              <p className="mt-2 text-slate-600">พร้อมเพย์</p>
              <p className="text-xl font-bold tracking-wide text-blue-950">
                {payment.promptPayId}
              </p>
            </>
          )}
          {payment.accountName && (
            <p className="text-sm text-slate-500">{payment.accountName}</p>
          )}
        </div>
      )}

      {line ? (
        <a
          href={line.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-2 text-center font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <ChatIcon className="size-6 shrink-0" />
          {ready ? `ส่งสลิปทาง LINE (${line.id})` : `ทัก LINE เพื่อรับ${what} (${line.id})`}
        </a>
      ) : (
        <a
          href={telHref(shop.phone)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-center font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PhoneIcon className="size-6 shrink-0" />
          โทรหาร้าน {shop.phone}
        </a>
      )}
    </div>
  );
}
