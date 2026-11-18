import { phoneHref, shopConfig } from "@/lib/shop-config";
import { ChatIcon, PhoneIcon } from "../icons";

/** ทางออกสำหรับลูกค้าที่ลืมเลขออเดอร์: ติดต่อร้าน แอดมินค้นด้วยเบอร์โทรในหน้าแอดมินได้ */
export default function ForgotOrderHelp() {
  return (
    <div className="border-t border-sky-100 pt-4">
      <p className="font-semibold text-blue-950">ลืมเลขออเดอร์?</p>
      <p className="text-sm text-slate-600">
        โทรหรือทัก LINE ร้าน แจ้งเบอร์โทรที่ใช้สั่งซื้อ ร้านจะเช็คสถานะให้
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          href={phoneHref()}
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-4 font-semibold text-blue-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PhoneIcon className="size-5" />
          โทร {shopConfig.phone}
        </a>
        <a
          href={shopConfig.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-green-700 px-4 font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <ChatIcon className="size-5" />
          LINE {shopConfig.lineId}
        </a>
      </div>
    </div>
  );
}
