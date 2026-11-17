import Link from "next/link";
import { Suspense } from "react";
import ContactButtons from "@/components/ContactButtons";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import ProductList, { ProductListSkeleton } from "@/components/ProductList";
import PromoBanner, { PromoBannerSkeleton } from "@/components/PromoBanner";
import ShopInfoCards from "@/components/ShopInfoCards";
import { shopConfig } from "@/lib/shop-config";

export default function HomePage() {
  return (
    <>
      {/* ส่วนหัว (Hero) */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 text-white">
        {/* ก้อนน้ำแข็งตกแต่ง */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 size-48 rotate-12 rounded-[2.5rem] border border-white/30 bg-white/10 sm:size-72"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 bottom-10 size-20 -rotate-6 rounded-3xl border border-white/25 bg-white/10 sm:right-48 sm:size-32"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 hidden size-12 rotate-45 rounded-xl bg-white/15 sm:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-20 sm:px-6 md:pt-20 md:pb-28">
          <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium ring-1 ring-white/30">
            สั่งออนไลน์ ไม่ต้องสมัครสมาชิก
          </p>
          <h1 className="mt-4 text-4xl leading-snug font-extrabold sm:text-5xl md:text-6xl">
            {shopConfig.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-sky-50 sm:text-xl">
            {shopConfig.tagline}
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-lg font-bold text-blue-700 shadow-lg shadow-blue-900/20 transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            สั่งซื้อน้ำแข็ง
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </section>

      {/* แถบโปรโมชั่น (ดึงจากตาราง settings) */}
      <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<PromoBannerSkeleton />}>
          <PromoBanner />
        </Suspense>
      </div>

      {/* เกี่ยวกับร้าน */}
      <section
        aria-labelledby="about-heading"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16"
      >
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2
              id="about-heading"
              className="text-2xl font-bold text-blue-950 sm:text-3xl"
            >
              เกี่ยวกับร้าน
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {shopConfig.description}
            </p>
          </div>
          <ul className="grid gap-3">
            {shopConfig.highlights.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4"
              >
                <CheckIcon className="size-7 shrink-0 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-950">{item.title}</p>
                  <p className="text-slate-600">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ประเภทน้ำแข็งที่จำหน่าย (ดึงจากตาราง products) */}
      <section
        aria-labelledby="products-heading"
        className="bg-sky-50 py-12 md:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="products-heading"
            className="text-2xl font-bold text-blue-950 sm:text-3xl"
          >
            ประเภทน้ำแข็งที่จำหน่าย
          </h2>
          <div className="mt-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ช่องทางติดต่อร้าน */}
      <section
        aria-labelledby="contact-heading"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16"
      >
        <h2
          id="contact-heading"
          className="text-2xl font-bold text-blue-950 sm:text-3xl"
        >
          ช่องทางติดต่อร้าน
        </h2>
        <p className="mt-2 text-slate-600">
          สอบถามหรือสั่งซื้อทางโทรศัพท์และ LINE ได้เลย
        </p>
        <div className="mt-6 space-y-3">
          <ContactButtons />
          <ShopInfoCards />
        </div>
        <Link
          href="/contact"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-1 font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          ดูแผนที่และคำถามที่พบบ่อย
          <ArrowRightIcon className="size-5" />
        </Link>
      </section>
    </>
  );
}
