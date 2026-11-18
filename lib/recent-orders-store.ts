import { createBrowserStore } from "./browser-store";
import {
  addRecentOrder,
  parseRecentOrders,
  removeRecentOrder,
  type RecentOrder,
} from "./recent-orders";

/**
 * ที่เก็บ "ออเดอร์ล่าสุดในเครื่องนี้" ใน localStorage (ใช้ได้เฉพาะใน Client Component)
 * ถ้าเบราว์เซอร์ไม่ให้เก็บข้อมูล จะจำไว้แค่ระหว่างเปิดหน้าอยู่ (หน้าเว็บไม่พัง)
 */
const store = createBrowserStore<RecentOrder[]>({
  key: "ice-express-recent-orders-v1",
  storage: "local",
  parse: (raw) => parseRecentOrders(raw, Date.now()),
  empty: [],
});

/** รายการออเดอร์ล่าสุด (null = กำลังโหลด) */
export const useRecentOrders = store.useValue;

export function rememberOrder(orderNo: string) {
  store.set(addRecentOrder(store.get(), orderNo, Date.now()));
}

export function forgetOrder(orderNo: string) {
  store.set(removeRecentOrder(store.get(), orderNo));
}
