"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { placeOrder } from "@/app/(shop)/checkout/actions";
import type { CartLine } from "@/lib/cart";
import { clearCart, saveLastOrder } from "@/lib/cart-store";
import {
  validateCheckout,
  type CheckoutField,
  type CheckoutInput,
  type FieldErrors,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { ORDER_LIMITS, PAYMENT_METHODS } from "@/lib/order-rules";
import { shopConfig } from "@/lib/shop-config";
import { AlertIcon } from "../icons";
import DeliverySlotPicker from "./DeliverySlotPicker";
import { describedBy, Field, FieldError, inputClass } from "../form-fields";

type Props = {
  lines: CartLine[];
  total: number;
};

const FIELD_IDS: Record<Exclude<CheckoutField, "items">, string> = {
  name: "checkout-name",
  phone: "checkout-phone",
  address: "checkout-address",
  deliveryDate: "checkout-date",
  deliveryTime: "checkout-time",
  paymentMethod: "checkout-payment",
  note: "checkout-note",
};

const FIELD_ORDER = Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[];

const sectionClass = "space-y-4 rounded-2xl border border-sky-100 bg-white p-5";

function readField(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

/** ฟอร์มกรอกข้อมูลผู้สั่ง + วันเวลาจัดส่ง + วิธีชำระเงิน */
export default function CheckoutForm({ lines, total }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{
    text: string;
    cartChanged?: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const messageRef = useRef<HTMLDivElement>(null);

  function clearError(field: CheckoutField) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function showErrors(fieldErrors: FieldErrors, text: string, cartChanged?: boolean) {
    setErrors(fieldErrors);
    setMessage({ text, cartChanged });
    const first = FIELD_ORDER.find((f) => fieldErrors[f]);
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
    } else {
      // ไม่มีช่องไหนผิด (เช่น ระบบขัดข้อง) ให้โฟกัสกล่องข้อความแทน
      requestAnimationFrame(() => messageRef.current?.focus());
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const input: CheckoutInput = {
      name: readField(form, "name"),
      phone: readField(form, "phone"),
      address: readField(form, "address"),
      deliveryDate: readField(form, "deliveryDate"),
      deliveryTime: readField(form, "deliveryTime"),
      paymentMethod: readField(form, "paymentMethod"),
      note: readField(form, "note"),
      items: lines,
    };

    const checked = validateCheckout(input, Date.now());
    if (!checked.ok) {
      showErrors(checked.errors, "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง");
      return;
    }

    setErrors({});
    setMessage(null);

    startTransition(async () => {
      const result = await placeOrder(input);
      if (result.ok) {
        saveLastOrder(result.order);
        clearCart();
        window.scrollTo({ top: 0 });
        return;
      }
      showErrors(result.fieldErrors ?? {}, result.message, result.cartChanged);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section aria-labelledby="customer-heading" className={sectionClass}>
        <h2 id="customer-heading" className="text-lg font-bold text-blue-950">
          ข้อมูลผู้สั่ง
        </h2>

        <Field id={FIELD_IDS.name} label="ชื่อผู้สั่ง" error={errors.name}>
          <input
            id={FIELD_IDS.name}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={ORDER_LIMITS.nameMax}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy(FIELD_IDS.name, errors.name)}
            onChange={() => clearError("name")}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>

        <Field
          id={FIELD_IDS.phone}
          label="เบอร์โทรศัพท์"
          hint="ร้านจะโทรยืนยันออเดอร์ที่เบอร์นี้"
          error={errors.phone}
        >
          <input
            id={FIELD_IDS.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="081-234-5678"
            maxLength={15}
            aria-required="true"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy(FIELD_IDS.phone, errors.phone, true)}
            onChange={() => clearError("phone")}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>

        <Field
          id={FIELD_IDS.address}
          label="ที่อยู่จัดส่ง"
          hint="บ้านเลขที่ ถนน/ซอย ตำบล และจุดสังเกต"
          error={errors.address}
        >
          <textarea
            id={FIELD_IDS.address}
            name="address"
            rows={3}
            autoComplete="street-address"
            maxLength={ORDER_LIMITS.addressMax}
            aria-required="true"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={describedBy(FIELD_IDS.address, errors.address, true)}
            onChange={() => clearError("address")}
            className={inputClass(Boolean(errors.address))}
          />
        </Field>
      </section>

      <section aria-labelledby="delivery-heading" className={sectionClass}>
        <div>
          <h2 id="delivery-heading" className="text-lg font-bold text-blue-950">
            วันและเวลาจัดส่ง
          </h2>
          <p className="text-sm text-slate-500">
            สั่งล่วงหน้าอย่างน้อย {shopConfig.orderRules.deliveryLeadMinutes / 60}{" "}
            ชั่วโมง ภายในเวลาเปิดร้าน
          </p>
        </div>
        <DeliverySlotPicker
          dateId={FIELD_IDS.deliveryDate}
          timeId={FIELD_IDS.deliveryTime}
          dateError={errors.deliveryDate}
          timeError={errors.deliveryTime}
          onDateChange={() => {
            clearError("deliveryDate");
            clearError("deliveryTime");
          }}
          onTimeChange={() => clearError("deliveryTime")}
        />
      </section>

      <section aria-labelledby="payment-heading" className={sectionClass}>
        <fieldset
          aria-describedby={
            errors.paymentMethod ? `${FIELD_IDS.paymentMethod}-error` : undefined
          }
        >
          <legend id="payment-heading" className="text-lg font-bold text-blue-950">
            วิธีชำระเงิน
            <span className="text-red-600" aria-hidden="true">
              {" "}
              *
            </span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method, index) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-sky-50 has-checked:border-blue-600 has-checked:bg-sky-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-600 ${
                  errors.paymentMethod ? "border-red-500" : "border-slate-300"
                }`}
              >
                <input
                  id={index === 0 ? FIELD_IDS.paymentMethod : undefined}
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  onChange={() => clearError("paymentMethod")}
                  className="mt-1 size-5 shrink-0 accent-blue-600"
                />
                <span>
                  <span className="block font-semibold text-blue-950">
                    {method.label}
                  </span>
                  <span className="text-sm text-slate-500">{method.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldError id={FIELD_IDS.paymentMethod} error={errors.paymentMethod} />
        </fieldset>

        <Field id={FIELD_IDS.note} label="หมายเหตุ" optional error={errors.note}>
          <textarea
            id={FIELD_IDS.note}
            name="note"
            rows={2}
            maxLength={ORDER_LIMITS.noteMax}
            placeholder="เช่น ฝากไว้หน้าบ้าน โทรก่อนถึง 10 นาที"
            aria-invalid={Boolean(errors.note)}
            aria-describedby={describedBy(FIELD_IDS.note, errors.note)}
            onChange={() => clearError("note")}
            className={inputClass(Boolean(errors.note))}
          />
        </Field>
      </section>

      <div className="space-y-3">
        {message && (
          <div
            ref={messageRef}
            tabIndex={-1}
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 focus:outline-2 focus:outline-red-400"
          >
            <AlertIcon className="size-6 shrink-0 text-red-600" />
            <div>
              <p className="font-medium">{message.text}</p>
              {(message.cartChanged || errors.items) && (
                <Link
                  href="/cart"
                  className="mt-1 inline-block font-semibold text-red-800 underline"
                >
                  กลับไปแก้ตะกร้า
                </Link>
              )}
            </div>
          </div>
        )}

        <p className="text-sm leading-relaxed text-slate-500">
          ข้อมูลชื่อ เบอร์โทร และที่อยู่ ใช้เพื่อจัดส่งและติดต่อเรื่องคำสั่งซื้อนี้เท่านั้น
        </p>

        <button
          type="submit"
          disabled={pending}
          className="flex h-14 w-full items-center justify-center rounded-full bg-blue-600 px-6 text-lg font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400"
        >
          {pending ? "กำลังส่งคำสั่งซื้อ…" : `ยืนยันสั่งซื้อ · ${formatPrice(total)}`}
        </button>
      </div>
    </form>
  );
}
