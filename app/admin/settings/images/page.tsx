import type { Metadata } from "next";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import HomeImageForm from "@/components/admin/HomeImageForm";
import SettingsShell, { ProfileLoadError } from "@/components/admin/SettingsShell";
import { getProfileForAdmin } from "@/lib/admin/profile";
import { HOME_IMAGE_INFO, HOME_IMAGE_SLOTS } from "@/lib/home-images";

export const metadata: Metadata = {
  title: "รูปหน้าแรก",
};

async function ImagesContent() {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const result = await getProfileForAdmin();

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <SettingsShell>
        {result.ok ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">
              บันทึกทีละรูป · ช่องที่ยังไม่มีรูป หน้าแรกจะใช้ลายตกแต่งแทน · ระบบย่อรูปให้อัตโนมัติ
            </p>
            {HOME_IMAGE_SLOTS.map((slot) => (
              <HomeImageForm
                key={slot}
                slot={slot}
                currentUrl={result.data.profile[HOME_IMAGE_INFO[slot].profileKey]}
              />
            ))}
          </div>
        ) : (
          <ProfileLoadError />
        )}
      </SettingsShell>
    </>
  );
}

export default function AdminImagesPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-busy="true" aria-label="กำลังโหลด" />}>
      <ImagesContent />
    </Suspense>
  );
}
