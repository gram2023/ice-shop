import type { ReactNode } from "react";
import SectionMessage from "../SectionMessage";
import SettingsTabs from "./SettingsTabs";

/** โครงหน้าตั้งค่าร้าน: หัวข้อ + แท็บหมวด + เนื้อหา */
export default function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">ตั้งค่าร้าน</h1>
      <SettingsTabs />
      {children}
    </main>
  );
}

/** โหลดข้อมูลร้านไม่สำเร็จ (ส่วนใหญ่เพราะยังไม่ได้รัน phase6.sql) */
export function ProfileLoadError() {
  return (
    <SectionMessage variant="error">
      โหลดข้อมูลร้านไม่สำเร็จ ถ้าเพิ่งอัปเดตระบบ ตรวจสอบว่ารัน supabase/phase6.sql แล้ว
      จากนั้นโหลดหน้าใหม่อีกครั้ง
    </SectionMessage>
  );
}
