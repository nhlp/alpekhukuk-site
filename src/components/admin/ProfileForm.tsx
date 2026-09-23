"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";

import { updateProfileAction, type ProfileFormState } from "@/actions/profile";
import { FormRow, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { User } from "@/generated/prisma/client";

const initialState: ProfileFormState = {};

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Ad Soyad" htmlFor="name" error={state.errors?.name}>
          <Input id="name" name="name" defaultValue={user.name} required />
        </FormRow>
        <FormRow label="Unvan" htmlFor="title" error={state.errors?.title}>
          <Input id="title" name="title" defaultValue={user.title} required />
        </FormRow>
      </div>

      <FormRow label="Hakkında / Biyografi" htmlFor="bio" error={state.errors?.bio}>
        <Textarea id="bio" name="bio" defaultValue={user.bio} className="min-h-40" />
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Telefon (opsiyonel)" htmlFor="phone" error={state.errors?.phone}>
          <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
        </FormRow>
        <FormRow
          label="LinkedIn (opsiyonel)"
          htmlFor="linkedinUrl"
          error={state.errors?.linkedinUrl}
        >
          <Input id="linkedinUrl" name="linkedinUrl" defaultValue={user.linkedinUrl ?? ""} />
        </FormRow>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Kaydet
        </Button>
        {state.success && (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Kaydedildi
          </span>
        )}
      </div>
    </form>
  );
}
