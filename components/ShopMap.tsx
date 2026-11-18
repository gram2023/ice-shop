import { getShopProfile } from "@/lib/shop-profile-server";
import { MapPinIcon } from "./icons";

/**
 * แผนที่ร้าน (ฝังจาก Google Maps) + ปุ่มนำทาง
 * ลิงก์ฝังผ่านการตรวจแล้วว่าเป็นของ Google Maps เท่านั้น (ทั้งตอนแอดมินบันทึกและในฐานข้อมูล)
 */
export default async function ShopMap({ headingId }: { headingId?: string }) {
  const shop = await getShopProfile();

  return (
    <div className="space-y-3">
      {shop.mapEmbedUrl && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
          <iframe
            src={shop.mapEmbedUrl}
            title={`แผนที่ร้าน ${shop.name}`}
            aria-describedby={headingId}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-4/3 w-full border-0 md:aspect-21/9"
          />
        </div>
      )}
      <a
        href={shop.mapLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-forest-200 bg-white px-6 font-semibold text-forest-800 hover:bg-forest-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600 sm:w-auto sm:inline-flex"
      >
        <MapPinIcon className="size-5" />
        นำทางด้วย Google Maps
      </a>
    </div>
  );
}
