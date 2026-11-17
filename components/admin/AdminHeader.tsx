import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { shopConfig } from "@/lib/shop-config";
import { IceIcon } from "../icons";
import NewOrderWatcher from "./NewOrderWatcher";

type Props = {
  email: string | null;
  /** เวลาออเดอร์ล่าสุด ใช้นับออเดอร์ใหม่ (ไม่ส่ง = ไม่เช็คออเดอร์ใหม่) */
  newOrdersSince?: string;
};

export default function AdminHeader({ email, newOrdersSince }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2 rounded-lg font-bold text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <IceIcon className="size-6 shrink-0 text-blue-600" />
          <span className="truncate">{shopConfig.name}</span>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            แอดมิน
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {email && (
            <span className="hidden max-w-48 truncate text-sm text-slate-500 sm:inline">
              {email}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="h-10 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
      {newOrdersSince && <NewOrderWatcher since={newOrdersSince} />}
    </header>
  );
}
