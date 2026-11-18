import type { OpeningHour } from "./shop-config";

/** เวลาเปิด-ปิดร้าน: ตรวจรูปแบบ + สร้างข้อความวัน เช่น "จันทร์ – เสาร์" */

export const DAY_NAMES = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
export const MAX_HOURS_ROWS = 10;

/** ลำดับวันที่ใช้แสดงผล (เริ่มวันจันทร์) */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** ข้อความเวลาเปิด-ปิด เช่น "06:00 – 18:00 น." */
export function formatOpeningTime(hour: Pick<OpeningHour, "open" | "close">) {
  return `${hour.open} – ${hour.close} น.`;
}

export function isTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/**
 * ข้อความวันจากรายการวัน
 * [0..6] → "ทุกวัน" / [1,2,3,4,5,6] → "จันทร์ – เสาร์" / [1,3,5] → "จันทร์, พุธ, ศุกร์"
 */
export function formatDaysLabel(days: number[]): string {
  const set = new Set(days);
  const ordered = DISPLAY_ORDER.filter((d) => set.has(d));
  if (ordered.length === 7) return "ทุกวัน";

  // รวมวันที่ติดกัน (ตั้งแต่ 3 วันขึ้นไป) เป็นช่วง
  const parts: string[] = [];
  let i = 0;
  while (i < ordered.length) {
    let j = i;
    while (
      j + 1 < ordered.length &&
      DISPLAY_ORDER.indexOf(ordered[j + 1]) === DISPLAY_ORDER.indexOf(ordered[j]) + 1
    ) {
      j++;
    }
    if (j - i >= 2) {
      parts.push(`${DAY_NAMES[ordered[i]]} – ${DAY_NAMES[ordered[j]]}`);
    } else {
      for (let k = i; k <= j; k++) parts.push(DAY_NAMES[ordered[k]]);
    }
    i = j + 1;
  }
  return parts.join(", ");
}

/**
 * ตรวจรายการเวลาเปิด-ปิดที่มาจากภายนอก (ฟอร์มแอดมิน / ฐานข้อมูล)
 * ผิดแม้แถวเดียว → คืนค่า message บอกเหตุผล (ข้อความวันสร้างใหม่จากรายการวันเสมอ)
 */
export function validateOpeningHours(
  value: unknown,
): { ok: true; data: OpeningHour[] } | { ok: false; message: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, message: "ต้องมีเวลาเปิด-ปิดอย่างน้อย 1 ช่วง" };
  }
  if (value.length > MAX_HOURS_ROWS) {
    return { ok: false, message: `เพิ่มได้ไม่เกิน ${MAX_HOURS_ROWS} ช่วง` };
  }

  const rows: OpeningHour[] = [];
  for (const [index, raw] of value.entries()) {
    const n = index + 1;
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, message: `ช่วงที่ ${n} ข้อมูลไม่ถูกต้อง` };
    }
    const r = raw as Record<string, unknown>;
    const days = Array.isArray(r.days) ? r.days : [];
    const validDays = [...new Set(days)].filter(
      (d): d is number => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6,
    );
    if (validDays.length === 0 || validDays.length !== days.length) {
      return { ok: false, message: `ช่วงที่ ${n}: กรุณาเลือกวันอย่างน้อย 1 วัน` };
    }
    if (!isTime(r.open) || !isTime(r.close)) {
      return { ok: false, message: `ช่วงที่ ${n}: เวลาไม่ถูกต้อง (รูปแบบ 24 ชม. เช่น 06:00)` };
    }
    if (r.open >= r.close) {
      return { ok: false, message: `ช่วงที่ ${n}: เวลาปิดต้องหลังเวลาเปิด` };
    }
    const sortedDays = [...validDays].sort((a, b) => a - b);
    rows.push({ label: formatDaysLabel(sortedDays), days: sortedDays, open: r.open, close: r.close });
  }
  return { ok: true, data: rows };
}
