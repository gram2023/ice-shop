import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { guardAdmin } from "@/components/admin/admin-guard";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  OrderListCard,
  OrderSearch,
  OrderTabs,
  Pagination,
} from "@/components/admin/OrderList";
import SectionMessage from "@/components/SectionMessage";
import { countOrdersByStatus, listOrders, ORDERS_PAGE_SIZE } from "@/lib/admin/orders";
import { isOrderStatus, STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "ออเดอร์",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const gate = await guardAdmin();
  if (!gate.ok) return gate.view;

  const params = await searchParams;
  const rawStatus = first(params.status);
  const status: OrderStatus = isOrderStatus(rawStatus) ? rawStatus : "pending";
  const search = (first(params.q) ?? "").trim().slice(0, 50);
  const page = Math.min(1000, Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1));

  const [list, counts] = await Promise.all([
    listOrders({ status, search, page }),
    countOrdersByStatus(),
  ]);

  const makeHref = (p: number) => {
    const query = new URLSearchParams(search ? { q: search } : { status });
    if (p > 1) query.set("page", String(p));
    return `/admin?${query.toString()}`;
  };

  return (
    <>
      <AdminHeader email={gate.email} newOrdersSince={gate.newOrdersSince} />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">ออเดอร์</h1>
        <OrderSearch defaultValue={search} />

        {search ? (
          <p className="text-sm text-slate-600">
            ผลการค้นหา “{search}”
            {list.ok && !list.data.searchTooShort && ` · ${list.data.total} รายการ`} ·{" "}
            <Link href="/admin" className="font-semibold text-blue-700 underline">
              ล้างการค้นหา
            </Link>
          </p>
        ) : (
          <OrderTabs active={status} counts={counts.ok ? counts.data : null} />
        )}

        {!list.ok ? (
          <SectionMessage variant="error">
            โหลดรายการออเดอร์ไม่สำเร็จ กรุณาโหลดหน้าใหม่อีกครั้ง
          </SectionMessage>
        ) : list.data.searchTooShort ? (
          <SectionMessage variant="empty">
            พิมพ์เลขออเดอร์หรือเบอร์โทรอย่างน้อย 3 ตัว
          </SectionMessage>
        ) : list.data.orders.length === 0 ? (
          <SectionMessage variant="empty">
            {search ? "ไม่พบออเดอร์ที่ค้นหา" : `ไม่มีออเดอร์ในสถานะ “${STATUS_LABELS[status]}”`}
          </SectionMessage>
        ) : (
          <>
            <ul className="space-y-3">
              {list.data.orders.map((order) => (
                <OrderListCard key={order.id} order={order} />
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={Math.ceil(list.data.total / ORDERS_PAGE_SIZE)}
              makeHref={makeHref}
            />
          </>
        )}
      </main>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div aria-busy="true" aria-label="กำลังโหลดออเดอร์">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6" aria-hidden="true">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
