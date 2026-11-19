"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { saveHomeImage, type ProfileFormState } from "@/app/admin/settings/profile-actions";
import { HOME_IMAGE_INFO, type HomeImageSlot } from "@/lib/home-images";
import ImagePicker from "./ImagePicker";
import SaveBar from "./SaveBar";

const initialState: ProfileFormState<"image"> = { errors: {}, message: null, saved: false };

/** การ์ดรูป 1 ช่อง (เลือกรูป / ลบรูปเดิม / บันทึกแยกทีละรูป) */
export default function HomeImageForm({
  slot,
  currentUrl,
}: {
  slot: HomeImageSlot;
  currentUrl: string | null;
}) {
  const info = HOME_IMAGE_INFO[slot];
  const [state, dispatch, pending] = useActionState(saveHomeImage, initialState);
  const [busy, setBusy] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || busy) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="slot" value={slot} />
      <ImagePicker
        // บันทึกแล้วลิงก์รูปเปลี่ยน → ล้างรูปที่เลือกค้างไว้ (กันอัปโหลดซ้ำ)
        key={currentUrl ?? "no-image"}
        name="image"
        removeName="removeImage"
        label={info.label}
        hint={info.hint}
        currentUrl={currentUrl}
        error={state.errors.image}
        variant={info.variant}
        onBusyChange={setBusy}
      />
      <SaveBar
        message={state.message}
        saved={state.saved}
        pending={pending}
        busy={busy}
        label="บันทึกรูปนี้"
      />
    </form>
  );
}
