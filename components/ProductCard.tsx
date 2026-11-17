import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
      <div className="relative aspect-square">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="text-base font-bold leading-snug text-blue-950 sm:text-lg">
          {product.name}
        </h3>
        {product.size_label && (
          <p className="text-sm text-slate-500">ขนาด {product.size_label}</p>
        )}
        <p className="mt-auto pt-2 text-lg font-bold text-blue-600 sm:text-xl">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}

/** โครงร่างการ์ดสินค้าระหว่างกำลังโหลด */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-sky-100 bg-white"
    >
      <div className="aspect-square animate-pulse bg-sky-100" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-sky-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-sky-50" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-sky-100" />
      </div>
    </div>
  );
}
