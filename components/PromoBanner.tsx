import { getPromoText } from "@/lib/data";
import { TagIcon } from "./icons";
import SectionMessage from "./SectionMessage";

/** แถบโปรโมชั่น ดึงข้อความจากตาราง settings (ต้องวางไว้ใน <Suspense>) */
export default async function PromoBanner() {
  const result = await getPromoText();

  if (!result.ok) {
    return (
      <SectionMessage variant="error">
        ไม่สามารถโหลดข้อมูลโปรโมชั่นได้ในขณะนี้
      </SectionMessage>
    );
  }

  // ไม่มีโปรโมชั่น → ไม่ต้องแสดงแถบ
  if (!result.data) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-blue-700 to-blue-600 p-4 text-white shadow-lg shadow-blue-900/15 sm:p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15">
        <TagIcon className="size-6" />
      </span>
      <p className="text-base sm:text-lg">
        <span className="font-bold">โปรโมชั่น: </span>
        {result.data}
      </p>
    </div>
  );
}

export function PromoBannerSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[76px] animate-pulse rounded-2xl bg-blue-200/70 sm:h-[84px]"
    />
  );
}
