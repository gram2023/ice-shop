"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/settings", label: "ค่าส่ง/ชำระเงิน" },
  { href: "/admin/settings/shop", label: "ข้อมูลร้าน" },
  { href: "/admin/settings/hours", label: "เวลาเปิด-ปิด" },
  { href: "/admin/settings/map", label: "แผนที่" },
];

/** แท็บหมวดการตั้งค่าร้าน (มือถือเลื่อนซ้าย-ขวาได้) */
export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="หมวดการตั้งค่า" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2 pb-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
