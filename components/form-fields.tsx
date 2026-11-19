import type { ReactNode } from "react";
import { AlertIcon } from "./icons";

/** ส่วนประกอบของช่องกรอกในฟอร์มสั่งซื้อ (label / คำอธิบาย / ข้อความผิดพลาด) */

export function inputClass(hasError: boolean) {
  return `block w-full rounded-lg border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0 focus:outline-forest-600 disabled:bg-slate-50 disabled:text-slate-400 ${
    hasError ? "border-red-500" : "border-slate-300"
  }`;
}

/** ค่า aria-describedby ที่ชี้ไปยังคำอธิบายและข้อความผิดพลาดของช่อง */
export function describedBy(id: string, error?: string, hasHint?: boolean) {
  const ids = [hasHint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(
    Boolean,
  );
  return ids.length ? ids.join(" ") : undefined;
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p
      id={`${id}-error`}
      className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700"
    >
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      {error}
    </p>
  );
}

export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-forest-900">
        {label}
        {optional ? (
          <span className="font-normal text-slate-500"> (ไม่บังคับ)</span>
        ) : (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      <FieldError id={id} error={error} />
    </div>
  );
}
