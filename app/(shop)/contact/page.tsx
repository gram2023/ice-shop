import type { Metadata } from "next";
import ContactButtons from "@/components/ContactButtons";
import { ChevronDownIcon } from "@/components/icons";
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
      <div className="bg-linear-to-b from-sky-100 to-white">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6 md:pt-14">
          <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">ติดต่อเรา</h1>
          <p className="mt-2 text-lg text-slate-600">สอบถามหรือสั่งซื้อน้ำแข็งได้ทุกช่องทาง</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-16 sm:px-6">
        {/* ข้อมูลร้าน + ปุ่มติดต่อ */}
        <section aria-labelledby="shop-name" className="space-y-3">
          <h2 id="shop-name" className="text-2xl font-bold text-blue-950">
            {shop.name}
          </h2>
          <ContactButtons />
          <ShopInfoCards />
        </section>

        {/* แผนที่ */}
        <section aria-labelledby="map-heading" className="space-y-4">
          <h2 id="map-heading" className="text-2xl font-bold text-blue-950">
            แผนที่ร้าน
          </h2>
          <ShopMap headingId="map-heading" />
        </section>

        {/* คำถามที่พบบ่อย */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-blue-950">
            คำถามที่พบบ่อย
          </h2>
          <div className="mt-4 divide-y divide-sky-100 overflow-hidden rounded-2xl border border-sky-100 bg-white">
            {shop.faq.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-blue-950 hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 sm:text-lg">
                  <span>{item.question}</span>
                  <ChevronDownIcon className="size-5 shrink-0 text-blue-600 transition-transform group-open:rotate-180" />
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
