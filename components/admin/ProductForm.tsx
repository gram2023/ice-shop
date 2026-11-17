"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import type { ProductFormState } from "@/app/admin/products/actions";
import { PRODUCT_LIMITS, type ProductField } from "@/lib/admin/product-input";
import type { AdminProduct } from "@/lib/admin/products";
import { describedBy, Field, inputClass } from "../form-fields";
import { AlertIcon } from "../icons";
import ImagePicker from "./ImagePicker";

type Props = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product: AdminProduct | null;
};

const initialState: ProductFormState = { errors: {}, message: null };
const FIELD_ORDER: ProductField[] = ["name", "price", "sizeLabel", "description"];
const fieldId = (field: ProductField) => `product-${field}`;

/** ฟอร์มเพิ่ม/แก้ไขสินค้า (บันทึกสำเร็จแล้ว server จะพากลับหน้ารายการสินค้า) */
export default function ProductForm({ action, product }: Props) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const [imageBusy, setImageBusy] = useState(false);
  const errors = state.errors;

  // บันทึกไม่ผ่าน → เลื่อนไปช่องแรกที่ผิด
  useEffect(() => {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }, [errors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || imageBusy) return;
    const formData = new FormData(event.currentTarget);
    // ส่งเองแทน form action เพื่อไม่ให้ฟอร์มถูกล้าง (ข้อมูลที่กรอก/รูปที่เลือกยังอยู่ถ้าบันทึกไม่ผ่าน)
    startTransition(() => dispatch(formData));
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <Field id={fieldId("name")} label="ชื่อสินค้า" error={errors.name}>
        <input
          id={fieldId("name")}
          name="name"
          type="text"
          defaultValue={product?.name ?? ""}
          maxLength={PRODUCT_LIMITS.nameMax}
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy(fieldId("name"), errors.name)}
          className={inputClass(Boolean(errors.name))}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={fieldId("price")}
          label="ราคา (บาท)"
          hint="ราคาต่อถุง เช่น 20 หรือ 12.50"
          error={errors.price}
        >
          <input
            id={fieldId("price")}
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={product ? String(product.price) : ""}
            aria-required="true"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={describedBy(fieldId("price"), errors.price, true)}
            className={inputClass(Boolean(errors.price))}
          />
        </Field>

        <Field
          id={fieldId("sizeLabel")}
          label="ขนาด"
          optional
          hint="เช่น 5 กก."
          error={errors.sizeLabel}
        >
          <input
            id={fieldId("sizeLabel")}
            name="sizeLabel"
            type="text"
            defaultValue={product?.sizeLabel ?? ""}
            maxLength={PRODUCT_LIMITS.sizeLabelMax}
            aria-invalid={Boolean(errors.sizeLabel)}
            aria-describedby={describedBy(fieldId("sizeLabel"), errors.sizeLabel, true)}
            className={inputClass(Boolean(errors.sizeLabel))}
          />
        </Field>
      </div>

      <Field id={fieldId("description")} label="คำอธิบาย" optional error={errors.description}>
        <textarea
          id={fieldId("description")}
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          maxLength={PRODUCT_LIMITS.descriptionMax}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={describedBy(fieldId("description"), errors.description)}
          className={inputClass(Boolean(errors.description))}
        />
      </Field>

      <ImagePicker
        name="image"
        removeName="removeImage"
        label="รูปสินค้า"
        hint="ไม่ใส่รูป หน้าร้านจะแสดงภาพน้ำแข็งสีฟ้าแทน"
        currentUrl={product?.imageUrl ?? null}
        error={errors.image}
        onBusyChange={setImageBusy}
      />

      <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="size-5 accent-blue-600"
        />
        <span>
          <span className="block font-semibold text-blue-950">เปิดขายบนหน้าร้าน</span>
          <span className="text-sm text-slate-500">ไม่ติ๊ก = ซ่อนจากหน้าร้าน (ยังแก้ไขได้ภายหลัง)</span>
        </span>
      </label>

      {state.message && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 font-semibold text-slate-700 hover:bg-slate-50"
        >
          ยกเลิก
        </Link>
        <button
          type="submit"
          disabled={pending || imageBusy}
          className="h-12 rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400"
        >
          {pending ? "กำลังบันทึก…" : imageBusy ? "กำลังย่อรูป…" : "บันทึกสินค้า"}
        </button>
      </div>
    </form>
  );
}
