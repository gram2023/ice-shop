"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/admin/login/actions";
import { Field, inputClass } from "../form-fields";
import { AlertIcon } from "../icons";

const initialState: SignInState = { error: null, email: "" };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field id="admin-email" label="อีเมล">
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={state.email}
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className={inputClass(hasError)}
        />
      </Field>

      <Field id="admin-password" label="รหัสผ่าน">
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className={inputClass(hasError)}
        />
      </Field>

      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-6 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400"
      >
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
