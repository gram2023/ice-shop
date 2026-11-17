"use client";

import Image from "next/image";
import { useState } from "react";
import { IceIcon } from "./icons";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
};

/**
 * รูปสินค้าจาก Supabase Storage จะถูกย่อขนาดอัตโนมัติ (ตั้งค่าไว้ใน next.config.ts)
 * ส่วนรูปจากเว็บอื่นจะแสดงตามต้นฉบับ
 */
function isSupabaseStorageUrl(src: string) {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function isValidImageSrc(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** ภาพแทนสินค้าที่ยังไม่มีรูป: พื้นสีฟ้า + ไอคอนน้ำแข็ง */
export function ProductImagePlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-sky-100 via-sky-200 to-blue-200">
      <IceIcon className="size-14 text-sky-500 sm:size-16" />
    </div>
  );
}

/** ต้องวางไว้ใน element ที่มี position: relative และกำหนดสัดส่วนไว้แล้ว */
export default function ProductImage({ src, alt, sizes }: Props) {
  const [failed, setFailed] = useState(false);
  const cleanSrc = src?.trim() ?? "";

  if (!cleanSrc || failed || !isValidImageSrc(cleanSrc)) {
    return <ProductImagePlaceholder />;
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={!cleanSrc.startsWith("/") && !isSupabaseStorageUrl(cleanSrc)}
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}
