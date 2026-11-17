import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import SectionMessage from "@/components/SectionMessage";
import { getAdminProduct } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "แก้ไขสินค้า",
};

type Params = Promise<{ id: string }>;

async function EditProductContent({ params }: { params: Params }) {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const { id } = await params;
  const result = await getAdminProduct(id);

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
        <Link href="/admin/products" className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">
          ← กลับไปรายการสินค้า
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">แก้ไขสินค้า</h1>
        {!result.ok ? (
          <SectionMessage variant="error">โหลดข้อมูลสินค้าไม่สำเร็จ กรุณาโหลดหน้าใหม่อีกครั้ง</SectionMessage>
        ) : !result.data ? (
          <SectionMessage variant="empty">ไม่พบสินค้านี้ (อาจถูกลบไปแล้ว)</SectionMessage>
        ) : (
          <ProductForm action={saveProduct.bind(null, result.data.id)} product={result.data} />
        )}
      </main>
    </>
  );
}

export default function EditProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <EditProductContent params={params} />
    </Suspense>
  );
}
