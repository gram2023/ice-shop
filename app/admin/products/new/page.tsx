import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "เพิ่มสินค้า",
};

async function NewProductContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
        <Link href="/admin/products" className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
          ← กลับไปรายการสินค้า
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">เพิ่มสินค้า</h1>
        <ProductForm action={saveProduct.bind(null, null)} product={null} />
      </main>
    </>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <NewProductContent />
    </Suspense>
  );
}
