import Form from "next/form";
import Link from "next/link";
import type { AdminOrderListItem } from "@/lib/admin/orders";
import { formatPhone, formatShortDateTime } from "@/lib/admin/format";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-rules";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import { PaymentBadge, StatusBadge } from "./StatusBadge";

/** ช่องค้นหาเลขออเดอร์ / เบอร์โทร (ส่งเป็น ?q= ในลิงก์) */
export function OrderSearch({ defaultValue }: { defaultValue: string }) {
  return (
    <Form action="/admin" role="search" className="flex gap-2">
      <label htmlFor="order-search" className="sr-only">
        ค้นหาออเดอร์
      </label>
      <input
        id="order-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={50}
        placeholder="ค้นหาเลขออเดอร์ หรือเบอร์โทร"
        className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base placeholder:text-slate-400 focus:outline-2 focus:outline-blue-500"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-xl bg-slate-800 px-4 font-semibold text-white hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
      >
        ค้นหา
      </button>
    </Form>
  );
}

/** แท็บสถานะพร้อมจำนวนออเดอร์ (เลื่อนซ้าย-ขวาได้บนมือถือ) */
export function OrderTabs({
  active,
  counts,
}: {
  active: OrderStatus;
  counts: Record<OrderStatus, number> | null;
}) {
  return (
    <nav aria-label="สถานะออเดอร์" className="-mx-4 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2 whitespace-nowrap">
        {ORDER_STATUSES.map((status) => {
          const isActive = status === active;
          const count = counts?.[status];
          const highlight = status === "pending" && (count ?? 0) > 0;
          return (
            <li key={status}>
              <Link
                href={`/admin?status=${status}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {STATUS_LABELS[status]}
                {count !== undefined && (
                  <span
                    className={`min-w-6 rounded-full px-1.5 text-center text-xs ${
                      isActive
                        ? "bg-white/20"
                        : highlight
                          ? "bg-amber-500 text-white"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function OrderListCard({ order }: { order: AdminOrderListItem }) {
  return (
    <li>
      <Link
        href={`/admin/orders/${order.id}`}
        className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold tracking-wide text-blue-950">{order.orderNo}</span>
          <span className="flex flex-wrap gap-1.5">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </span>
        </div>
        <p className="mt-1.5 font-semibold text-slate-800">
          {order.customerName}{" "}
          <span className="font-normal text-slate-500">· {formatPhone(order.phone)}</span>
        </p>
        <p className="text-sm text-slate-600">ส่ง {formatShortDateTime(order.deliveryAt)}</p>
        <div className="mt-2 flex items-end justify-between gap-2 text-sm">
          <span className="text-slate-500">
            {order.totalQuantity} ถุง · {paymentMethodLabel(order.paymentMethod)}
          </span>
          <span className="text-base font-bold text-slate-900">{formatPrice(order.total)}</span>
        </div>
      </Link>
    </li>
  );
}

/** ลิงก์ก่อนหน้า / ถัดไป */
export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const linkClass =
    "inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
  return (
    <nav aria-label="เลือกหน้า" className="flex items-center justify-between gap-2">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={linkClass}>
          ← ก่อนหน้า
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-slate-600">
        หน้า {page} จาก {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={linkClass}>
          ถัดไป →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
