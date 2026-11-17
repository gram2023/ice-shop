import { unstable_rethrow } from "next/navigation";
import type { Result } from "@/lib/data";
import { isPaymentMethod, type PaymentMethod } from "@/lib/order-rules";
import {
  ACTIVE_STATUSES,
  isOrderStatus,
  isPaymentStatus,
  ORDER_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { buildSearchFilter } from "./search";

/**
 * ดึงข้อมูลออเดอร์สำหรับหน้าแอดมิน
 * ต้องเรียกหลังตรวจ getAdminSession() แล้วเท่านั้น (RLS ในฐานข้อมูลกันอีกชั้น)
 * ทุกฟังก์ชันไม่ throw ออกไป คืนค่า { ok: false } แทน
 */

export const ORDERS_PAGE_SIZE = 30;

export type AdminOrderListItem = {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  deliveryAt: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  totalQuantity: number;
};

export type AdminOrderDetail = AdminOrderListItem & {
  address: string;
  note: string | null;
  subtotal: number;
  deliveryFee: number;
  items: {
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

type Row = Record<string, unknown>;

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toListItem(row: Row): AdminOrderListItem | null {
  const items = Array.isArray(row.order_items) ? (row.order_items as Row[]) : [];
  if (
    !isOrderStatus(row.status) ||
    !isPaymentStatus(row.payment_status) ||
    !isPaymentMethod(row.payment_method)
  ) {
    return null;
  }
  return {
    id: str(row.id),
    orderNo: str(row.order_no),
    customerName: str(row.customer_name),
    phone: str(row.phone),
    deliveryAt: str(row.delivery_at),
    createdAt: str(row.created_at),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    total: Number(row.total),
    totalQuantity: items.reduce((sum, i) => sum + Number(i.quantity ?? 0), 0),
  };
}

const LIST_COLUMNS =
  "id, order_no, customer_name, phone, delivery_at, created_at, status, payment_status, payment_method, total, order_items(quantity)";

export type OrderListQuery = {
  status: OrderStatus;
  search: string;
  page: number;
};

export type OrderListResult = {
  orders: AdminOrderListItem[];
  total: number;
  /** คำค้นสั้นเกินไป (ต้องอย่างน้อย 3 ตัวอักษร) */
  searchTooShort: boolean;
};

export async function listOrders(query: OrderListQuery): Promise<Result<OrderListResult>> {
  try {
    const supabase = await createClient();
    const from = (query.page - 1) * ORDERS_PAGE_SIZE;
    const to = from + ORDERS_PAGE_SIZE - 1;

    let request = supabase.from("orders").select(LIST_COLUMNS, { count: "exact" });

    if (query.search) {
      const filter = buildSearchFilter(query.search);
      if (!filter) {
        return { ok: true, data: { orders: [], total: 0, searchTooShort: true } };
      }
      // ค้นหาทุกสถานะ ล่าสุดก่อน
      request = request.or(filter).order("created_at", { ascending: false });
    } else if (ACTIVE_STATUSES.includes(query.status)) {
      // งานที่ยังไม่จบ: เวลาจัดส่งใกล้สุดขึ้นก่อน
      request = request
        .eq("status", query.status)
        .order("delivery_at", { ascending: true })
        .order("created_at", { ascending: true });
    } else {
      request = request.eq("status", query.status).order("created_at", { ascending: false });
    }

    const { data, error, count } = await request.range(from, to);
    if (error) {
      console.error("[listOrders]", error.code, error.message);
      return { ok: false };
    }

    const orders = (data ?? [])
      .map((row) => toListItem(row as Row))
      .filter((o): o is AdminOrderListItem => o !== null);

    return { ok: true, data: { orders, total: count ?? orders.length, searchTooShort: false } };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[listOrders]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

/** จำนวนออเดอร์ในแต่ละสถานะ (ใช้แสดงบนแท็บ) */
export async function countOrdersByStatus(): Promise<Result<Record<OrderStatus, number>>> {
  try {
    const supabase = await createClient();
    const results = await Promise.all(
      ORDER_STATUSES.map((status) =>
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", status),
      ),
    );
    const counts = {} as Record<OrderStatus, number>;
    for (const [i, res] of results.entries()) {
      if (res.error) {
        console.error("[countOrdersByStatus]", res.error.code, res.error.message);
        return { ok: false };
      }
      counts[ORDER_STATUSES[i]] = res.count ?? 0;
    }
    return { ok: true, data: counts };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[countOrdersByStatus]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

export async function getOrder(id: string): Promise<Result<AdminOrderDetail | null>> {
  if (!isUuid(id)) return { ok: true, data: null };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_no, customer_name, phone, address, delivery_at, note, payment_method, payment_status, status, subtotal, delivery_fee, total, created_at, order_items(id, product_name, unit_price, quantity, line_total)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[getOrder]", error.code, error.message);
      return { ok: false };
    }
    if (!data) return { ok: true, data: null };

    const row = data as Row;
    const base = toListItem(row);
    if (!base) return { ok: false };

    const items = (Array.isArray(row.order_items) ? (row.order_items as Row[]) : []).map(
      (item) => ({
        id: str(item.id),
        productName: str(item.product_name),
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      }),
    );

    return {
      ok: true,
      data: {
        ...base,
        address: str(row.address),
        note: typeof row.note === "string" && row.note ? row.note : null,
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.delivery_fee),
        items,
      },
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getOrder]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

/** เวลาที่ออเดอร์ล่าสุดถูกสร้าง ใช้เป็นจุดเริ่มนับ "ออเดอร์ใหม่" */
export async function getLatestOrderCreatedAt(): Promise<Result<string | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("[getLatestOrderCreatedAt]", error.code, error.message);
      return { ok: false };
    }
    return { ok: true, data: typeof data?.created_at === "string" ? data.created_at : null };
  } catch (err) {
    unstable_rethrow(err);
    console.error("[getLatestOrderCreatedAt]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

/** จำนวนออเดอร์ที่เข้ามาหลังเวลาที่กำหนด */
export async function countOrdersSince(sinceIso: string): Promise<Result<number>> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gt("created_at", sinceIso);
    if (error) {
      console.error("[countOrdersSince]", error.code, error.message);
      return { ok: false };
    }
    return { ok: true, data: count ?? 0 };
  } catch (err) {
    console.error("[countOrdersSince]", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
