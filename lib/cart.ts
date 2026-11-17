import type { Product } from "./data";
import { ORDER_LIMITS } from "./order-rules";

/** สินค้า 1 รายการในตะกร้า เก็บแค่รหัสสินค้ากับจำนวน (ราคาดึงจากฐานข้อมูลเสมอ) */
export type CartLine = {
  productId: string;
  quantity: number;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= ORDER_LIMITS.maxQuantity
  );
}

function toLine(value: unknown): CartLine | null {
  if (typeof value !== "object" || value === null) return null;
  const { productId, quantity } = value as Record<string, unknown>;
  if (typeof productId !== "string" || !UUID_RE.test(productId)) return null;
  if (!isValidQuantity(quantity)) return null;
  return { productId, quantity };
}

/**
 * ตรวจรายการตะกร้าที่มาจากภายนอก (เบราว์เซอร์ / คำขอ)
 * - strict: ผิดแม้แต่รายการเดียว → คืนค่า null (ใช้ฝั่ง server ตอนสั่งซื้อ)
 * - lenient: ทิ้งรายการที่ผิด รวมรายการซ้ำ (ใช้ตอนอ่านตะกร้าจากเบราว์เซอร์)
 */
export function parseCartLines(
  value: unknown,
  mode: "strict" | "lenient",
): CartLine[] | null {
  if (!Array.isArray(value)) return mode === "strict" ? null : [];

  if (mode === "strict") {
    if (value.length < 1 || value.length > ORDER_LIMITS.maxLines) return null;
    const lines: CartLine[] = [];
    const seen = new Set<string>();
    for (const item of value) {
      const line = toLine(item);
      if (!line || seen.has(line.productId)) return null;
      seen.add(line.productId);
      lines.push(line);
    }
    return lines;
  }

  const merged = new Map<string, number>();
  for (const item of value) {
    const line = toLine(item);
    if (!line) continue;
    const qty = (merged.get(line.productId) ?? 0) + line.quantity;
    merged.set(line.productId, Math.min(qty, ORDER_LIMITS.maxQuantity));
  }
  return Array.from(merged, ([productId, quantity]) => ({
    productId,
    quantity,
  })).slice(0, ORDER_LIMITS.maxLines);
}

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(ORDER_LIMITS.maxQuantity, Math.max(1, Math.floor(value)));
}

export type MatchedLine = { line: CartLine; product: Product };
export type CartRow = MatchedLine | { line: CartLine; product: null };

/**
 * จับคู่รายการในตะกร้ากับข้อมูลสินค้าล่าสุดจากฐานข้อมูล
 * สินค้าที่หยุดขายแล้ว (ไม่อยู่ในรายการที่เปิดขาย) จะได้ product = null
 */
export function matchCart(lines: CartLine[], products: Product[]) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows: CartRow[] = lines.map((line) => ({
    line,
    product: byId.get(line.productId) ?? null,
  }));
  const available = rows.filter((r): r is MatchedLine => r.product !== null);
  return { rows, available, unavailableCount: rows.length - available.length };
}
