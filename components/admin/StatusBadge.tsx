import {
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";

/** ป้ายสถานะ ใช้ทั้งสีและข้อความ (ไม่สื่อด้วยสีอย่างเดียว) */
const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900 ring-amber-300",
  accepted: "bg-sky-100 text-sky-900 ring-sky-300",
  preparing: "bg-blue-100 text-blue-900 ring-blue-300",
  delivering: "bg-indigo-100 text-indigo-900 ring-indigo-300",
  delivered: "bg-green-100 text-green-900 ring-green-300",
  cancelled: "bg-slate-200 text-slate-700 ring-slate-300",
};

const badgeBase =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${badgeBase} ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`${badgeBase} ${
        status === "paid"
          ? "bg-green-50 text-green-800 ring-green-300"
          : "bg-red-50 text-red-800 ring-red-200"
      }`}
    >
      {status === "paid" ? "✓ " : ""}
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
