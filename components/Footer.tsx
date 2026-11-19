import Image from "next/image";
import Link from "next/link";
import { formatOpeningTime } from "@/lib/opening-hours";
import { telHref } from "@/lib/shop-profile";
import { getShopProfile } from "@/lib/shop-profile-server";
import { CartIcon, ChatIcon, ClockIcon, IceIcon, PhoneIcon } from "./icons";

export default async function Footer() {
  const shop = await getShopProfile();

  return (
    <footer className="mt-auto bg-forest-950 text-forest-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            {shop.logoUrl ? (
              <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image src={shop.logoUrl} alt="" fill sizes="36px" className="object-contain" />
              </span>
            ) : (
              <IceIcon className="size-7 text-sun-400" />
            )}
            <p className="font-display text-xl text-white uppercase">{shop.name}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-forest-200">{shop.tagline}</p>
        </div>

        <ul className="space-y-3 text-base">
          <li>
            <a
              href={telHref(shop.phone)}
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <PhoneIcon className="size-5 shrink-0 text-sun-400" />
              <span>โทร {shop.phone}</span>
            </a>
          </li>
          {shop.lineId && shop.lineUrl && (
            <li>
              <a
                href={shop.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white hover:underline"
              >
                <ChatIcon className="size-5 shrink-0 text-sun-400" />
                <span>LINE: {shop.lineId}</span>
              </a>
            </li>
          )}
          <li>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <CartIcon className="size-5 shrink-0 text-sun-400" />
              <span>ติดตามออเดอร์</span>
            </Link>
          </li>
        </ul>

        <div className="flex gap-2">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-sun-400" />
          <div>
            <p className="font-display text-white">เวลาเปิด-ปิด</p>
            <ul className="mt-1 space-y-1 text-sm">
              {shop.openingHours.map((h) => (
                <li key={`${h.label}-${h.open}`}>
                  {h.label}: {formatOpeningTime(h)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-2 border-t border-white/10 px-4 py-3 text-center text-xs text-forest-200/80">
        <span>© {shop.name} สงวนลิขสิทธิ์</span>
        <span aria-hidden="true">·</span>
        {/* ทางเข้าหน้าแอดมิน (บนคอมไม่มีเมนูแฮมเบอร์เกอร์) · ไม่โหลดล่วงหน้า */}
        <Link
          href="/admin/login"
          prefetch={false}
          className="inline-flex min-h-8 items-center rounded px-1 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-400"
        >
          สำหรับแอดมิน
        </Link>
      </div>
    </footer>
  );
}
