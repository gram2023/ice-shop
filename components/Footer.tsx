import Link from "next/link";
import { formatOpeningTime } from "@/lib/opening-hours";
import { telHref } from "@/lib/shop-profile";
import { getShopProfile } from "@/lib/shop-profile-server";
import { CartIcon, ChatIcon, ClockIcon, IceIcon, PhoneIcon } from "./icons";

export default async function Footer() {
  const shop = await getShopProfile();

  return (
    <footer className="mt-auto bg-blue-950 text-sky-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <IceIcon className="size-7 text-sky-300" />
            <p className="text-xl font-bold text-white">{shop.name}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-sky-200/80">{shop.tagline}</p>
        </div>

        <ul className="space-y-3 text-base">
          <li>
            <a
              href={telHref(shop.phone)}
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <PhoneIcon className="size-5 shrink-0 text-sky-300" />
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
                <ChatIcon className="size-5 shrink-0 text-sky-300" />
                <span>LINE: {shop.lineId}</span>
              </a>
            </li>
          )}
          <li>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <CartIcon className="size-5 shrink-0 text-sky-300" />
              <span>ติดตามออเดอร์</span>
            </Link>
          </li>
        </ul>

        <div className="flex gap-2">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-sky-300" />
          <div>
            <p className="font-semibold text-white">เวลาเปิด-ปิด</p>
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

      <div className="border-t border-white/10 py-4 text-center text-xs text-sky-200/70">
        © {shop.name} สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
