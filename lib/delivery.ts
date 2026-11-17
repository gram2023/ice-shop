import { shopConfig } from "./shop-config";

/**
 * คำนวณวันและเวลาจัดส่งที่ลูกค้าเลือกได้ (เวลาไทย)
 * - เฉพาะช่วงเวลาเปิดร้าน
 * - ล่วงหน้าอย่างน้อย deliveryLeadMinutes
 * - ไม่เกิน deliveryMaxDays วัน
 *
 * ประเทศไทยไม่มีเวลาออมแสง จึงใช้ +07:00 ได้ตลอดปี
 */
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export type DeliveryDay = {
  /** "YYYY-MM-DD" */
  date: string;
  /** เช่น "วันนี้ · อ. 18 พ.ย." */
  label: string;
  /** เวลาที่เลือกได้ เช่น ["10:00", "10:30"] */
  slots: string[];
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHhmm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const dayFormat = new Intl.DateTimeFormat("th-TH", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function dayLabel(index: number, wallMidnightMs: number) {
  const date = dayFormat.format(new Date(wallMidnightMs));
  if (index === 0) return `วันนี้ · ${date}`;
  if (index === 1) return `พรุ่งนี้ · ${date}`;
  return date;
}

export function getDeliveryDays(nowMs: number): DeliveryDay[] {
  const { deliveryLeadMinutes, deliveryMaxDays, deliverySlotMinutes } =
    shopConfig.orderRules;
  const earliest = nowMs + deliveryLeadMinutes * MINUTE_MS;
  const latest = nowMs + deliveryMaxDays * DAY_MS;

  // เวลาไทยปัจจุบัน (เก็บในรูป "เวลาไทยแบบ UTC" เพื่อใช้ getUTC* ได้ตรง ๆ)
  const bkkNow = new Date(nowMs + BANGKOK_OFFSET_MS);
  const days: DeliveryDay[] = [];

  for (let i = 0; i <= deliveryMaxDays; i++) {
    const wallMidnight = Date.UTC(
      bkkNow.getUTCFullYear(),
      bkkNow.getUTCMonth(),
      bkkNow.getUTCDate() + i,
    );
    const weekday = new Date(wallMidnight).getUTCDay();
    const slots = new Set<number>();

    for (const hours of shopConfig.openingHours) {
      if (!hours.days.includes(weekday)) continue;
      const open = toMinutes(hours.open);
      const close = toMinutes(hours.close);
      for (let t = open; t + deliverySlotMinutes <= close; t += deliverySlotMinutes) {
        const slotMs = wallMidnight + t * MINUTE_MS - BANGKOK_OFFSET_MS;
        if (slotMs >= earliest && slotMs <= latest) slots.add(t);
      }
    }

    if (slots.size > 0) {
      days.push({
        date: new Date(wallMidnight).toISOString().slice(0, 10),
        label: dayLabel(i, wallMidnight),
        slots: [...slots].sort((a, b) => a - b).map(toHhmm),
      });
    }
  }

  return days;
}

export function isValidDeliverySlot(date: string, time: string, nowMs: number) {
  const day = getDeliveryDays(nowMs).find((d) => d.date === date);
  return Boolean(day?.slots.includes(time));
}

/** "2026-11-18" + "10:30" → "2026-11-18T10:30:00+07:00" */
export function toBangkokIso(date: string, time: string) {
  return `${date}T${time}:00+07:00`;
}

const deliveryAtFormat = new Intl.DateTimeFormat("th-TH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});

/** แสดงวันเวลาจัดส่ง เช่น "วันอังคารที่ 18 พฤศจิกายน เวลา 10:30 น." */
export function formatDeliveryAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${deliveryAtFormat.format(date)} น.`;
}
