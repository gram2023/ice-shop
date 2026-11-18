import { telHref } from "@/lib/shop-profile";
import { getShopProfile } from "@/lib/shop-profile-server";
import { ChatIcon, FacebookIcon, PhoneIcon } from "./icons";

const baseButton =
  "flex min-h-14 items-center gap-3 rounded-2xl px-5 py-3 text-left font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/** ปุ่มติดต่อร้านขนาดใหญ่: โทร / LINE / Facebook (ช่องไหนแอดมินไม่ได้ใส่ จะไม่แสดง) */
export default async function ContactButtons() {
  const shop = await getShopProfile();
  const hasLine = Boolean(shop.lineId && shop.lineUrl);
  const hasFacebook = Boolean(shop.facebookUrl);
  const columns = 1 + Number(hasLine) + Number(hasFacebook);

  return (
    <div className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : ""}`}>
      <a
        href={telHref(shop.phone)}
        className={`${baseButton} bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600`}
      >
        <PhoneIcon className="size-7 shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-normal">กดโทรเลย</span>
          <span className="text-lg">{shop.phone}</span>
        </span>
      </a>

      {hasLine && (
        <a
          href={shop.lineUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseButton} bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-700`}
        >
          <ChatIcon className="size-7 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-normal">แชตผ่าน LINE</span>
            <span className="text-lg">{shop.lineId}</span>
          </span>
        </a>
      )}

      {hasFacebook && (
        <a
          href={shop.facebookUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseButton} border border-sky-200 bg-white text-blue-900 hover:bg-sky-50 focus-visible:outline-blue-600`}
        >
          <FacebookIcon className="size-7 shrink-0 text-[#1877F2]" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-normal text-slate-500">เพจ Facebook</span>
            <span className="text-lg">{shop.facebookName ?? shop.name}</span>
          </span>
        </a>
      )}
    </div>
  );
}
