import type { ReactNode } from "react";

/** ชิ้นตกแต่งของธีม (SVG เขียนเอง ไม่ใช้รูป → ไฟล์เล็ก โหลดเร็ว) */

/** ขอบกระดาษฉีก: ด้านบนหยัก ด้านล่างเรียบ (สีตาม text color) */
const TORN_PATH =
  "M0 24V12L30 6L55 14L90 4L120 12L150 7L185 16L215 5L250 11L280 3L315 13L345 8L380 17L410 6L445 12L475 4L510 14L540 9L575 16L605 5L640 12L670 3L705 13L735 7L770 15L800 5L835 11L865 4L900 14L930 8L965 16L995 6L1030 12L1060 3L1095 13L1125 7L1160 15L1200 8V24Z";

/**
 * ขอบหยักคั่นระหว่างส่วน
 * - ปกติ: หยักด้านบน (วางไว้ "ก่อน" ส่วนที่มีสีเดียวกัน หรือทับขอบล่างของส่วนก่อนหน้า)
 * - flip: หยักด้านล่าง (วางไว้ "หลัง" ส่วนที่มีสีเดียวกัน)
 */
export function TornEdge({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path d={TORN_PATH} fill="currentColor" />
    </svg>
  );
}

/** จุดของรูปดาวหยัก 14 แฉก (คำนวณครั้งเดียว) */
const STAR_POINTS = Array.from({ length: 28 }, (_, i) => {
  const r = i % 2 === 0 ? 50 : 41;
  const angle = (Math.PI * i) / 14 - Math.PI / 2;
  return `${(50 + r * Math.cos(angle)).toFixed(1)},${(50 + r * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

/** สติกเกอร์ดาวหยัก (ข้อความสั้น ๆ 1–2 คำ) */
export function StarBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative grid size-24 shrink-0 -rotate-12 place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full text-ember-600">
        <polygon points={STAR_POINTS} fill="currentColor" stroke="white" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <span className="relative px-3 text-center font-display text-base leading-tight text-white">
        {children}
      </span>
    </span>
  );
}
