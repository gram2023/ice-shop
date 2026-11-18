"use client";

import { startTransition, useActionState, useEffect, type FormEvent } from "react";
import { saveShopInfo, type ProfileFormState } from "@/app/admin/settings/profile-actions";
import {
  SHOP_INFO_FIELDS,
  SHOP_INFO_LIMITS,
  type ShopInfoField,
} from "@/lib/admin/shop-info-input";
import type { ShopProfile } from "@/lib/shop-profile";
import { describedBy, Field, inputClass } from "../form-fields";
import SaveBar from "./SaveBar";

type State = ProfileFormState<ShopInfoField>;
const initialState: State = { errors: {}, message: null, saved: false };
const fieldId = (field: ShopInfoField) => `shop-${field}`;
const sectionClass = "space-y-4 rounded-2xl border border-slate-200 bg-white p-5";

type FieldOptions = {
  hint?: string;
  optional?: boolean;
  type?: "text" | "tel" | "url";
  rows?: number;
};

type Props = {
  profile: ShopProfile;
  /** ลิงก์ LINE ที่บันทึกไว้จริง (null = สร้างจาก LINE ID อัตโนมัติ) */
  savedLineUrl: string | null;
};

/** ฟอร์มข้อมูลร้าน: ชื่อ คำโปรย คำอธิบาย ที่อยู่ เบอร์โทร LINE Facebook */
export default function ShopInfoForm({ profile, savedLineUrl }: Props) {
  const [state, dispatch, pending] = useActionState(saveShopInfo, initialState);
  const errors = state.errors;

  useEffect(() => {
    const first = SHOP_INFO_FIELDS.find((f) => errors[f]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }, [errors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  const field = (name: ShopInfoField, label: string, defaultValue: string, opt: FieldOptions = {}) => {
    const id = fieldId(name);
    const common = {
      id,
      name,
      defaultValue,
      maxLength: SHOP_INFO_LIMITS[name],
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy(id, errors[name], Boolean(opt.hint)),
      className: inputClass(Boolean(errors[name])),
    };
    return (
      <Field id={id} label={label} hint={opt.hint} optional={opt.optional} error={errors[name]}>
        {opt.rows ? (
          <textarea {...common} rows={opt.rows} />
        ) : (
          <input
            {...common}
            type={opt.type ?? "text"}
            inputMode={opt.type === "tel" ? "tel" : undefined}
            autoComplete="off"
          />
        )}
      </Field>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section aria-labelledby="shop-info-heading" className={sectionClass}>
        <h2 id="shop-info-heading" className="text-lg font-bold text-slate-900">
          ข้อมูลร้าน
        </h2>
        {field("name", "ชื่อร้าน", profile.name, { hint: "แสดงที่หัวเว็บ ส่วนท้าย และชื่อแท็บเบราว์เซอร์" })}
        {field("tagline", "คำโปรย", profile.tagline, {
          hint: "ข้อความสั้น ๆ ใต้ชื่อร้านในหน้าแรก และในผลค้นหา Google",
        })}
        {field("description", "คำอธิบายร้าน", profile.description, {
          hint: "แสดงในส่วน “เกี่ยวกับร้าน” หน้าแรก",
          rows: 4,
        })}
        {field("address", "ที่อยู่ร้าน", profile.address, { rows: 2 })}
        {field("phone", "เบอร์โทรร้าน", profile.phone, {
          type: "tel",
          hint: "ใส่เบอร์เดียว ลูกค้ากดโทรจากเว็บได้ เช่น 081-234-5678",
        })}
      </section>

      <section aria-labelledby="shop-contact-heading" className={sectionClass}>
        <div>
          <h2 id="shop-contact-heading" className="text-lg font-bold text-slate-900">
            LINE และ Facebook
          </h2>
          <p className="text-sm text-slate-500">เว้นว่าง = ไม่แสดงปุ่มนั้นบนเว็บ</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("lineId", "LINE ID", profile.lineId ?? "", {
            optional: true,
            hint: "บัญชีร้าน (LINE OA) ใส่ @ ข้างหน้า เช่น @iceexpress",
          })}
          {field("lineUrl", "ลิงก์ LINE", savedLineUrl ?? "", {
            optional: true,
            type: "url",
            hint: "เว้นว่างได้ ระบบสร้างจาก LINE ID ให้ · ใส่เองถ้ามีลิงก์ lin.ee",
          })}
          {field("facebookName", "ชื่อเพจ Facebook", profile.facebookName ?? "", {
            optional: true,
            hint: "เว้นว่าง = ใช้ชื่อร้าน",
          })}
          {field("facebookUrl", "ลิงก์เพจ Facebook", profile.facebookUrl ?? "", {
            optional: true,
            type: "url",
            hint: "เช่น https://www.facebook.com/ชื่อเพจ",
          })}
        </div>
      </section>

      <SaveBar message={state.message} saved={state.saved} pending={pending} label="บันทึกข้อมูลร้าน" />
    </form>
  );
}
