import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/** layout ของหน้าฝั่งลูกค้า (โฟลเดอร์ในวงเล็บไม่มีผลกับ URL) */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
