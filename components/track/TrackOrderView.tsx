"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { trackOrder, type TrackField, type TrackResult as ActionResult } from "@/app/(shop)/track/actions";
import { isValidPhone, normalizePhone } from "@/lib/order-rules";
import { rememberOrder } from "@/lib/recent-orders-store";
import { isValidOrderNo, normalizeOrderNo, type TrackedOrder } from "@/lib/tracking";
import { describedBy, Field, inputClass } from "../form-fields";
import { AlertIcon } from "../icons";
import ForgotOrderHelp from "./ForgotOrderHelp";
import RecentOrderList from "./RecentOrderList";
import TrackResult from "./TrackResult";

const REFRESH_MS = 60 * 1000;
const FIELD_IDS: Record<TrackField, string> = {
  orderNo: "track-order-no",
  phone: "track-phone",
};

type Failure = Extract<ActionResult, { ok: false }>;

/**
 * ฟอร์มค้นหาออเดอร์ + แสดงผล + อัปเดตสถานะเองทุก 1 นาที
 * เบอร์โทรเก็บไว้ในหน่วยความจำของหน้านี้เท่านั้น (ไม่ใส่ในลิงก์ ไม่บันทึกลงเบราว์เซอร์)
 */
export default function TrackOrderView({ initialOrderNo }: { initialOrderNo: string }) {
  const [query, setQuery] = useState<{ orderNo: string; phone: string } | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [orderNoValue, setOrderNoValue] = useState(initialOrderNo);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  /** กดเลือกออเดอร์จากรายการในเครื่อง → เติมเลขออเดอร์ แล้วไปช่องเบอร์โทร */
  function pickRecent(orderNo: string) {
    setOrderNoValue(orderNo);
    setFailure(null);
    document.getElementById(FIELD_IDS.phone)?.focus();
  }

  // อัปเดตสถานะเองทุก 1 นาที (ค้นหาที่ถูกต้องไม่นับเป็นการค้นหาผิด จึงไม่โดนล็อก)
  useEffect(() => {
    if (!query) return;
    let active = true;
    const id = window.setInterval(async () => {
      try {
        const result = await trackOrder(query.orderNo, query.phone);
        if (!active) return;
        if (result.ok) {
          setOrder(result.order);
          setUpdatedAt(Date.now());
        } else if (result.notFound || result.locked) {
          // หยุดอัปเดต ไม่ให้นับเป็นการค้นหาผิดซ้ำ ๆ แล้วบอกเหตุผล
          setQuery(null);
          setFailure(result);
        }
      } catch {
        // เน็ตหลุดชั่วคราว ลองใหม่รอบถัดไป
      }
    }, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [query]);

  // แสดงผลครั้งแรก → ย้ายโฟกัสไปที่หัวข้อผลลัพธ์
  useEffect(() => {
    if (query) headingRef.current?.focus();
  }, [query]);

  function showFailure(result: Failure) {
    setFailure(result);
    const first = (Object.keys(FIELD_IDS) as TrackField[]).find((f) => result.fieldErrors?.[f]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
    else requestAnimationFrame(() => messageRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const orderNo = normalizeOrderNo(String(form.get("orderNo") ?? ""));
    const phone = normalizePhone(String(form.get("phone") ?? "").trim());

    const fieldErrors: Partial<Record<TrackField, string>> = {};
    if (!isValidOrderNo(orderNo)) fieldErrors.orderNo = "เลขออเดอร์ไม่ถูกต้อง ตัวอย่าง: ICE-261117-4821";
    if (!isValidPhone(phone)) fieldErrors.phone = "กรุณากรอกเบอร์โทรที่ใช้ตอนสั่งซื้อ เช่น 081-234-5678";
    if (Object.keys(fieldErrors).length > 0) {
      showFailure({ ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors });
      return;
    }

    setFailure(null);
    startTransition(async () => {
      const result = await trackOrder(orderNo, phone);
      if (result.ok) {
        rememberOrder(orderNo); // จำเลขออเดอร์ที่ค้นเจอไว้ในเครื่องนี้ (เช่น กรณีพิมพ์เองบนเครื่องใหม่)
        setOrder(result.order);
        setUpdatedAt(Date.now());
        setQuery({ orderNo, phone });
      } else {
        showFailure(result);
      }
    });
  }

  function reset() {
    setQuery(null);
    setOrder(null);
    setUpdatedAt(null);
    setFailure(null);
  }

  if (order && query) {
    return <TrackResult order={order} updatedAt={updatedAt} headingRef={headingRef} onReset={reset} />;
  }

  const errors = failure?.fieldErrors ?? {};

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-5"
    >
      <RecentOrderList selectedOrderNo={orderNoValue} onPick={pickRecent} />

      <Field id={FIELD_IDS.orderNo} label="เลขออเดอร์" hint="อยู่บนหน้าสั่งซื้อสำเร็จ เช่น ICE-261117-4821" error={errors.orderNo}>
        <input
          id={FIELD_IDS.orderNo}
          name="orderNo"
          type="text"
          value={orderNoValue}
          onChange={(e) => setOrderNoValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          placeholder="ICE-261117-4821"
          aria-required="true"
          aria-invalid={Boolean(errors.orderNo)}
          aria-describedby={describedBy(FIELD_IDS.orderNo, errors.orderNo, true)}
          className={`${inputClass(Boolean(errors.orderNo))} uppercase tracking-wide`}
        />
      </Field>

      <Field id={FIELD_IDS.phone} label="เบอร์โทรที่ใช้ตอนสั่งซื้อ" error={errors.phone}>
        <input
          id={FIELD_IDS.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          placeholder="081-234-5678"
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy(FIELD_IDS.phone, errors.phone)}
          className={inputClass(Boolean(errors.phone))}
        />
      </Field>

      {failure && !failure.fieldErrors && (
        <div
          ref={messageRef}
          tabIndex={-1}
          role="alert"
          className={`flex items-start gap-3 rounded-xl p-4 focus:outline-2 ${
            failure.locked
              ? "bg-red-50 text-red-900 focus:outline-red-400"
              : "bg-amber-50 text-amber-900 focus:outline-amber-400"
          }`}
        >
          <AlertIcon className="size-6 shrink-0" />
          <p className="font-medium">{failure.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center rounded-lg bg-ember-600 px-6 text-lg font-display text-white hover:bg-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600 disabled:cursor-wait disabled:bg-ember-500"
      >
        {pending ? "กำลังค้นหา…" : "ดูสถานะออเดอร์"}
      </button>

      <p className="text-sm leading-relaxed text-slate-500">
        เพื่อความปลอดภัยของข้อมูลลูกค้า ถ้ากรอกไม่ตรงกันเกิน 5 ครั้งใน 15 นาที
        ระบบจะพักการค้นหาด้วยเบอร์นั้นชั่วคราว 15 นาที
      </p>

      <ForgotOrderHelp />
    </form>
  );
}
