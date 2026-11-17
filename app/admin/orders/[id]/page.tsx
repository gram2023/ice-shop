import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import AdminAccessMessage from "@/components/admin/AdminAccessMessage";
import AdminHeader from "@/components/admin/AdminHeader";
import PaymentToggle from "@/components/admin/PaymentToggle";
import StatusActions from "@/components/admin/StatusActions";
import { PaymentBadge, StatusBadge } from "@/components/admin/StatusBadge";
import OrderTotals from "@/components/cart/OrderTotals";
import { PhoneIcon } from "@/components/icons";
import SectionMessage from "@/components/SectionMessage";
import { getAdminSession } from "@/lib/admin/auth";
import { formatPhone, formatShortDateTime } from "@/lib/admin/format";
import {
  getLatestOrderCreatedAt,
  getOrder,
  type AdminOrderDetail,
} from "@/lib/admin/orders";
import { formatDeliveryAt } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-rules";

export const metadata: Metadata = {
  title: "รายละเอียดออเดอร์",
};

type Params = Promise<{ id: string }>;

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin"
      className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline"
    >
      ← กลับไปรายการออเดอร์
    </Link>
  );
}

async function OrderDetailContent({ params }: { params: Params }) {
  const session = await getAdminSession();
  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status !== "admin") return <AdminAccessMessage session={session} />;

  const { id } = await params;
  const [result, latest] = await Promise.all([getOrder(id), getLatestOrderCreatedAt()]);
  const since = latest.ok && latest.data ? latest.data : new Date().toISOString();

  return (
    <>
      <AdminHeader email={session.email} newOrdersSince={since} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-4">
        <BackLink />
        {!result.ok ? (
          <SectionMessage variant="error">
            โหลดข้อมูลออเดอร์ไม่สำเร็จ กรุณาโหลดหน้าใหม่อีกครั้ง
          </SectionMessage>
        ) : !result.data ? (
          <SectionMessage variant="empty">ไม่พบออเดอร์นี้</SectionMessage>
        ) : (
          <OrderDetail order={result.data} />
        )}
      </main>
    </>
  );
}

function OrderDetail({ order }: { order: AdminOrderDetail }) {
  return (
    <>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide text-slate-900">
              {order.orderNo}
            </h1>
            <p className="text-sm text-slate-500">
              สั่งเมื่อ {formatShortDateTime(order.createdAt)}
            </p>
          </div>
          <span className="flex flex-wrap gap-1.5">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </span>
        </div>
        <StatusActions orderId={order.id} status={order.status} />
      </section>

      <Card title="ลูกค้า">
        <p className="text-lg font-semibold text-slate-900">{order.customerName}</p>
        <a
          href={`tel:${order.phone}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-50 font-bold text-blue-800 ring-1 ring-blue-200 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PhoneIcon className="size-5" />
          โทร {formatPhone(order.phone)}
        </a>
        <div>
          <p className="text-sm font-semibold text-slate-500">ที่อยู่จัดส่ง</p>
          <p className="whitespace-pre-line text-slate-800">{order.address}</p>
        </div>
      </Card>

      <Card title="การจัดส่ง">
        <p className="text-lg font-semibold text-slate-900">
          {formatDeliveryAt(order.deliveryAt)}
        </p>
        {order.note && (
          <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
            <p className="text-sm font-semibold text-amber-900">หมายเหตุจากลูกค้า</p>
            <p className="whitespace-pre-line text-amber-950">{order.note}</p>
          </div>
        )}
      </Card>

      <Card title="รายการสินค้า">
        <ul className="divide-y divide-slate-100 border-y border-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2">
              <span className="text-slate-800">
                {item.productName}{" "}
                <span className="text-slate-500">
                  × {item.quantity} ({formatPrice(item.unitPrice)}/ถุง)
                </span>
              </span>
              <span className="font-semibold text-slate-900">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <OrderTotals
          totalQuantity={order.totalQuantity}
          subtotal={order.subtotal}
          deliveryFee={order.deliveryFee}
          total={order.total}
        />
      </Card>

      <Card title="การชำระเงิน">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-slate-800">
            {paymentMethodLabel(order.paymentMethod)}
          </p>
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <PaymentToggle orderId={order.id} status={order.paymentStatus} />
      </Card>

      <BackLink />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="กำลังโหลดออเดอร์">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4" aria-hidden="true">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="h-32 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
