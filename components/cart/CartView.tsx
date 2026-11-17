"use client";

import Link from "next/link";
import {
  removeFromCart,
  setCartQuantity,
  useCartLines,
} from "@/lib/cart-store";
import { matchCart } from "@/lib/cart";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { calculateTotals, lineTotal } from "@/lib/order-rules";
import type { ShopSettings } from "@/lib/settings";
import { CartIcon, TrashIcon } from "../icons";
import ProductImage from "../ProductImage";
import SectionMessage from "../SectionMessage";
import OrderTotals, { FreeShippingHint } from "./OrderTotals";
import QuantityStepper from "./QuantityStepper";

type Props = {
  products: Product[];
  settings: ShopSettings;
};

const SUMMARY_HEADING_ID = "cart-summary-heading";

const primaryButton =
  "flex h-14 w-full items-center justify-center rounded-full bg-blue-600 px-6 text-lg font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export default function CartView({ products, settings }: Props) {
  const lines = useCartLines();

  if (lines === null) return <CartSkeleton />;
  if (lines.length === 0) return <EmptyCart />;

  const { rows, available, unavailableCount } = matchCart(lines, products);
  const totals = calculateTotals(
    available.map((r) => ({ price: r.product.price, quantity: r.line.quantity })),
    settings.deliveryFee,
    settings.freeShippingMinQty,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-4">
        {unavailableCount > 0 && (
          <SectionMessage variant="error">
            สินค้าบางรายการหยุดขายแล้ว กรุณาลบออกจากตะกร้าก่อนสั่งซื้อ
          </SectionMessage>
        )}

        <ul className="divide-y divide-sky-100 rounded-2xl border border-sky-100 bg-white">
          {rows.map((row) =>
            row.product ? (
              <li key={row.line.productId} className="flex gap-3 p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                  <ProductImage
                    src={row.product.image_url}
                    alt={row.product.name}
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-blue-950">
                        {row.product.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {row.product.size_label &&
                          `ขนาด ${row.product.size_label} · `}
                        {formatPrice(row.product.price)} / ถุง
                      </p>
                    </div>
                    <RemoveButton
                      productId={row.line.productId}
                      name={row.product.name}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper
                      value={row.line.quantity}
                      onChange={(q) => setCartQuantity(row.line.productId, q)}
                      label={`จำนวน ${row.product.name}`}
                    />
                    <p className="text-lg font-bold text-blue-700">
                      {formatPrice(lineTotal(row.product.price, row.line.quantity))}
                    </p>
                  </div>
                </div>
              </li>
            ) : (
              <li
                key={row.line.productId}
                className="flex items-center justify-between gap-3 bg-amber-50/60 p-4"
              >
                <div>
                  <h2 className="font-bold text-slate-700">สินค้าที่หยุดขายแล้ว</h2>
                  <p className="text-sm text-slate-500">
                    จำนวน {row.line.quantity} ถุง · ไม่สามารถสั่งซื้อได้
                  </p>
                </div>
                <RemoveButton
                  productId={row.line.productId}
                  name="สินค้าที่หยุดขายแล้ว"
                />
              </li>
            ),
          )}
        </ul>

        <Link
          href="/products"
          className="inline-flex min-h-12 items-center rounded-full px-1 font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          + เลือกสินค้าเพิ่ม
        </Link>
      </div>

      <aside
        aria-labelledby={SUMMARY_HEADING_ID}
        className="space-y-4 rounded-2xl border border-sky-100 bg-sky-50 p-5 lg:sticky lg:top-24"
      >
        <h2
          id={SUMMARY_HEADING_ID}
          tabIndex={-1}
          className="text-lg font-bold text-blue-950 focus:outline-none"
        >
          สรุปยอด
        </h2>
        <FreeShippingHint
          remaining={totals.remainingForFreeShipping}
          minQty={settings.freeShippingMinQty}
        />
        <OrderTotals {...totals} />
        {unavailableCount > 0 || available.length === 0 ? (
          <p className="text-sm font-medium text-amber-800">
            ลบสินค้าที่หยุดขายออกก่อน จึงจะไปหน้าสั่งซื้อได้
          </p>
        ) : (
          <Link href="/checkout" className={primaryButton}>
            ไปหน้าสั่งซื้อ
          </Link>
        )}
      </aside>
    </div>
  );
}

function RemoveButton({ productId, name }: { productId: string; name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        removeFromCart(productId);
        // ปุ่มที่กดหายไปพร้อมรายการ ย้ายโฟกัสไปที่สรุปยอด ผู้ใช้คีย์บอร์ดจะได้ไม่หลงตำแหน่ง
        requestAnimationFrame(() =>
          document.getElementById(SUMMARY_HEADING_ID)?.focus(),
        );
      }}
      aria-label={`ลบ ${name} ออกจากตะกร้า`}
      className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <TrashIcon className="size-5" />
    </button>
  );
}

function EmptyCart() {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-2xl border border-sky-100 bg-sky-50 px-4 py-14 text-center"
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-white text-sky-500">
        <CartIcon className="size-8" />
      </span>
      <p className="mt-4 text-lg font-semibold text-blue-950">ตะกร้ายังว่างอยู่</p>
      <p className="mt-1 text-slate-600">เลือกน้ำแข็งที่ต้องการแล้วกด “ใส่ตะกร้า”</p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        เลือกสินค้า
      </Link>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
      aria-busy="true"
      aria-label="กำลังโหลดตะกร้า"
    >
      <div className="space-y-3 rounded-2xl border border-sky-100 bg-white p-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex gap-3" aria-hidden="true">
            <div className="size-16 animate-pulse rounded-xl bg-sky-100" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 animate-pulse rounded bg-sky-100" />
              <div className="h-11 w-36 animate-pulse rounded-xl bg-sky-50" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-sky-50" aria-hidden="true" />
    </div>
  );
}
