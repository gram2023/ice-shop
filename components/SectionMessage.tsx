import { AlertIcon, IceIcon } from "./icons";

type Props = {
  /** error = โหลดข้อมูลไม่สำเร็จ, empty = ไม่มีข้อมูล */
  variant: "error" | "empty";
  children: React.ReactNode;
};

/** กล่องข้อความแจ้งในแต่ละส่วนของหน้า เช่น โหลดข้อมูลไม่สำเร็จ หรือยังไม่มีข้อมูล */
export default function SectionMessage({ variant, children }: Props) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border p-4 text-base ${
        isError
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-stone-200 bg-stone-100 text-slate-600"
      }`}
    >
      {isError ? (
        <AlertIcon className="size-6 shrink-0 text-amber-600" />
      ) : (
        <IceIcon className="size-6 shrink-0 text-forest-600" />
      )}
      <div>{children}</div>
    </div>
  );
}
