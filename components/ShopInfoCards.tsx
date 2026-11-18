import { formatOpeningTime } from "@/lib/opening-hours";
import { getShopProfile } from "@/lib/shop-profile-server";
import { ClockIcon, MapPinIcon } from "./icons";

/** การ์ดที่อยู่ร้าน (พร้อมลิงก์นำทาง) + เวลาเปิด-ปิด */
export default async function ShopInfoCards() {
  const shop = await getShopProfile();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
          <MapPinIcon className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-forest-800">ที่อยู่ร้าน</h3>
          <p className="mt-1 leading-relaxed text-slate-600">{shop.address}</p>
          <a
            href={shop.mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-forest-700 hover:underline"
          >
            นำทางด้วย Google Maps →
          </a>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
          <ClockIcon className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-forest-800">เวลาเปิด-ปิด</h3>
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
