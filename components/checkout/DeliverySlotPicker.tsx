"use client";

import { useMemo, useState } from "react";
import { getDeliveryDays } from "@/lib/delivery";
import { shopConfig } from "@/lib/shop-config";
import { useMinuteClock } from "@/lib/use-minute-clock";
import { describedBy, Field, inputClass } from "./form-fields";

type Props = {
  dateId: string;
  timeId: string;
  dateError?: string;
  timeError?: string;
  onDateChange: () => void;
  onTimeChange: () => void;
};

/**
 * เลือกวันและเวลาจัดส่ง ค่าที่เลือกส่งไปกับฟอร์มในชื่อ deliveryDate / deliveryTime
 * รายการเวลาคำนวณใหม่ทุกนาที ถ้าเวลาที่เลือกไว้ผ่านไปแล้วจะกลับเป็น "ยังไม่ได้เลือก"
 */
export default function DeliverySlotPicker({
  dateId,
  timeId,
  dateError,
  timeError,
  onDateChange,
  onTimeChange,
}: Props) {
  const now = useMinuteClock();
  const days = useMemo(() => (now === null ? [] : getDeliveryDays(now)), [now]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const selectedDay = days.find((d) => d.date === date);
  const deliveryDate = selectedDay ? date : "";
  const deliveryTime = selectedDay?.slots.includes(time) ? time : "";

  if (now !== null && days.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-amber-900">
        ขณะนี้ไม่มีช่วงเวลาจัดส่งให้เลือก กรุณาโทรสั่งที่ {shopConfig.phone}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={dateId} label="วันจัดส่ง" error={dateError}>
        <select
          id={dateId}
          name="deliveryDate"
          value={deliveryDate}
          disabled={now === null}
          aria-required="true"
          aria-invalid={Boolean(dateError)}
          aria-describedby={describedBy(dateId, dateError)}
          onChange={(e) => {
            setDate(e.target.value);
            setTime("");
            onDateChange();
          }}
          className={inputClass(Boolean(dateError))}
        >
          <option value="">{now === null ? "กำลังโหลด…" : "เลือกวัน"}</option>
          {days.map((d) => (
            <option key={d.date} value={d.date}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id={timeId} label="เวลาจัดส่ง" error={timeError}>
        <select
          id={timeId}
          name="deliveryTime"
          value={deliveryTime}
          disabled={!selectedDay}
          aria-required="true"
          aria-invalid={Boolean(timeError)}
          aria-describedby={describedBy(timeId, timeError)}
          onChange={(e) => {
            setTime(e.target.value);
            onTimeChange();
          }}
          className={inputClass(Boolean(timeError))}
        >
          <option value="">{selectedDay ? "เลือกเวลา" : "เลือกวันก่อน"}</option>
          {selectedDay?.slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot} น.
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
