import type { Metadata } from "next";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import HoursForm from "@/components/admin/HoursForm";
import SettingsShell, { ProfileLoadError } from "@/components/admin/SettingsShell";
import { getProfileForAdmin } from "@/lib/admin/profile";

export const metadata: Metadata = {
  title: "เวลาเปิด-ปิด",
};

async function HoursContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await getProfileForAdmin();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <SettingsShell>
        {result.ok ? <HoursForm hours={result.data.profile.openingHours} /> : <ProfileLoadError />}
      </SettingsShell>
    </>
  );
}

export default function AdminHoursPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <HoursContent />
    </Suspense>
  );
}
