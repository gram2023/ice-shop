import { formatOpeningTime } from "@/lib/opening-hours";
import { getShopProfile } from "@/lib/shop-profile-server";
import { ClockIcon, MapPinIcon } from "./icons";

/** การ์ดที่อยู่ร้าน (พร้อมลิงก์นำทาง) + เวลาเปิด-ปิด */
export default async function ShopInfoCards() {
  const shop = await getShopProfile();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-2xl border border-sky-100 bg-white p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-blue-600">
          <MapPinIcon className="size-6" />
        </span>
        <div>
          <h3 className="font-bold text-blue-950">ที่อยู่ร้าน</h3>
          <p className="mt-1 leading-relaxed text-slate-600">{shop.address}</p>
          <a
            href={shop.mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-blue-700 hover:underline"
          >
            นำทางด้วย Google Maps →
          </a>
        </div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-sky-100 bg-white p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-blue-600">
          <ClockIcon className="size-6" />
        </span>
        <div>
          <h3 className="font-bold text-blue-950">เวลาเปิด-ปิด</h3>
          <dl className="mt-1 space-y-1 text-slate-600">
            {shop.openingHours.map((h) => (
              <div key={`${h.label}-${h.open}`} className="flex flex-wrap gap-x-2">
                <dt>{h.label}</dt>
                <dd className="font-semibold text-slate-800">{formatOpeningTime(h)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
