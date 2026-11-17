"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/admin",
    label: "ออเดอร์",
    match: (p: string) => p === "/admin" || p.startsWith("/admin/orders"),
  },
  { href: "/admin/products", label: "สินค้า", match: (p: string) => p.startsWith("/admin/products") },
  { href: "/admin/settings", label: "ตั้งค่าร้าน", match: (p: string) => p.startsWith("/admin/settings") },
];

/** เมนูหลักของหน้าแอดมิน */
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="เมนูแอดมิน" className="mx-auto max-w-5xl px-4">
      <ul className="flex gap-1">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-11 items-center border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
