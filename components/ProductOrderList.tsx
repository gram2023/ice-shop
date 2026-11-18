import { getActiveProducts, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getShopProfile } from "@/lib/shop-profile-server";
import AddToCart from "./cart/AddToCart";
import ProductImage from "./ProductImage";
import SectionMessage from "./SectionMessage";

const gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

/** การ์ดสินค้าในหน้า /products (มีปุ่มเลือกจำนวนและใส่ตะกร้า) */
function ProductOrderCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
      {/* มือถือ: รูปเล็กด้านซ้าย / จอใหญ่: รูปเต็มความกว้างด้านบน */}
      <div className="flex gap-3 p-3 sm:flex-col sm:gap-0 sm:p-0">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-none">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 96px"
          />
        </div>
        <div className="min-w-0 flex-1 sm:px-4 sm:pt-4">
          <h2 className="text-lg font-bold text-blue-950">{product.name}</h2>
          {product.size_label && (
            <p className="text-sm text-slate-500">ขนาด {product.size_label}</p>
          )}
          {product.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}
          <p className="mt-1 text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
      <div className="mt-auto p-3 pt-1 sm:p-4">
        <AddToCart productId={product.id} productName={product.name} />
      </div>
    </article>
  );
}

/** รายการสินค้าสำหรับสั่งซื้อ (ต้องวางไว้ใน <Suspense>) */
export default async function ProductOrderList() {
  const [result, shop] = await Promise.all([getActiveProducts(), getShopProfile()]);

  if (!result.ok) {
    return (
      <SectionMessage variant="error">
        ไม่สามารถโหลดรายการสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง
        หรือโทรสั่งซื้อที่ {shop.phone}
      </SectionMessage>
    );
  }

  if (result.data.length === 0) {
    return (
      <SectionMessage variant="empty">ยังไม่มีสินค้าในขณะนี้</SectionMessage>
    );
  }

  return (
    <ul className={gridClass}>
      {result.data.map((product) => (
        <li key={product.id}>
          <ProductOrderCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductOrderListSkeleton() {
  return (
    <div className={gridClass} aria-busy="true" aria-label="กำลังโหลดสินค้า">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex gap-3 rounded-2xl border border-sky-100 bg-white p-3 sm:block sm:p-0"
        >
          <div className="size-24 shrink-0 animate-pulse rounded-xl bg-sky-100 sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-none" />
          <div className="flex-1 space-y-2 sm:p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-sky-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-sky-50" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-sky-100" />
            <div className="h-11 animate-pulse rounded-xl bg-sky-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
