"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction, type LoginFormState } from "@/actions/auth";
import { FormRow, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormRow label="E-posta" htmlFor="email">
        <Input id="email" name="email" type="email" required autoFocus placeholder="ornek@alpekhukuk.com.tr" />
      </FormRow>
      <FormRow label="Şifre" htmlFor="password">
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </FormRow>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Giriş Yap
      </Button>
    </form>
  );
}
