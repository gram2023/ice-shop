"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartItemCount, useCartLines } from "@/lib/cart-store";
import { shopConfig } from "@/lib/shop-config";
import { CartIcon, CloseIcon, IceIcon, MenuIcon } from "./icons";

const menuItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/products", label: "สินค้า" },
  { href: "/cart", label: "ตะกร้า" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function formatCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

/** ตัวเลขจำนวนถุงในตะกร้า ต่อท้ายเมนู "ตะกร้า" */
function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
      {formatCount(count)}
      <span className="sr-only"> ถุงในตะกร้า</span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cartCount = cartItemCount(useCartLines());

  // ปิดเมนูมือถือเมื่อกดปุ่ม Esc
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <nav
        aria-label="เมนูหลัก"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        {/* โลโก้ + ชื่อร้าน */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <IceIcon className="size-6" />
          </span>
          <span className="text-lg font-bold text-blue-900">
            {shopConfig.name}
          </span>
        </Link>

        {/* เมนูจอใหญ่ */}
        <ul className="hidden items-center gap-1 md:flex">
          {menuItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    active
                      ? "bg-sky-100 text-blue-700"
                      : "text-slate-600 hover:bg-sky-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                  {item.href === "/cart" && <CartBadge count={cartCount} />}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* มือถือ: ปุ่มตะกร้า + ปุ่มเปิด-ปิดเมนู */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            aria-label={
              cartCount > 0 ? `ตะกร้า มีสินค้า ${cartCount} ถุง` : "ตะกร้า"
            }
            className="relative grid size-12 place-items-center rounded-xl text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CartIcon className="size-7" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white"
              >
                {formatCount(cartCount)}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            className="grid size-12 place-items-center rounded-xl text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {open ? (
              <CloseIcon className="size-7" />
            ) : (
              <MenuIcon className="size-7" />
            )}
          </button>
        </div>
      </nav>

      {/* เมนูมือถือ (แบบพับ) */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-sky-100 bg-white md:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {menuItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-xl px-4 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    active
                      ? "bg-sky-100 text-blue-700"
                      : "text-slate-700 hover:bg-sky-50"
                  }`}
                >
                  {item.label}
                  {item.href === "/cart" && <CartBadge count={cartCount} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
