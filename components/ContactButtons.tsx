import { phoneHref, shopConfig } from "@/lib/shop-config";
import { ChatIcon, FacebookIcon, PhoneIcon } from "./icons";

const baseButton =
  "flex min-h-14 items-center gap-3 rounded-2xl px-5 py-3 text-left font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/** ปุ่มติดต่อร้านขนาดใหญ่: โทร / LINE / Facebook */
export default function ContactButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        href={phoneHref()}
        className={`${baseButton} bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600`}
      >
        <PhoneIcon className="size-7 shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-normal">กดโทรเลย</span>
          <span className="text-lg">{shopConfig.phone}</span>
        </span>
      </a>

      <a
        href={shopConfig.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseButton} bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-700`}
      >
        <ChatIcon className="size-7 shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-normal">แชตผ่าน LINE</span>
          <span className="text-lg">{shopConfig.lineId}</span>
        </span>
      </a>

      <a
        href={shopConfig.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseButton} border border-sky-200 bg-white text-blue-900 hover:bg-sky-50 focus-visible:outline-blue-600`}
      >
        <FacebookIcon className="size-7 shrink-0 text-[#1877F2]" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-normal text-slate-500">
            เพจ Facebook
          </span>
          <span className="text-lg">{shopConfig.facebookName}</span>
        </span>
      </a>
    </div>
  );
}
