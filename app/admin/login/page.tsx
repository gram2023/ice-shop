import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import { IceIcon } from "@/components/icons";
import { safeAdminPath } from "@/lib/admin/safe-path";
import { shopConfig } from "@/lib/shop-config";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** อ่าน ?next= (หน้าที่จะกลับไปหลังล็อกอิน) แล้วตรวจให้ปลอดภัย */
async function LoginFormWithNext({ searchParams }: { searchParams: SearchParams }) {
  const next = (await searchParams).next;
  return <LoginForm next={safeAdminPath(Array.isArray(next) ? next[0] : next)} />;
}

export default function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-blue-600 text-white">
            <IceIcon className="size-7" />
          </span>
          <h1 className="mt-3 text-xl font-bold text-slate-900">เข้าสู่ระบบแอดมิน</h1>
          <p className="text-sm text-slate-500">{shopConfig.name}</p>
        </div>
        <Suspense fallback={<LoginForm next="/admin" />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← กลับหน้าร้าน
      </Link>
    </main>
  );
}
