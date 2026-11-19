import type { ReactNode } from "react";
import { TornEdge } from "./decor";

type Props = {
  title: string;
  description?: ReactNode;
  /** ความกว้างให้ตรงกับเนื้อหาของหน้า (narrow = หน้าติดตามออเดอร์) */
  width?: "wide" | "narrow";
};

/** แถบหัวหน้าเพจ: พื้นเขียว + ชื่อหน้า (Kanit) + ขอบหยักด้านล่าง — ใช้กับทุกหน้าฝั่งลูกค้ายกเว้นหน้าแรก */
export default function PageHeader({ title, description, width = "wide" }: Props) {
  return (
    <div className="relative bg-forest-700 text-white">
      <div
        className={`mx-auto px-4 pt-8 pb-12 sm:px-6 md:pt-12 md:pb-16 ${
          width === "narrow" ? "max-w-2xl" : "max-w-6xl"
        }`}
      >
        <h1 className="font-display text-3xl uppercase sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-lg text-forest-100">{description}</p>}
      </div>
      <TornEdge className="absolute inset-x-0 bottom-0 h-4 text-white sm:h-6" />
    </div>
  );
}
