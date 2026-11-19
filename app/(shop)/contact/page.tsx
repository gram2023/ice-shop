import type { Metadata } from "next";
import ContactButtons from "@/components/ContactButtons";
import { ChevronDownIcon } from "@/components/icons";
import PageHeader from "@/components/PageHeader";
import ShopInfoCards from "@/components/ShopInfoCards";
import ShopMap from "@/components/ShopMap";
import { getShopProfile } from "@/lib/shop-profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShopProfile();
  return {
    title: "ติดต่อเรา",
    description: `ช่องทางติดต่อ ที่อยู่ แผนที่ และเวลาเปิด-ปิดของร้าน ${shop.name}`,
  };
}

export default async function ContactPage() {
  const shop = await getShopProfile();

  return (
    <>
      <PageHeader title="ติดต่อเรา" description="สอบถามหรือสั่งซื้อน้ำแข็งได้ทุกช่องทาง" />

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-6 pb-16 sm:px-6">
        {/* ข้อมูลร้าน + ปุ่มติดต่อ */}
        <section aria-labelledby="shop-name" className="space-y-3">
          <h2 id="shop-name" className="font-display text-2xl text-forest-800 uppercase sm:text-3xl">
            {shop.name}
          </h2>
          <ContactButtons />
          <ShopInfoCards />
        </section>

        {/* แผนที่ */}
        <section aria-labelledby="map-heading" className="reveal space-y-4">
          <h2 id="map-heading" className="font-display text-2xl text-forest-800 uppercase sm:text-3xl">
            แผนที่ร้าน
          </h2>
          <ShopMap headingId="map-heading" />
        </section>

        {/* คำถามที่พบบ่อย */}
        <section aria-labelledby="faq-heading" className="reveal">
          <h2 id="faq-heading" className="font-display text-2xl text-forest-800 uppercase sm:text-3xl">
            คำถามที่พบบ่อย
          </h2>
          <div className="mt-4 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
            {shop.faq.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-forest-900 hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-600 sm:text-lg">
                  <span>{item.question}</span>
                  <ChevronDownIcon className="size-5 shrink-0 text-forest-600 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed whitespace-pre-line text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
