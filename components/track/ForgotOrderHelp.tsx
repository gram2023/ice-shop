"use client";

import { telHref } from "@/lib/shop-profile";
import { ChatIcon, PhoneIcon } from "../icons";
import { useShopProfile } from "../ShopProfileProvider";

/** ทางออกสำหรับลูกค้าที่ลืมเลขออเดอร์: ติดต่อร้าน แอดมินค้นด้วยเบอร์โทรในหน้าแอดมินได้ */
export default function ForgotOrderHelp() {
  const shop = useShopProfile();
  const hasLine = Boolean(shop.lineId && shop.lineUrl);

  return (
    <div className="border-t border-stone-200 pt-4">
      <p className="font-semibold text-forest-900">ลืมเลขออเดอร์?</p>
      <p className="text-sm text-slate-600">
        {hasLine ? "โทรหรือทัก LINE ร้าน" : "โทรหาร้าน"} แจ้งเบอร์โทรที่ใช้สั่งซื้อ ร้านจะเช็คสถานะให้
      </p>
      <div className={`mt-3 grid gap-2 ${hasLine ? "sm:grid-cols-2" : ""}`}>
        <a
          href={telHref(shop.phone)}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 font-semibold text-forest-900 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
        >
          <PhoneIcon className="size-5" />
          โทร {shop.phone}
        </a>
        {hasLine && (
          <a
            href={shop.lineUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <ChatIcon className="size-5" />
            LINE {shop.lineId}
          </a>
        )}
      </div>
    </div>
  );
}
