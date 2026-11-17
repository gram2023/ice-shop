import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // รับรูปสินค้า/QR จากหน้าแอดมิน (รูปถูกย่อในเบราว์เซอร์แล้ว และ server จำกัดไฟล์ไว้ 2 MB)
      // ค่าเริ่มต้นของ Next.js คือ 1 MB
      bodySizeLimit: "3mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // อนุญาตให้ย่อขนาดรูปสินค้าที่เก็บใน Supabase Storage (bucket แบบ public)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
