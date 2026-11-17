"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { checkNewOrders } from "@/app/admin/actions";

const POLL_MS = 30 * 1000;

/**
 * เช็คออเดอร์ใหม่ทุก 30 วินาที
 * มีออเดอร์ใหม่ → แสดงแถบแจ้งเตือน + ตัวเลขหน้าชื่อแท็บเบราว์เซอร์ เช่น "(2) ออเดอร์ | แอดมิน"
 * since = เวลาของออเดอร์ล่าสุดตอนโหลดหน้า (กดโหลดใหม่แล้วค่านี้จะเปลี่ยน และตัวนับเริ่มใหม่)
 */
export default function NewOrderWatcher({ since }: { since: string }) {
  const router = useRouter();
  const [found, setFound] = useState({ since, count: 0 });
  const count = found.since === since ? found.count : 0;
  const [refreshing, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const id = window.setInterval(async () => {
      try {
        const result = await checkNewOrders(since);
        if (active && result.ok) setFound({ since, count: result.count });
      } catch {
        // เน็ตหลุดชั่วคราว ลองใหม่รอบถัดไป
      }
    }, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [since]);

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = count > 0 ? `(${count}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [count]);

  if (count === 0) return null;

  return (
    <div role="status" className="border-t border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="font-semibold text-amber-900">
          🔔 มีออเดอร์ใหม่ {count} รายการ
        </p>
        <button
          type="button"
          onClick={() => startTransition(() => router.refresh())}
          disabled={refreshing}
          className="h-10 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-70"
        >
          {refreshing ? "กำลังโหลด…" : "โหลดรายการใหม่"}
        </button>
      </div>
    </div>
  );
}
