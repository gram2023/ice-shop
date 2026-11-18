"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartItemCount, useCartLines } from "@/lib/cart-store";
import { ArrowRightIcon, CartIcon, CloseIcon, IceIcon, MenuIcon } from "./icons";
import { useShopProfile } from "./ShopProfileProvider";

const menuItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/products", label: "สินค้า" },
  { href: "/cart", label: "ตะกร้า" },
  { href: "/track", label: "ติดตามออเดอร์" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

/** ขอบโฟกัสบนพื้นเขียว (ใช้สีเหลืองให้เห็นชัด) */
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-400";

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
    <span className="ml-1.5 inline-grid h-6 min-w-6 place-items-center rounded-full bg-sun-400 px-1.5 text-xs font-bold text-forest-950">
      {formatCount(count)}
      <span className="sr-only"> ถุงในตะกร้า</span>
    </span>
  );
}

export default function Navbar() {
  const shop = useShopProfile();
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-700 text-white">
      <nav
        aria-label="เมนูหลัก"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        {/* โลโก้ + ชื่อร้าน */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className={`flex min-w-0 items-center gap-2 rounded-lg ${focusRing}`}
        >
          {shop.logoUrl ? (
            <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-white/30">
              <Image src={shop.logoUrl} alt="" fill sizes="40px" className="object-contain" />
            </span>
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sun-400 text-forest-900">
              <IceIcon className="size-6" />
            </span>
          )}
          <span className="max-w-[45vw] truncate font-display text-xl uppercase sm:max-w-none">
            {shop.name}
          </span>
        </Link>

        {/* เมนูจอใหญ่ */}
        <div className="hidden items-center gap-3 md:flex">
          <ul className="flex items-center gap-1">
            {menuItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center rounded-lg px-3 py-2 text-base font-medium transition-colors ${focusRing} ${
                      active ? "text-sun-400" : "text-forest-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {item.href === "/cart" && <CartBadge count={cartCount} />}
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* ปุ่มสั่งซื้อ (เฉพาะจอกว้าง เมนูจะได้ไม่แน่นเกิน) */}
          <Link
            href="/products"
            className={`hidden h-11 items-center gap-1.5 rounded-lg bg-sun-400 px-5 font-display text-forest-950 transition-colors hover:bg-sun-300 lg:inline-flex ${focusRing}`}
          >
            สั่งซื้อเลย
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        {/* มือถือ: ปุ่มตะกร้า + ปุ่มเปิด-ปิดเมนู */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            aria-label={
              cartCount > 0 ? `ตะกร้า มีสินค้า ${cartCount} ถุง` : "ตะกร้า"
            }
            className={`relative grid size-12 place-items-center rounded-lg hover:bg-white/10 ${focusRing}`}
          >
            <CartIcon className="size-7" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun-400 px-1 text-[11px] font-bold text-forest-950"
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
            className={`grid size-12 place-items-center rounded-lg hover:bg-white/10 ${focusRing}`}
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
        className="border-t border-white/10 bg-forest-800 md:hidden"
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
                  className={`flex min-h-12 items-center rounded-lg px-4 text-lg font-medium ${focusRing} ${
                    active ? "bg-white/10 text-sun-400" : "text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {item.href === "/cart" && <CartBadge count={cartCount} />}
                </Link>
              </li>
            );
          })}
          {/* สำหรับเจ้าของร้าน: แยกจากเมนูลูกค้าด้วยเส้นคั่น · ไม่โหลดล่วงหน้า (ไม่ยิงตรวจสิทธิ์โดยไม่จำเป็น) */}
          <li className="mt-2 border-t border-white/10 pt-3">
            <Link
              href="/admin/login"
              prefetch={false}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center rounded-lg px-4 text-base font-medium text-forest-200 hover:bg-white/5 hover:text-white ${focusRing}`}
            >
              เข้าสู่ระบบแอดมิน
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
