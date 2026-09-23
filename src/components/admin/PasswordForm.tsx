"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";

import { changePasswordAction, type PasswordFormState } from "@/actions/profile";
import { FormRow, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: PasswordFormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormRow
        label="Mevcut Şifre"
        htmlFor="currentPassword"
        error={state.errors?.currentPassword}
      >
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </FormRow>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Yeni Şifre" htmlFor="newPassword" error={state.errors?.newPassword}>
          <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
        </FormRow>
        <FormRow
          label="Yeni Şifre (Tekrar)"
          htmlFor="confirmPassword"
          error={state.errors?.confirmPassword}
        >
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        </FormRow>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Şifreyi Güncelle
        </Button>
        {state.success && (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Şifre güncellendi
          </span>
        )}
      </div>
    </form>
  );
}
