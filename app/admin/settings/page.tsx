import type { Metadata } from "next";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import SectionMessage from "@/components/SectionMessage";
import { getShopSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "ตั้งค่าร้าน",
};

async function SettingsContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await getShopSettings();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">ตั้งค่าร้าน</h1>
        {result.ok ? (
          <SettingsForm settings={result.data} />
        ) : (
          <SectionMessage variant="error">
            โหลดการตั้งค่าไม่สำเร็จ ถ้าเพิ่งอัปเดตระบบ ตรวจสอบว่ารัน supabase/phase4.sql แล้ว
            จากนั้นโหลดหน้าใหม่อีกครั้ง
          </SectionMessage>
        )}
      </main>
    </>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <SettingsContent />
    </Suspense>
  );
}
