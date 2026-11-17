"use client";

import { useState, useTransition } from "react";
import { updatePaymentStatus } from "@/app/admin/actions";
import type { PaymentStatus } from "@/lib/order-status";

type Props = {
  orderId: string;
  status: PaymentStatus;
};

/** ปุ่มบันทึกว่าชำระเงินแล้ว / กดยกเลิกได้ถ้ากดพลาด */
export default function PaymentToggle({ orderId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const paid = status === "paid";

  function toggle() {
    if (pending) return;
    if (paid && !window.confirm("ยืนยันเปลี่ยนเป็น “ยังไม่ชำระ”?")) return;
    setError(null);
    startTransition(async () => {
      const result = await updatePaymentStatus(orderId, status, paid ? "unpaid" : "paid");
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          paid
            ? "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            : "h-12 w-full rounded-xl bg-green-700 px-4 font-bold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-60"
        }
      >
        {pending ? "กำลังบันทึก…" : paid ? "เปลี่ยนเป็น “ยังไม่ชำระ”" : "บันทึกว่าชำระเงินแล้ว"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
