import { getActiveProducts, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getShopProfile } from "@/lib/shop-profile-server";
import AddToCart from "./cart/AddToCart";
import ProductImage from "./ProductImage";
import SectionMessage from "./SectionMessage";

const gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

type HeadingLevel = 2 | 3;

/** การ์ดสินค้าพร้อมปุ่มเลือกจำนวนและใส่ตะกร้า (หน้าแรกและหน้า /products) */
function ProductOrderCard({ product, headingLevel }: { product: Product; headingLevel: HeadingLevel }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition duration-350 hover:shadow-lg hover:shadow-forest-950/15 motion-safe:hover:-translate-y-1">
      {/* มือถือ: รูปเล็กด้านซ้าย / จอใหญ่: รูปเต็มความกว้างด้านบน */}
      <div className="flex gap-3 p-3 sm:flex-col sm:gap-0 sm:p-0">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:aspect-4/3 sm:h-auto sm:w-full sm:rounded-none">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 96px"
          />
        </div>
        <div className="min-w-0 flex-1 sm:px-4 sm:pt-4">
          <Heading className="font-display text-lg text-forest-800 uppercase">{product.name}</Heading>
          {product.size_label && (
            <p className="text-sm text-slate-500">ขนาด {product.size_label}</p>
          )}
          {product.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}
          <p className="mt-1 text-xl font-bold text-slate-900">
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

/**
 * รายการสินค้าสำหรับสั่งซื้อ (ต้องวางไว้ใน <Suspense>)
 * headingLevel: หน้า /products ชื่อสินค้าเป็น h2 (ใต้ h1) / หน้าแรกเป็น h3 (ใต้หัวข้อส่วน h2)
 * animate: การ์ดค่อย ๆ โผล่ตอนเลื่อนมาถึง (ใช้ในหน้าแรก)
 */
export default async function ProductOrderList({
  headingLevel = 2,
  animate = false,
}: {
  headingLevel?: HeadingLevel;
  animate?: boolean;
}) {
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
        <li key={product.id} className={animate ? "reveal" : undefined}>
          <ProductOrderCard product={product} headingLevel={headingLevel} />
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
          className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:block sm:p-0"
        >
          <div className="size-24 shrink-0 animate-pulse rounded-lg bg-stone-200 sm:aspect-4/3 sm:h-auto sm:w-full sm:rounded-none" />
          <div className="flex-1 space-y-2 sm:p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-stone-200" />
            <div className="h-11 animate-pulse rounded-lg bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
