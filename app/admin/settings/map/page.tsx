import type { Metadata } from "next";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import MapForm from "@/components/admin/MapForm";
import SettingsShell, { ProfileLoadError } from "@/components/admin/SettingsShell";
import { getProfileForAdmin } from "@/lib/admin/profile";

export const metadata: Metadata = {
  title: "แผนที่ร้าน",
};

async function MapContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await getProfileForAdmin();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <SettingsShell>
        {result.ok ? (
          <MapForm
            embedUrl={result.data.profile.mapEmbedUrl}
            savedLinkUrl={result.data.raw.mapLinkUrl}
            currentLinkUrl={result.data.profile.mapLinkUrl}
          />
        ) : (
          <ProfileLoadError />
        )}
      </SettingsShell>
    </>
  );
}

export default function AdminMapPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <MapContent />
    </Suspense>
  );
}
