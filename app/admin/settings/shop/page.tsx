import type { Metadata } from "next";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import SettingsShell, { ProfileLoadError } from "@/components/admin/SettingsShell";
import ShopInfoForm from "@/components/admin/ShopInfoForm";
import { getProfileForAdmin } from "@/lib/admin/profile";

export const metadata: Metadata = {
  title: "ข้อมูลร้าน",
};

async function ShopInfoContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await getProfileForAdmin();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <SettingsShell>
        {result.ok ? (
          <ShopInfoForm profile={result.data.profile} savedLineUrl={result.data.raw.lineUrl} />
        ) : (
          <ProfileLoadError />
        )}
      </SettingsShell>
    </>
  );
}

export default function AdminShopInfoPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <ShopInfoContent />
    </Suspense>
  );
}
