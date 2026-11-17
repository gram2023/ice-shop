import { useSyncExternalStore } from "react";

/**
 * เวลาปัจจุบันแบบปัดลงเป็นนาที อัปเดตเองทุกนาที
 * ใช้คำนวณช่วงเวลาจัดส่งที่ยังเลือกได้ (null = ยังไม่ได้อยู่ในเบราว์เซอร์)
 */
const MINUTE_MS = 60 * 1000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15 * 1000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

function getServerSnapshot() {
  return null;
}

export function useMinuteClock(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
