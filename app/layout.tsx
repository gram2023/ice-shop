import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { shopConfig } from "@/lib/shop-config";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${shopConfig.name} – สั่งน้ำแข็งออนไลน์`,
    template: `%s | ${shopConfig.name}`,
  },
  description: shopConfig.tagline,
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

/**
 * layout ชั้นนอกสุด: ฟอนต์และโครง html/body เท่านั้น
 * - หน้าลูกค้า (เมนู + ส่วนท้าย) อยู่ที่ app/(shop)/layout.tsx
 * - หน้าแอดมินอยู่ที่ app/admin/layout.tsx
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
