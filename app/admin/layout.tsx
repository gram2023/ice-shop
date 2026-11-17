import type { Metadata } from "next";
import type { ReactNode } from "react";
import { shopConfig } from "@/lib/shop-config";

export const metadata: Metadata = {
  title: {
    default: "แอดมิน",
    template: `%s | แอดมิน ${shopConfig.name}`,
  },
  // หน้าแอดมินมีข้อมูลลูกค้า ห้ามให้เว็บค้นหาเก็บ
  robots: { index: false, follow: false },
};

/** layout ของหน้าแอดมิน (ไม่มีเมนู/ส่วนท้ายของหน้าลูกค้า) */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col bg-slate-50">{children}</div>;
}
