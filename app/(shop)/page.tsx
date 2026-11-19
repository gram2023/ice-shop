import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import ContactButtons from "@/components/ContactButtons";
import { StarBadge, TornEdge } from "@/components/decor";
import {
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  ClockIcon,
  IceIcon,
  TagIcon,
} from "@/components/icons";
import { ProductImagePlaceholder } from "@/components/ProductImage";
import ProductOrderList, { ProductOrderListSkeleton } from "@/components/ProductOrderList";
import PromoBanner, { PromoBannerSkeleton } from "@/components/PromoBanner";
import SectionHeading from "@/components/SectionHeading";
import ShopInfoCards from "@/components/ShopInfoCards";
import ShopMap from "@/components/ShopMap";
import { getShopProfile } from "@/lib/shop-profile-server";

/** จุดเด่นของระบบสั่งซื้อ (เป็นความจริงของเว็บนี้ทุกร้าน จึงไม่ต้องให้แอดมินแก้) */
const FEATURES = [
  { icon: CheckIcon, label: "ไม่ต้องสมัครสมาชิก" },
  { icon: ClockIcon, label: "เลือกวันเวลาส่งได้" },
  { icon: CartIcon, label: "ติดตามออเดอร์ได้" },
];

/** ไอคอนของการ์ดจุดเด่นร้าน (วนตามลำดับ) */
const HIGHLIGHT_ICONS = [IceIcon, ClockIcon, TagIcon];

const frameClass = "rounded-lg bg-white p-2 shadow-xl shadow-forest-950/30";

/**
 * ภาพในส่วนหัว: รูปที่แอดมินอัปโหลด (กรอบขาววางเอียง รูปที่ 2 ซ้อนมุมซ้ายล่าง)
 * ยังไม่มีรูป → กรอบลายน้ำแข็งตกแต่ง เฉพาะจอใหญ่ (มือถือไม่แสดง หน้าจะได้สั้น)
 */
