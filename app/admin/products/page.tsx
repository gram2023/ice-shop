import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductRowActions from "@/components/admin/ProductRowActions";
import ProductImage from "@/components/ProductImage";
import SectionMessage from "@/components/SectionMessage";
import { listAllProducts } from "@/lib/admin/products";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "สินค้า",
};

async function ProductsContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await listAllProducts();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">สินค้า</h1>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center rounded-full bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            + เพิ่มสินค้า
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          ลำดับในรายการนี้ = ลำดับที่แสดงบนหน้าร้าน · ใช้ปุ่ม ↑ ↓ เพื่อจัดลำดับ
        </p>

        {!result.ok ? (
          <SectionMessage variant="error">
            โหลดรายการสินค้าไม่สำเร็จ กรุณาโหลดหน้าใหม่อีกครั้ง
          </SectionMessage>
        ) : result.data.length === 0 ? (
          <SectionMessage variant="empty">ยังไม่มีสินค้า กด “เพิ่มสินค้า” เพื่อเริ่ม</SectionMessage>
        ) : (
          <ul className="space-y-3">
            {result.data.map((product, index) => (
              <li
                key={product.id}
                className={`rounded-xl border bg-white p-4 ${
                  product.isActive ? "border-slate-200" : "border-dashed border-slate-300 bg-slate-50"
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <ProductImage src={product.imageUrl} alt={product.name} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">{product.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          product.isActive
                            ? "bg-green-50 text-green-800 ring-green-300"
                            : "bg-slate-200 text-slate-700 ring-slate-300"
                        }`}
                      >
                        {product.isActive ? "เปิดขาย" : "ปิดขาย"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {product.sizeLabel ? `${product.sizeLabel} · ` : ""}
                      <span className="font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProductRowActions
                    id={product.id}
                    name={product.name}
                    isActive={product.isActive}
                    isFirst={index === 0}
                    isLast={index === result.data.length - 1}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function ProductsSkeleton() {
  return (
    <div aria-busy="true" aria-label="กำลังโหลดสินค้า">
      <div className="h-[100px] border-b border-slate-200 bg-white" />
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6" aria-hidden="true">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
