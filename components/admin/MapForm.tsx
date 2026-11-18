"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { saveMap, type ProfileFormState } from "@/app/admin/settings/profile-actions";
import type { MapField } from "@/lib/admin/map-input";
import { extractMapEmbedSrc } from "@/lib/map-url";
import { describedBy, Field, inputClass } from "../form-fields";
import { MapPinIcon } from "../icons";
import SaveBar from "./SaveBar";

type State = ProfileFormState<MapField>;
const initialState: State = { errors: {}, message: null, saved: false };
const sectionClass = "space-y-4 rounded-2xl border border-slate-200 bg-white p-5";

type Props = {
  /** ลิงก์ฝังที่หน้าร้านใช้อยู่ (null = ไม่แสดงแผนที่) */
  embedUrl: string | null;
  /** ลิงก์นำทางที่บันทึกไว้จริง (null = ค้นหาจากชื่อร้าน + ที่อยู่) */
  savedLinkUrl: string | null;
  /** ลิงก์นำทางที่หน้าร้านใช้อยู่ตอนนี้ (ให้แอดมินกดทดลอง) */
  currentLinkUrl: string;
};

/** ฟอร์มแผนที่ร้าน: วางโค้ดฝังจาก Google Maps + ลิงก์นำทาง (ดูตัวอย่างก่อนบันทึกได้) */
export default function MapForm({ embedUrl, savedLinkUrl, currentLinkUrl }: Props) {
  const [state, dispatch, pending] = useActionState(saveMap, initialState);
  const [embed, setEmbed] = useState(embedUrl ?? "");
  const errors = state.errors;
  const preview = embed.trim() ? extractMapEmbedSrc(embed) : null;

  useEffect(() => {
    const first = (["mapEmbed", "mapLink"] as const).find((f) => errors[f]);
    if (first) document.getElementById(`map-${first}`)?.focus();
  }, [errors]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section aria-labelledby="map-embed-heading" className={sectionClass}>
        <div>
          <h2 id="map-embed-heading" className="text-lg font-bold text-slate-900">
            แผนที่ร้าน
          </h2>
          <p className="text-sm text-slate-500">แสดงในหน้าแรกและหน้าติดต่อเรา</p>
        </div>

        <div className="rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-blue-950">วิธีเอาโค้ดแผนที่</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>เปิด Google Maps บนคอมพิวเตอร์ แล้วค้นหาร้าน (หรือคลิกตำแหน่งร้านบนแผนที่)</li>
            <li>กด “แชร์” แล้วเลือกแท็บ “ฝังแผนที่”</li>
            <li>กด “คัดลอก HTML” แล้ววางในช่องด้านล่าง</li>
          </ol>
          <p className="mt-2 text-slate-500">
            แอป Google Maps ในมือถือไม่มีเมนูฝังแผนที่ ให้ใช้คอมพิวเตอร์ หรือเปิดเว็บ Google Maps
            ในเบราว์เซอร์แบบ “เว็บไซต์เดสก์ท็อป”
          </p>
        </div>

        <Field
          id="map-mapEmbed"
          label="โค้ดฝังแผนที่"
          optional
          hint="วางโค้ดที่ขึ้นต้นด้วย <iframe ทั้งก้อนได้เลย · เว้นว่าง = ไม่แสดงแผนที่ (ยังมีปุ่มนำทาง)"
          error={errors.mapEmbed}
        >
          <textarea
            id="map-mapEmbed"
            name="mapEmbed"
            rows={4}
            value={embed}
            onChange={(e) => setEmbed(e.target.value)}
            maxLength={4000}
            spellCheck={false}
            aria-invalid={Boolean(errors.mapEmbed)}
            aria-describedby={describedBy("map-mapEmbed", errors.mapEmbed, true)}
            className={`${inputClass(Boolean(errors.mapEmbed))} font-mono text-sm`}
          />
        </Field>

        <div>
          <p className="text-sm font-semibold text-slate-700">ตัวอย่าง</p>
          {preview ? (
            <div className="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <iframe
                src={preview}
                title="ตัวอย่างแผนที่ร้าน"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full border-0 sm:aspect-video"
              />
            </div>
          ) : (
            <p
              className={`mt-1 rounded-xl p-3 text-sm ${
                embed.trim() ? "bg-amber-50 font-medium text-amber-800" : "bg-slate-50 text-slate-500"
              }`}
            >
              {embed.trim()
                ? "ยังไม่ใช่โค้ดฝังแผนที่ของ Google Maps (ต้องคัดลอกจากเมนู “ฝังแผนที่”)"
                : "ไม่แสดงแผนที่"}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="map-link-heading" className={sectionClass}>
        <div>
          <h2 id="map-link-heading" className="text-lg font-bold text-slate-900">
            ปุ่มนำทาง
          </h2>
          <p className="text-sm text-slate-500">
            ลูกค้ากดปุ่ม “นำทางด้วย Google Maps” แล้วเปิดลิงก์นี้
          </p>
        </div>
        <Field
          id="map-mapLink"
          label="ลิงก์นำทาง"
          optional
          hint="ใน Google Maps (มือถือก็ได้) กด แชร์ → คัดลอกลิงก์ · เว้นว่าง = ค้นหาจากชื่อร้านและที่อยู่"
          error={errors.mapLink}
        >
          <input
            id="map-mapLink"
            name="mapLink"
            type="url"
            defaultValue={savedLinkUrl ?? ""}
            maxLength={500}
            placeholder="https://maps.app.goo.gl/..."
            autoComplete="off"
            aria-invalid={Boolean(errors.mapLink)}
            aria-describedby={describedBy("map-mapLink", errors.mapLink, true)}
            className={inputClass(Boolean(errors.mapLink))}
          />
        </Field>
        <a
          href={currentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <MapPinIcon className="size-5" />
          ทดลองกดปุ่มนำทางที่ใช้อยู่ตอนนี้ (เปิดแท็บใหม่)
        </a>
      </section>

      <SaveBar message={state.message} saved={state.saved} pending={pending} label="บันทึกแผนที่" />
    </form>
  );
}
