"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { saveOpeningHours, type ProfileFormState } from "@/app/admin/settings/profile-actions";
import {
  DAY_NAMES,
  formatDaysLabel,
  formatOpeningTime,
  isTime,
  MAX_HOURS_ROWS,
} from "@/lib/opening-hours";
import type { OpeningHour } from "@/lib/shop-config";
import { inputClass } from "../form-fields";
import { PlusIcon, TrashIcon } from "../icons";
import SaveBar from "./SaveBar";

const initialState: ProfileFormState = { errors: {}, message: null, saved: false };
/** แสดงวันเริ่มจากวันจันทร์ */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type Row = { key: number; days: number[]; open: string; close: string };

/** ฟอร์มเวลาเปิด-ปิด: แต่ละช่วงเลือกวัน + เวลาเปิด/ปิด (เพิ่ม/ลบช่วงได้) */
export default function HoursForm({ hours }: { hours: OpeningHour[] }) {
  const [state, dispatch, pending] = useActionState(saveOpeningHours, initialState);
  const [rows, setRows] = useState<Row[]>(() =>
    hours.map((h, i) => ({ key: i, days: h.days, open: h.open, close: h.close })),
  );
  const nextKey = useRef(hours.length);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  function update(key: number, patch: Partial<Omit<Row, "key">>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function toggleDay(row: Row, day: number) {
    update(row.key, {
      days: row.days.includes(day) ? row.days.filter((d) => d !== day) : [...row.days, day],
    });
  }

  function addRow() {
    if (rows.length >= MAX_HOURS_ROWS) return;
    const key = nextKey.current++;
    setRows((prev) => [...prev, { key, days: [], open: "08:00", close: "17:00" }]);
    // ย้ายโฟกัสไปวันแรกของช่วงใหม่ (หลังวาดหน้าจอเสร็จ)
    requestAnimationFrame(() => document.getElementById(`hours-${key}-day-1`)?.focus());
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
    // ปุ่มลบหายไปพร้อมช่วงนั้น → ย้ายโฟกัสไปปุ่ม "เพิ่มช่วงเวลา" แทน
    addButtonRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData();
    formData.set(
      "openingHours",
      JSON.stringify(rows.map(({ days, open, close }) => ({ days, open, close }))),
    );
    startTransition(() => dispatch(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section
        aria-labelledby="hours-heading"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div>
          <h2 id="hours-heading" className="text-lg font-bold text-slate-900">
            เวลาเปิด-ปิด
          </h2>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-500">
            <li>ใช้แสดงบนเว็บ และใช้คำนวณเวลาจัดส่งที่ลูกค้าเลือกได้</li>
            <li>วันที่ไม่ได้เลือกในช่วงไหนเลย = ร้านปิด ลูกค้าเลือกส่งวันนั้นไม่ได้</li>
            <li>ปิดพักกลางวัน: เพิ่ม 2 ช่วงในวันเดียวกัน เช่น 06:00–12:00 และ 13:00–18:00</li>
          </ul>
        </div>

        {rows.map((row, index) => {
          const hasTimes = isTime(row.open) && isTime(row.close);
          const valid = row.days.length > 0 && hasTimes && row.open < row.close;
          return (
            <fieldset key={row.key} className="space-y-3 rounded-xl border border-slate-200 px-4 pb-4">
              <legend className="px-1 font-semibold text-slate-900">ช่วงที่ {index + 1}</legend>

              <div role="group" aria-label="วันที่เปิด" className="flex flex-wrap gap-2">
                {DAY_ORDER.map((day) => (
                  <label
                    key={day}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 select-none has-checked:border-blue-600 has-checked:bg-blue-600 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-600"
                  >
                    <input
                      id={`hours-${row.key}-day-${day}`}
                      type="checkbox"
                      className="sr-only"
                      checked={row.days.includes(day)}
                      onChange={() => toggleDay(row, day)}
                    />
                    {DAY_NAMES[day]}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div>
                  <label htmlFor={`hours-${row.key}-open`} className="block text-sm font-semibold text-slate-700">
                    เปิด
                  </label>
                  <input
                    id={`hours-${row.key}-open`}
                    type="time"
                    value={row.open}
                    onChange={(e) => update(row.key, { open: e.target.value })}
                    className={`mt-1 ${inputClass(false)}`}
                  />
                </div>
                <div>
                  <label htmlFor={`hours-${row.key}-close`} className="block text-sm font-semibold text-slate-700">
                    ปิด
                  </label>
                  <input
                    id={`hours-${row.key}-close`}
                    type="time"
                    value={row.close}
                    onChange={(e) => update(row.key, { close: e.target.value })}
                    className={`mt-1 ${inputClass(false)}`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`text-sm ${valid ? "text-slate-600" : "font-medium text-amber-700"}`}>
                  {row.days.length === 0
                    ? "ยังไม่ได้เลือกวัน"
                    : !hasTimes
                      ? "กรุณาใส่เวลาเปิดและปิดให้ครบ"
                      : !valid
                        ? "เวลาปิดต้องหลังเวลาเปิด"
                        : `แสดงบนเว็บ: ${formatDaysLabel(row.days)} ${formatOpeningTime(row)}`}
                </p>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <TrashIcon className="size-4" />
                    ลบช่วงที่ {index + 1}
                  </button>
                )}
              </div>
            </fieldset>
          );
        })}

        <button
          ref={addButtonRef}
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_HOURS_ROWS}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          <PlusIcon className="size-5" />
          เพิ่มช่วงเวลา
        </button>
      </section>

      <SaveBar message={state.message} saved={state.saved} pending={pending} label="บันทึกเวลาเปิด-ปิด" />
    </form>
  );
}
