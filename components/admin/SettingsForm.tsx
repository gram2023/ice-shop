"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { saveSettings, type SettingsFormState } from "@/app/admin/settings/actions";
import { SETTINGS_LIMITS, type SettingsField } from "@/lib/admin/settings-input";
import type { ShopSettings } from "@/lib/settings";
import { describedBy, Field, inputClass } from "../form-fields";
import { AlertIcon, CheckIcon } from "../icons";
import ImagePicker from "./ImagePicker";

const initialState: SettingsFormState = { errors: {}, message: null, saved: false };
const FIELD_ORDER: SettingsField[] = [
  "deliveryFee",
  "freeShippingMinQty",
  "promoText",
  "bankName",
  "accountName",
  "accountNumber",
  "promptPayId",
];
const fieldId = (field: SettingsField) => `settings-${field}`;
const sectionClass = "space-y-4 rounded-2xl border border-slate-200 bg-white p-5";

/** ฟอร์มตั้งค่าร้าน: ค่าส่ง / ส่งฟรี / โปรโมชั่น / ข้อมูลชำระเงิน */
export default function SettingsForm({ settings }: { settings: ShopSettings }) {
  const [state, dispatch, pending] = useActionState(saveSettings, initialState);
  const [imageBusy, setImageBusy] = useState(false);
  const errors = state.errors;

  useEffect(() => {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }, [errors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || imageBusy) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  const text = (
    field: SettingsField,
    label: string,
    defaultValue: string,
    extra: { hint?: string; optional?: boolean; inputMode?: "decimal" | "numeric" | "text"; maxLength?: number } = {},
  ) => (
    <Field id={fieldId(field)} label={label} hint={extra.hint} optional={extra.optional} error={errors[field]}>
      <input
        id={fieldId(field)}
        name={field}
        type="text"
        inputMode={extra.inputMode}
        defaultValue={defaultValue}
        maxLength={extra.maxLength}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={describedBy(fieldId(field), errors[field], Boolean(extra.hint))}
        className={inputClass(Boolean(errors[field]))}
      />
    </Field>
  );

  const p = settings.payment;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section aria-labelledby="delivery-settings" className={sectionClass}>
        <h2 id="delivery-settings" className="text-lg font-bold text-slate-900">
          ค่าส่งและโปรโมชั่น
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("deliveryFee", "ค่าส่ง (บาท)", String(settings.deliveryFee), {
            inputMode: "decimal",
            hint: "ใส่ 0 ถ้าส่งฟรีทุกออเดอร์",
          })}
          {text("freeShippingMinQty", "สั่งครบกี่ถุงส่งฟรี", String(settings.freeShippingMinQty), {
            inputMode: "numeric",
            hint: "ใส่ 0 = ไม่มีโปรส่งฟรี",
            maxLength: 3,
          })}
        </div>
        <Field
          id={fieldId("promoText")}
          label="ข้อความโปรโมชั่น (แถบหน้าแรก)"
          optional
          hint="เว้นว่าง = ไม่แสดงแถบโปรโมชั่น · อย่าลืมแก้ให้ตรงกับจำนวนถุงส่งฟรีด้านบน"
          error={errors.promoText}
        >
          <textarea
            id={fieldId("promoText")}
            name="promoText"
            rows={2}
            defaultValue={settings.promoText ?? ""}
            maxLength={SETTINGS_LIMITS.promoTextMax}
            aria-invalid={Boolean(errors.promoText)}
            aria-describedby={describedBy(fieldId("promoText"), errors.promoText, true)}
            className={inputClass(Boolean(errors.promoText))}
          />
        </Field>
      </section>

      <section aria-labelledby="payment-settings" className={sectionClass}>
        <div>
          <h2 id="payment-settings" className="text-lg font-bold text-slate-900">
            ข้อมูลชำระเงิน
          </h2>
          <p className="text-sm text-slate-500">
            แสดงให้ลูกค้าหลังสั่งซื้อ · เว้นว่าง = แจ้งลูกค้าว่าร้านจะส่งเลขบัญชี/QR ทาง LINE
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("bankName", "ธนาคาร", p.bankName ?? "", { optional: true, maxLength: SETTINGS_LIMITS.bankNameMax, hint: "เช่น ธนาคารกสิกรไทย" })}
          {text("accountName", "ชื่อบัญชี", p.accountName ?? "", { optional: true, maxLength: SETTINGS_LIMITS.accountNameMax })}
          {text("accountNumber", "เลขที่บัญชี", p.accountNumber ?? "", { optional: true, inputMode: "numeric", maxLength: 20, hint: "เช่น 123-4-56789-0" })}
          {text("promptPayId", "พร้อมเพย์", p.promptPayId ?? "", { optional: true, inputMode: "numeric", maxLength: 20, hint: "เบอร์มือถือ หรือเลขบัตรประชาชน" })}
        </div>
        <ImagePicker
          // บันทึกแล้วลิงก์รูปเปลี่ยน → ล้างรูปที่เลือกค้างไว้ (กันอัปโหลดซ้ำตอนกดบันทึกอีกครั้ง)
          key={p.promptPayQrUrl ?? "no-qr"}
          name="qrImage"
          removeName="removeQrImage"
          label="รูป QR พร้อมเพย์"
          hint="แคปหน้าจอ QR รับเงินจากแอปธนาคาร แล้วอัปโหลดที่นี่"
          currentUrl={p.promptPayQrUrl}
          error={errors.qrImage}
          variant="qr"
          onBusyChange={setImageBusy}
        />
      </section>

      {state.message && (
        <p
          role={state.saved ? "status" : "alert"}
          className={`flex items-start gap-2 rounded-xl p-3 text-sm font-medium ${
            state.saved ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.saved ? (
            <CheckIcon className="size-5 shrink-0" />
          ) : (
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
          )}
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || imageBusy}
        className="h-12 w-full rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400 sm:w-auto"
      >
        {pending ? "กำลังบันทึก…" : imageBusy ? "กำลังย่อรูป…" : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
