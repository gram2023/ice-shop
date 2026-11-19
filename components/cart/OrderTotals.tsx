import { formatPrice } from "@/lib/format";

type Props = {
  totalQuantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

/** ยอดสินค้า / ค่าจัดส่ง / รวมทั้งหมด */
export default function OrderTotals({
  totalQuantity,
  subtotal,
  deliveryFee,
  total,
}: Props) {
  return (
    <dl className="space-y-2 text-base">
      <div className="flex justify-between gap-4">
        <dt className="text-slate-600">ยอดสินค้า ({totalQuantity} ถุง)</dt>
        <dd className="font-semibold text-slate-800">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-slate-600">ค่าจัดส่ง</dt>
        <dd
          className={
            deliveryFee === 0
              ? "font-semibold text-green-700"
              : "font-semibold text-slate-800"
          }
        >
          {deliveryFee === 0 ? "ส่งฟรี" : formatPrice(deliveryFee)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-stone-300 pt-3 text-lg font-bold text-forest-900">
        <dt>รวมทั้งหมด</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

/** ข้อความ "สั่งเพิ่มอีก N ถุง ส่งฟรี" (ไม่แสดงถ้าร้านไม่มีโปรส่งฟรี) */
export function FreeShippingHint({
  remaining,
  minQty,
}: {
  remaining: number | null;
  minQty: number;
}) {
  if (remaining === null) return null;
  if (remaining <= 0) {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
        ✓ ได้รับสิทธิ์ส่งฟรี (สั่งครบ {minQty} ถุง)
      </p>
    );
  }
  return (
    <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
      สั่งเพิ่มอีก <strong className="text-forest-700">{remaining} ถุง</strong>{" "}
      ส่งฟรี!
    </p>
  );
}
