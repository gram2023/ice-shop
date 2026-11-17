import { createBrowserStore } from "./browser-store";
import { clampQuantity, parseCartLines, type CartLine } from "./cart";
import { ORDER_LIMITS } from "./order-rules";
import { parseOrderSummary, type OrderSummary } from "./order-summary";

/**
 * ตะกร้าสินค้า เก็บใน localStorage ของเบราว์เซอร์ (ลูกค้าไม่ต้องสมัครสมาชิก)
 * ใช้ได้เฉพาะใน Client Component
 */
const cartStore = createBrowserStore<CartLine[]>({
  key: "ice-express-cart-v1",
  storage: "local",
  parse: (raw) => parseCartLines(raw, "lenient") ?? [],
  empty: [],
});

/** รายการในตะกร้า (null = กำลังโหลด) */
export const useCartLines = cartStore.useValue;

export function cartItemCount(lines: CartLine[] | null) {
  return lines ? lines.reduce((sum, l) => sum + l.quantity, 0) : 0;
}

/** เพิ่มสินค้าลงตะกร้า คืนค่า "full" ถ้าตะกร้ามีสินค้าครบจำนวนรายการสูงสุดแล้ว */
export function addToCart(productId: string, quantity: number): "added" | "full" {
  const lines = cartStore.get();
  const existing = lines.find((l) => l.productId === productId);

  if (existing) {
    cartStore.set(
      lines.map((l) =>
        l.productId === productId
          ? { ...l, quantity: clampQuantity(l.quantity + quantity) }
          : l,
      ),
    );
    return "added";
  }

  if (lines.length >= ORDER_LIMITS.maxLines) return "full";
  cartStore.set([...lines, { productId, quantity: clampQuantity(quantity) }]);
  return "added";
}

export function setCartQuantity(productId: string, quantity: number) {
  cartStore.set(
    cartStore
      .get()
      .map((l) =>
        l.productId === productId ? { ...l, quantity: clampQuantity(quantity) } : l,
      ),
  );
}

export function removeFromCart(productId: string) {
  cartStore.set(cartStore.get().filter((l) => l.productId !== productId));
}

export function clearCart() {
  cartStore.set([]);
}

/**
 * ออเดอร์ล่าสุดที่สั่งสำเร็จ เก็บใน sessionStorage (หายเมื่อปิดแท็บ)
 * เพื่อให้รีเฟรชหน้าแล้วยังเห็นเลขออเดอร์และวิธีชำระเงิน
 */
const lastOrderStore = createBrowserStore<OrderSummary | null>({
  key: "ice-express-last-order-v1",
  storage: "session",
  parse: parseOrderSummary,
  empty: null,
});

export const useLastOrder = lastOrderStore.useValue;

export function saveLastOrder(order: OrderSummary) {
  lastOrderStore.set(order);
}

export function clearLastOrder() {
  lastOrderStore.set(null);
}