function HeroVisual({ images, shopName }: { images: string[]; shopName: string }) {
  const [main, small] = images;
  if (main) {
    return (
      <div className={`rise-in relative mx-auto w-full max-w-sm md:max-w-md ${small ? "pb-12 sm:pb-16" : ""}`}>
        <div className={`${frameClass} rotate-3`}>
          <div className="relative aspect-4/3 overflow-hidden rounded-md bg-forest-100">
            <Image
              src={main}
              alt={`ร้าน ${shopName}`}
              fill
              priority
              sizes="(min-width: 768px) 448px, 90vw"
              className="object-cover"
            />
          </div>
        </div>
        {small && (
          <div className={`${frameClass} absolute bottom-0 -left-1 w-2/5 -rotate-6 sm:-left-6`}>
            <div className="relative aspect-square overflow-hidden rounded-md bg-forest-100">
              <Image src={small} alt="" fill sizes="(min-width: 768px) 180px, 40vw" className="object-cover" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="rise-in relative hidden h-80 md:block lg:h-96">
      <div className={`${frameClass} absolute top-0 right-4 w-60 rotate-6 lg:w-72`}>
        <div className="relative aspect-4/5 overflow-hidden rounded-md">
          <ProductImagePlaceholder />
        </div>
      </div>
      <div className={`${frameClass} absolute bottom-0 left-6 w-44 -rotate-6 lg:w-52`}>
        <div className="relative aspect-square overflow-hidden rounded-md">
          <ProductImagePlaceholder />
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const shop = await getShopProfile();

  return (
    <>
      {/* ส่วนหัว (Hero) */}
      <section className="relative overflow-hidden bg-forest-700 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-2 md:pt-16 md:pb-24">
          <div>
            <h1 className="font-display text-4xl leading-tight uppercase sm:text-5xl lg:text-6xl">
              สั่งน้ำแข็งออนไลน์กับ <span className="text-sun-400">{shop.name}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-forest-100 sm:text-xl">
              {shop.tagline}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/products"
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-ember-600 px-7 font-display text-lg text-white shadow-md shadow-forest-950/30 transition hover:bg-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none motion-safe:active:scale-98"
              >
                สั่งซื้อน้ำแข็ง
                <ArrowRightIcon className="size-5" />
              </Link>
              <StarBadge className="pop-in">ส่งถึงที่!</StarBadge>
            </div>
            <ul className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-2 py-3 text-center text-xs font-semibold sm:text-sm"
                >
                  <Icon className="size-7 text-sun-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual
            images={[shop.heroImageUrl, shop.heroImage2Url].filter((url): url is string => Boolean(url))}
            shopName={shop.name}
          />
        </div>
        <TornEdge className="absolute inset-x-0 bottom-0 h-4 text-white sm:h-6" />
      </section>

      {/* แถบโปรโมชั่น (ดึงจากตาราง settings) */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Suspense fallback={<PromoBannerSkeleton />}>
          <PromoBanner />
        </Suspense>
      </div>

      {/* เกี่ยวกับร้าน */}
      <section aria-labelledby="about-heading" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeading
          id="about-heading"
          eyebrow="เกี่ยวกับร้าน"
          title={`ทำไมต้อง ${shop.name}`}
          description={<span className="whitespace-pre-line">{shop.description}</span>}
          align="center"
        />
        <div className={`mt-10 ${shop.aboutImageUrl ? "grid gap-4 lg:grid-cols-5" : ""}`}>
          {/* รูปส่วนเกี่ยวกับร้าน (ถ้ามี): มือถือ/แท็บเล็ตอยู่บนการ์ด · จอใหญ่อยู่ซ้าย สูงเท่าการ์ด */}
          {shop.aboutImageUrl && (
            <div className="reveal relative aspect-4/3 overflow-hidden rounded-xl bg-stone-100 sm:aspect-video lg:col-span-2 lg:aspect-auto lg:min-h-80">
              <Image
                src={shop.aboutImageUrl}
                alt={`บรรยากาศร้าน ${shop.name}`}
                fill
                sizes="(min-width: 1024px) 460px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <ul
            className={`grid gap-4 sm:grid-cols-2 ${
              shop.aboutImageUrl ? "lg:col-span-3 lg:grid-cols-1" : "lg:grid-cols-3"
            }`}
          >
            {shop.highlights.map((item, i) => {
              const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
              return (
                // มือถือ: ไอคอนอยู่ซ้าย (การ์ดเตี้ยลง) / จอใหญ่: ไอคอนอยู่บน
                <li key={item.title} className="reveal flex gap-4 rounded-xl bg-stone-100 p-5 sm:block">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-forest-700 text-white">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <p className="font-display text-lg text-forest-800 uppercase sm:mt-4">{item.title}</p>
                    <p className="mt-1 leading-relaxed text-slate-600">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* สินค้า: เลือกจำนวนและใส่ตะกร้าได้จากหน้าแรกเลย */}
      <TornEdge className="h-4 text-forest-700 sm:h-6" />
      <section aria-labelledby="products-heading" className="bg-forest-700 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            id="products-heading"
            eyebrow="สินค้าของเรา"
            title="เลือกน้ำแข็งที่ต้องการ"
            description="เลือกจำนวนแล้วกด “ใส่ตะกร้า” สั่งได้ทันที"
            align="center"
            tone="dark"
          />
          <div className="mt-8">
            <Suspense fallback={<ProductOrderListSkeleton />}>
              <ProductOrderList headingLevel={3} animate />
            </Suspense>
          </div>
          <div className="reveal mt-8 flex justify-center">
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sun-400 px-8 font-display text-lg text-forest-950 transition hover:bg-sun-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:active:scale-98"
            >
              ไปที่ตะกร้า
              <ArrowRightIcon className="size-5" />
            </Link>
          </div>
        </div>
      </section>
      <TornEdge flip className="h-4 text-forest-700 sm:h-6" />

      {/* ช่องทางติดต่อร้าน + แผนที่ */}
      <section aria-labelledby="contact-heading" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeading
          id="contact-heading"
          eyebrow="ติดต่อเรา"
          title="ช่องทางติดต่อร้าน"
          description="สอบถามหรือสั่งซื้อทางโทรศัพท์และ LINE ได้เลย"
        />
        <div className="mt-8 space-y-3">
          <div className="reveal">
            <ContactButtons />
          </div>
          <div className="reveal">
            <ShopInfoCards />
          </div>
        </div>

        <div className="reveal">
          <h3 id="home-map-heading" className="mt-12 font-display text-2xl text-forest-800 uppercase">
            แผนที่ร้าน
          </h3>
          <div className="mt-3">
            <ShopMap headingId="home-map-heading" />
          </div>
        </div>

        <Link
          href="/contact"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg px-1 font-semibold text-forest-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
        >
          ดูคำถามที่พบบ่อย
          <ArrowRightIcon className="size-5" />
        </Link>
      </section>
    </>
  );
}
