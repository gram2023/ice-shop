"use server";

import { redirect } from "next/navigation";
import { safeAdminPath } from "@/lib/admin/safe-path";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  error: string | null;
  email: string;
};

const WRONG_CREDENTIALS = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

/** เข้าสู่ระบบแอดมินด้วยอีเมล + รหัสผ่าน (Supabase Auth) */
export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeAdminPath(formData.get("next"));

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน", email };
  }
  if (email.length > 254 || password.length > 200) {
    return { error: WRONG_CREDENTIALS, email };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // ไม่บันทึกอีเมล/รหัสผ่านลง log และไม่บอกว่าผิดที่ช่องไหน
      console.error("[signIn]", error.status, error.code);
      return {
        error:
          error.status === 429
            ? "พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่"
            : WRONG_CREDENTIALS,
        email,
      };
    }
  } catch (err) {
    console.error("[signIn]", err instanceof Error ? err.message : "unknown error");
    return { error: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", email };
  }

  // redirect ต้องอยู่นอก try (ตามเอกสาร Next.js)
  redirect(next);
}
