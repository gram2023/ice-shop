"use client";

import { useState } from "react";
import { clampQuantity } from "@/lib/cart";
import { ORDER_LIMITS } from "@/lib/order-rules";
import { MinusIcon, PlusIcon } from "../icons";

type Props = {
  value: number;
  onChange: (value: number) => void;
  /** ชื่อกลุ่มปุ่มสำหรับโปรแกรมอ่านหน้าจอ เช่น "จำนวน น้ำแข็งถุงเล็ก" */
  label: string;
};

const buttonClass =
  "grid size-11 place-items-center text-forest-700 transition-colors hover:bg-forest-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

/** ปุ่ม − [จำนวน] + สำหรับเลือกจำนวนถุง */
export default function QuantityStepper({ value, onChange, label }: Props) {
  // ข้อความที่กำลังพิมพ์ (ให้ลบจนช่องว่างได้ระหว่างพิมพ์)
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-stone-300 bg-white"
    >
      <button
        type="button"
        onClick={() => onChange(clampQuantity(value - 1))}
        disabled={value <= 1}
        aria-label="ลดจำนวน"
        className={buttonClass}
      >
        <MinusIcon className="size-5" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="จำนวนถุง"
        value={draft ?? String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
          setDraft(digits);
          if (digits) onChange(clampQuantity(Number(digits)));
        }}
        onBlur={() => setDraft(null)}
        className="h-11 w-14 border-x border-stone-300 text-center text-lg font-semibold text-slate-900 focus:outline-2 focus:-outline-offset-2 focus:outline-forest-600"
      />
      <button
        type="button"
        onClick={() => onChange(clampQuantity(value + 1))}
        disabled={value >= ORDER_LIMITS.maxQuantity}
        aria-label="เพิ่มจำนวน"
        className={buttonClass}
      >
        <PlusIcon className="size-5" />
      </button>
    </div>
  );
}
