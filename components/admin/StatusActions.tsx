"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteCancelledOrder,
  updateOrderStatus,
  type AdminActionResult,
} from "@/app/admin/actions";
import { getStatusActions, type OrderStatus, type StatusAction } from "@/lib/order-status";

type Props = {
  orderId: string;
  status: OrderStatus;
};

/** ปุ่มเปลี่ยนสถานะ: ปุ่มหลัก (ขั้นถัดไป/กู้คืน) + ย้อนกลับ 1 ขั้น + ยกเลิก */
export default function StatusActions({ orderId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<Extract<AdminActionResult, { ok: false }> | null>(null);

  const actions = getStatusActions(status);
  const primary = actions.find((a) => a.kind === "next" || a.kind === "restore");
  const back = actions.find((a) => a.kind === "back");
  const cancel = actions.find((a) => a.kind === "cancel");

  function run(action: StatusAction) {
    if (pending) return;
    if (action.kind === "cancel" && !window.confirm("ยืนยันยกเลิกออเดอร์นี้?")) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status, action.to);
      if (!result.ok) setError(result);
    });
  }

  /** ลบถาวร (เฉพาะออเดอร์ที่ยกเลิกแล้ว) — สำเร็จแล้ว server พาไปหน้ารายการเอง */
  function remove() {
    if (pending) return;
    if (!window.confirm("ลบออเดอร์นี้ถาวร?\nลบแล้วกู้คืนไม่ได้ ข้อมูลลูกค้าและรายการสินค้าจะหายไปด้วย")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCancelledOrder(orderId);
      if (result && !result.ok) setError(result);
    });
  }

  return (
    <div className="space-y-3">
      {primary ? (
        <button
          type="button"
          onClick={() => run(primary)}
          disabled={pending}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-lg font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400"
        >
          {pending ? "กำลังบันทึก…" : primary.label}
        </button>
      ) : (
        <p className="rounded-xl bg-green-50 p-3 text-center font-semibold text-green-800">
          ✓ ออเดอร์นี้ส่งเรียบร้อยแล้ว
        </p>
      )}

      {(back || cancel) && (
        <div className="flex flex-wrap gap-2">
          {back && (
            <button
              type="button"
              onClick={() => run(back)}
              disabled={pending}
              className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            >
              {back.label}
            </button>
          )}
          {cancel && (
            <button
              type="button"
              onClick={() => run(cancel)}
              disabled={pending}
              className="h-11 flex-1 rounded-xl border border-red-300 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60"
            >
              {cancel.label}
            </button>
          )}
        </div>
      )}

      {status === "cancelled" && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="h-11 w-full rounded-xl border border-red-300 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60"
        >
          ลบออเดอร์นี้ถาวร
        </button>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <p className="font-medium">{error.message}</p>
          {error.conflict && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                startTransition(() => router.refresh());
              }}
              className="mt-1 font-semibold text-red-800 underline"
            >
              โหลดหน้าใหม่
            </button>
          )}
        </div>
      )}
    </div>
  );
}
