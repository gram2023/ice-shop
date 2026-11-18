import { isValidOrderNo } from "./tracking";

/**
 * "ออเดอร์ล่าสุดในเครื่องนี้" — เก็บเฉพาะเลขออเดอร์ไว้ในเบราว์เซอร์ของลูกค้า
 * (ไม่เก็บชื่อ เบอร์โทร หรือที่อยู่ ต่อให้คนอื่นเห็นเลขออเดอร์ ก็ยังต้องรู้เบอร์ถึงจะดูข้อมูลได้)
 */

export const RECENT_ORDERS_MAX = 10;
export const RECENT_ORDERS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type RecentOrder = {
  orderNo: string;
  /** เวลาที่บันทึก (มิลลิวินาที) ใช้ลบรายการที่เก่ากว่า 30 วัน */
  savedAt: number;
};

/** อ่านค่าจากเบราว์เซอร์แบบผ่อนปรน: ทิ้งของเสีย/ของเก่า รวมรายการซ้ำ ล่าสุดก่อน ไม่เกิน 10 รายการ */
export function parseRecentOrders(value: unknown, nowMs: number): RecentOrder[] {
  if (!Array.isArray(value)) return [];
  const newest = new Map<string, number>();
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { orderNo, savedAt } = item as Record<string, unknown>;
    if (typeof orderNo !== "string" || !isValidOrderNo(orderNo)) continue;
    if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) continue;
    if (savedAt > nowMs + 60_000 || nowMs - savedAt > RECENT_ORDERS_RETENTION_MS) continue;
    newest.set(orderNo, Math.max(newest.get(orderNo) ?? 0, savedAt));
  }
  return [...newest]
    .map(([orderNo, savedAt]) => ({ orderNo, savedAt }))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, RECENT_ORDERS_MAX);
}

/** เพิ่ม (หรือย้ายขึ้นบนสุดถ้ามีอยู่แล้ว) */
export function addRecentOrder(list: RecentOrder[], orderNo: string, nowMs: number): RecentOrder[] {
  if (!isValidOrderNo(orderNo)) return list;
  return parseRecentOrders([{ orderNo, savedAt: nowMs }, ...list], nowMs);
}

export function removeRecentOrder(list: RecentOrder[], orderNo: string): RecentOrder[] {
  return list.filter((item) => item.orderNo !== orderNo);
}
