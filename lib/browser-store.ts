import { useSyncExternalStore } from "react";

/**
 * ที่เก็บข้อมูลในเบราว์เซอร์ (localStorage / sessionStorage) แบบใช้กับ React ได้
 *
 * - ถ้าเบราว์เซอร์ไม่ให้เก็บข้อมูล (เช่นโหมดไม่ระบุตัวตนบางแบบ) จะเก็บไว้ในหน่วยความจำแทน
 *   หน้าเว็บไม่พัง แค่ข้อมูลหายเมื่อปิดหน้า
 * - ตอน render ฝั่ง server และตอนเริ่มต้นจะได้ค่า null (= ยังโหลดไม่เสร็จ)
 *   เพื่อไม่ให้ HTML จาก server กับเบราว์เซอร์ไม่ตรงกัน
 * - ข้อมูลที่อ่านกลับมาต้องผ่าน parse เสมอ เพราะผู้ใช้แก้ค่าในเบราว์เซอร์เองได้
 */
export function createBrowserStore<T>(options: {
  key: string;
  storage: "local" | "session";
  parse: (raw: unknown) => T;
  empty: T;
}) {
  const { key, storage, parse, empty } = options;
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  function getStorage(): Storage | null {
    try {
      return storage === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  function read(): T {
    try {
      const raw = getStorage()?.getItem(key);
      return raw ? parse(JSON.parse(raw)) : empty;
    } catch {
      return empty;
    }
  }

  function get(): T {
    if (cache === undefined) cache = read();
    return cache;
  }

  function set(next: T) {
    cache = next;
    try {
      getStorage()?.setItem(key, JSON.stringify(next));
    } catch {
      // เก็บไม่ได้ ใช้ค่าในหน่วยความจำต่อไป
    }
    listeners.forEach((listener) => listener());
  }

  // ซิงก์เมื่อแท็บอื่นแก้ข้อมูลชุดเดียวกัน
  function onStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== key) return;
    cache = read();
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  }

  function getServerSnapshot(): T | null {
    return null;
  }

  function useValue(): T | null {
    return useSyncExternalStore<T | null>(subscribe, get, getServerSnapshot);
  }

  return { get, set, useValue };
}
