import { signOut } from "@/app/admin/actions";
import type { AdminSession } from "@/lib/admin/auth";
import { AlertIcon } from "../icons";

/** แสดงเมื่อล็อกอินแล้วแต่ไม่ใช่แอดมิน หรือตรวจสิทธิ์ไม่สำเร็จ */
export default function AdminAccessMessage({
  session,
}: {
  session: Extract<AdminSession, { status: "forbidden" | "error" }>;
}) {
  const forbidden = session.status === "forbidden";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div
        role="alert"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
      >
        <AlertIcon className="mx-auto size-10 text-amber-600" />
        <h1 className="mt-3 text-xl font-bold text-slate-900">
          {forbidden ? "บัญชีนี้ไม่มีสิทธิ์แอดมิน" : "ตรวจสอบสิทธิ์ไม่สำเร็จ"}
        </h1>
        <p className="mt-2 text-slate-600">
          {forbidden
            ? `${session.email ?? "บัญชีนี้"} ยังไม่ได้รับสิทธิ์เข้าหน้าแอดมิน กรุณาติดต่อเจ้าของร้าน`
            : "ระบบขัดข้องชั่วคราว กรุณาโหลดหน้าใหม่อีกครั้ง"}
        </p>
        <form action={signOut} className="mt-5">
          <button
            type="submit"
            className="h-11 w-full rounded-full border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </main>
  );
}
