import type { Metadata, Viewport } from "next";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import { getShopProfile } from "@/lib/shop-profile-server";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

/** ฟอนต์หัวข้อ: โหลดเฉพาะตัวหนา (700) น้ำหนักเดียว เพื่อให้หน้าเว็บโหลดเร็ว */
const kanit = Kanit({
  variable: "--font-kanit",
  weight: "700",
  subsets: ["thai", "latin"],
  display: "swap",
});

/** ชื่อแท็บเบราว์เซอร์/คำอธิบายเว็บ ใช้ชื่อร้านที่แอดมินตั้งไว้ */
export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShopProfile();
  return {
    title: {
      default: `${shop.name} – สั่งน้ำแข็งออนไลน์`,
      template: `%s | ${shop.name}`,
    },
    description: shop.tagline,
  };
}

export const viewport: Viewport = {
  // สีแถบเบราว์เซอร์บนมือถือ = สีเมนูด้านบน (forest-700)
  themeColor: "#1e5a35",
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
      className={`${notoSansThai.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
