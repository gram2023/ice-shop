"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, useCartLines } from "@/lib/cart-store";
import { ORDER_LIMITS } from "@/lib/order-rules";
import QuantityStepper from "./QuantityStepper";

type Props = {
  productId: string;
  productName: string;
};

/** เลือกจำนวน + ปุ่ม "ใส่ตะกร้า" บนการ์ดสินค้า */
export default function AddToCart({ productId, productName }: Props) {
  const lines = useCartLines();
  const inCart = lines?.find((l) => l.productId === productId)?.quantity ?? 0;
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "added" | "full">("idle");

  // ข้อความ "เพิ่มแล้ว" แสดงชั่วคราว
  useEffect(() => {
    if (status !== "added") return;
    const id = window.setTimeout(() => setStatus("idle"), 2500);
    return () => window.clearTimeout(id);
  }, [status]);

  function handleAdd() {
    const result = addToCart(productId, quantity);
    if (result === "full") {
      setStatus("full");
      return;
    }
    setStatus("added");
    setQuantity(1);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={`จำนวน ${productName}`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`h-11 min-w-0 flex-1 rounded-xl px-3 text-base font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            status === "added"
              ? "bg-green-700 hover:bg-green-800"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {status === "added" ? "เพิ่มแล้ว ✓" : "ใส่ตะกร้า"}
        </button>
      </div>

      <p aria-live="polite" className="min-h-6 text-sm">
        {status === "full" ? (
          <span className="font-medium text-amber-800">
            ตะกร้าใส่สินค้าได้สูงสุด {ORDER_LIMITS.maxLines} รายการ
          </span>
        ) : inCart > 0 ? (
          <span className="text-slate-600">
            ในตะกร้า {inCart} ถุง ·{" "}
            <Link
              href="/cart"
              className="font-semibold text-blue-700 underline-offset-2 hover:underline"
            >
              ดูตะกร้า
            </Link>
          </span>
        ) : null}
      </p>
    </div>
  );
}
