"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { MAX_IMAGE_BYTES } from "@/lib/image-type";
import { IceIcon } from "../icons";

type Props = {
  /** ชื่อช่องไฟล์ในฟอร์ม เช่น "image" */
  name: string;
  /** ชื่อช่อง checkbox "ลบรูปเดิม" เช่น "removeImage" */
  removeName: string;
  label: string;
  hint?: string;
  currentUrl: string | null;
  error?: string;
  /** QR: ย่อน้อยกว่าและคงไฟล์ PNG ไว้ให้คมชัด / logo: คงไฟล์ PNG (พื้นใส) ย่อเหลือไม่เกิน 512px */
  variant?: "photo" | "qr" | "logo";
  /** แจ้งฟอร์มแม่ว่ากำลังย่อรูปอยู่ (ให้ปิดปุ่มบันทึกชั่วคราว) */
  onBusyChange?: (busy: boolean) => void;
};

/**
 * เลือกรูป → ย่อในเบราว์เซอร์ → ใส่ไฟล์ที่ย่อแล้วกลับเข้าช่อง <input type="file">
 * ฟอร์มจึงส่งไฟล์เล็กไปที่ server ตามปกติ (server ตรวจชนิด/ขนาดไฟล์ซ้ำอีกชั้น)
 */
export default function ImagePicker({
  name,
  removeName,
  label,
  hint,
  currentUrl,
  error,
  variant = "photo",
  onBusyChange,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // คืนหน่วยความจำของรูปพรีวิวเมื่อเปลี่ยนรูป/ออกจากหน้า
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setLocalError(null);
    if (!file) {
      setPreview(null);
      return;
    }

    setBusy(true);
    onBusyChange?.(true);
    try {
      const compressed = await compressImage(
        file,
        variant === "qr"
          ? { maxDimension: 1200, quality: 0.92, keepPng: true }
          : variant === "logo"
            ? { maxDimension: 512, quality: 0.92, keepPng: true }
            : { maxDimension: 1600, quality: 0.85 },
      );
      if (compressed.size > MAX_IMAGE_BYTES) {
        throw new Error("too large");
      }
      const transfer = new DataTransfer();
      transfer.items.add(compressed);
      input.files = transfer.files;
      setPreview(URL.createObjectURL(compressed));
      setRemove(false);
    } catch {
      input.value = "";
      setPreview(null);
      setLocalError("อ่านรูปนี้ไม่ได้ หรือรูปใหญ่เกินไป กรุณาเลือกรูป JPG หรือ PNG");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setLocalError(null);
  }

  const shownUrl = preview ?? (remove ? null : currentUrl);
  const message = localError ?? error;

  return (
    <div>
      <p id={`${id}-label`} className="block font-semibold text-blue-950">
        {label} <span className="font-normal text-slate-500">(ไม่บังคับ)</span>
      </p>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div
          className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-sky-50 ${
            variant === "qr" ? "size-32" : "size-28"
          }`}
        >
          {shownUrl ? (
            // unoptimized: รองรับรูปพรีวิวจากไฟล์ในเครื่อง (blob:) และแสดงรูปตามจริง
            <Image src={shownUrl} alt="" fill unoptimized className="object-contain" />
          ) : (
            <IceIcon className="size-10 text-sky-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label
            htmlFor={id}
            className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-600"
          >
            {busy ? "กำลังย่อรูป…" : shownUrl ? "เปลี่ยนรูป" : "เลือกรูป"}
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={handleChange}
              aria-describedby={message ? `${id}-error` : undefined}
              aria-labelledby={`${id}-label`}
              className="sr-only"
            />
          </label>

          {preview && (
            <button
              type="button"
              onClick={clearSelection}
              className="block text-sm font-semibold text-slate-600 underline"
            >
              ยกเลิกรูปที่เลือก
            </button>
          )}

          {currentUrl && !preview && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name={removeName}
                checked={remove}
                onChange={(e) => setRemove(e.target.checked)}
                className="size-5 accent-red-600"
              />
              ลบรูปเดิม
            </label>
          )}
          <p className="text-xs text-slate-500">JPG, PNG หรือ WebP · ระบบย่อรูปให้อัตโนมัติ</p>
        </div>
      </div>

      {message && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}
