import { getActiveProducts } from "@/lib/data";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import SectionMessage from "./SectionMessage";

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5";

/** รายการสินค้าที่เปิดขาย ดึงจากตาราง products (ต้องวางไว้ใน <Suspense>) */
export default async function ProductList() {
  const result = await getActiveProducts();

  if (!result.ok) {
    return (
      <SectionMessage variant="error">
        ไม่สามารถโหลดรายการสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง
        หรือโทรสั่งซื้อกับร้านได้โดยตรง
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
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductListSkeleton() {
  return (
    <div className={gridClass} aria-busy="true" aria-label="กำลังโหลดสินค้า">
      {Array.from({ length: 5 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
