"use client";

import Link from "next/link";
import { matchCart } from "@/lib/cart";
import { useCartLines, useLastOrder } from "@/lib/cart-store";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { calculateTotals, lineTotal } from "@/lib/order-rules";
import type { ShopSettings } from "@/lib/settings";
import OrderTotals, { FreeShippingHint } from "../cart/OrderTotals";
import { CartIcon } from "../icons";
import SectionMessage from "../SectionMessage";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";

type Props = {
  products: Product[];
  settings: ShopSettings;
};

export default function CheckoutView({ products, settings }: Props) {
  const lines = useCartLines();
  const lastOrder = useLastOrder();

  if (lines === null) return <CheckoutSkeleton />;

  // ตะกร้าว่าง: ถ้าเพิ่งสั่งซื้อสำเร็จในแท็บนี้ แสดงสรุปออเดอร์ ไม่งั้นแสดงหน้าตะกร้าว่าง
  if (lines.length === 0) {
    return lastOrder ? (
      <OrderSuccess order={lastOrder} payment={settings.payment} />
    ) : (
      <EmptyCheckout />
    );
  }

  const { available, unavailableCount } = matchCart(lines, products);
  if (unavailableCount > 0) {
    return (
      <div className="space-y-4">
        <SectionMessage variant="error">
          สินค้าบางรายการในตะกร้าหยุดขายแล้ว กรุณาลบออกก่อนสั่งซื้อ
        </SectionMessage>
        <Link
          href="/cart"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-ember-600 px-8 font-display text-white hover:bg-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
        >
          กลับไปแก้ตะกร้า
        </Link>
      </div>
    );
  }

  const totals = calculateTotals(
    available.map((r) => ({ price: r.product.price, quantity: r.line.quantity })),
    settings.deliveryFee,
    settings.freeShippingMinQty,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      {/* สรุปรายการ: มือถืออยู่ด้านบน / จอใหญ่อยู่ด้านขวา */}
      <aside
        aria-labelledby="checkout-summary-heading"
        className="space-y-4 rounded-xl border border-stone-200 bg-stone-100 p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="checkout-summary-heading"
            className="font-display text-lg text-forest-800"
          >
            รายการสั่งซื้อ
          </h2>
          <Link
            href="/cart"
            className="text-sm font-semibold text-forest-700 underline-offset-2 hover:underline"
          >
            แก้ไขตะกร้า
          </Link>
        </div>
        <ul className="space-y-1">
          {available.map((r) => (
            <li key={r.line.productId} className="flex justify-between gap-3">
              <span className="text-slate-700">
                {r.product.name} × {r.line.quantity}
              </span>
              <span className="font-semibold text-slate-800">
                {formatPrice(lineTotal(r.product.price, r.line.quantity))}
              </span>
            </li>
          ))}
        </ul>
        <FreeShippingHint
          remaining={totals.remainingForFreeShipping}
          minQty={settings.freeShippingMinQty}
        />
        <OrderTotals {...totals} />
      </aside>

      <div className="lg:col-start-1 lg:row-start-1">
        <CheckoutForm
          lines={available.map((r) => r.line)}
          total={totals.total}
        />
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-xl border border-stone-200 bg-stone-100 px-4 py-14 text-center"
    >
      <span className="grid size-16 place-items-center rounded-xl bg-white text-forest-600">
        <CartIcon className="size-8" />
      </span>
      <p className="mt-4 text-lg font-semibold text-forest-900">ยังไม่มีสินค้าในตะกร้า</p>
      <p className="mt-1 text-slate-600">เลือกสินค้าก่อน แล้วค่อยกลับมาสั่งซื้อ</p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-ember-600 px-8 font-display text-white hover:bg-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
      >
        เลือกสินค้า
      </Link>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-[1fr_22rem]"
      aria-busy="true"
      aria-label="กำลังโหลดหน้าสั่งซื้อ"
    >
      <div className="space-y-4" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-xl bg-stone-100" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-stone-100" aria-hidden="true" />
    </div>
  );
}
