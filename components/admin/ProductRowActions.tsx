"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { AdminActionResult } from "@/app/admin/actions";
import { deleteProduct, moveProduct, setProductActive } from "@/app/admin/products/actions";

type Props = {
  id: string;
  name: string;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
};

const smallButton =
  "inline-flex h-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

/** ปุ่มของสินค้าแต่ละรายการ: เลื่อนขึ้น/ลง เปิด/ปิดขาย แก้ไข ลบ */
export default function ProductRowActions({ id, name, isActive, isFirst, isLast }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(task: () => Promise<AdminActionResult>) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run(() => moveProduct(id, "up"))}
          disabled={pending || isFirst}
          aria-label={`เลื่อน ${name} ขึ้น`}
          className={`${smallButton} w-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => run(() => moveProduct(id, "down"))}
          disabled={pending || isLast}
          aria-label={`เลื่อน ${name} ลง`}
          className={`${smallButton} w-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => run(() => setProductActive(id, isActive, !isActive))}
          disabled={pending}
          className={`${smallButton} ${
            isActive
              ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "border-green-600 bg-green-50 text-green-800 hover:bg-green-100"
          }`}
        >
          {isActive ? "ปิดขาย" : "เปิดขาย"}
        </button>
        <Link
          href={`/admin/products/${id}`}
          className={`${smallButton} border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100`}
        >
          แก้ไข
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`ลบ “${name}” ถาวร?\nลบแล้วกู้คืนไม่ได้ (ออเดอร์เก่าไม่หาย)`)) {
              run(() => deleteProduct(id));
            }
          }}
          disabled={pending}
          className={`${smallButton} border-red-300 bg-white text-red-700 hover:bg-red-50`}
        >
          ลบ
        </button>
      </div>
      {pending && <p className="text-sm text-slate-500">กำลังบันทึก…</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
