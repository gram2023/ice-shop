"use client";

import { forgetOrder, useRecentOrders } from "@/lib/recent-orders-store";

type Props = {
  /** เลขออเดอร์ที่อยู่ในช่องตอนนี้ (ใช้ไฮไลต์ปุ่มที่ถูกเลือก) */
  selectedOrderNo: string;
  onPick: (orderNo: string) => void;
};

/** "ออเดอร์ล่าสุดในเครื่องนี้" กดเลือกเพื่อเติมเลขออเดอร์ / กด × เพื่อลบออกจากเครื่อง */
export default function RecentOrderList({ selectedOrderNo, onPick }: Props) {
  const recentOrders = useRecentOrders();
  if (!recentOrders || recentOrders.length === 0) return null;

  const current = selectedOrderNo.trim().toUpperCase();

  return (
    <div className="rounded-xl bg-stone-100 p-4">
      <p id="recent-orders-label" className="font-semibold text-forest-900">
        ออเดอร์ล่าสุดในเครื่องนี้
      </p>
      <p className="text-xs text-slate-500">
        กดเลือก แล้วกรอกเบอร์โทร · เก็บเฉพาะเลขออเดอร์ไว้ในเครื่องนี้ 30 วัน
      </p>
      <ul aria-labelledby="recent-orders-label" className="mt-2 flex flex-wrap gap-2">
        {recentOrders.map((recent) => {
          const selected = current === recent.orderNo;
          return (
            <li
              key={recent.orderNo}
              className={`flex items-center overflow-hidden rounded-full border ${
                selected
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-stone-300 bg-white text-forest-900"
              }`}
            >
              <button
                type="button"
                onClick={() => onPick(recent.orderNo)}
                aria-pressed={selected}
                className="h-10 pr-1 pl-4 text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-600"
              >
                {recent.orderNo}
              </button>
              <button
                type="button"
                onClick={() => forgetOrder(recent.orderNo)}
                aria-label={`ลบ ${recent.orderNo} ออกจากรายการในเครื่องนี้`}
                className={`grid size-10 place-items-center text-lg leading-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-600 ${
                  selected ? "text-forest-100 hover:text-white" : "text-slate-400 hover:text-red-600"
                }`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
