"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { createAppointmentAction, type AppointmentFormState } from "@/actions/appointments";
import { FormRow, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { PracticeArea } from "@/generated/prisma/client";

const initialState: AppointmentFormState = {};

export function AppointmentForm({
  practiceAreas,
  defaultPracticeAreaId,
}: {
  practiceAreas: Pick<PracticeArea, "id" | "name">[];
  defaultPracticeAreaId?: string;
}) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Ad Soyad" htmlFor="fullName" error={state.errors?.fullName}>
          <Input id="fullName" name="fullName" required placeholder="Adınız Soyadınız" />
        </FormRow>
        <FormRow label="Telefon" htmlFor="phone" error={state.errors?.phone}>
          <Input id="phone" name="phone" required placeholder="05XX XXX XX XX" />
        </FormRow>
      </div>

      <FormRow
        label="E-posta (opsiyonel)"
        htmlFor="email"
        error={state.errors?.email}
      >
        <Input id="email" name="email" type="email" placeholder="ornek@eposta.com" />
      </FormRow>

      <FormRow label="İlgilendiğiniz Alan" htmlFor="practiceAreaId">
        <Select id="practiceAreaId" name="practiceAreaId" defaultValue={defaultPracticeAreaId ?? ""}>
          <option value="">Belirtmek istemiyorum</option>
          {practiceAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </Select>
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Tercih Ettiğiniz Tarih (opsiyonel)" htmlFor="preferredDate">
          <Input id="preferredDate" name="preferredDate" type="date" />
        </FormRow>
        <FormRow label="Tercih Ettiğiniz Saat (opsiyonel)" htmlFor="preferredTime">
          <Input id="preferredTime" name="preferredTime" type="time" />
        </FormRow>
      </div>

      <FormRow label="Mesajınız (opsiyonel)" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          placeholder="Hukuki talebinizi kısaca özetleyin..."
        />
      </FormRow>

      {state.submitError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.submitError}</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Randevu Talebi Gönder
        {!pending && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-xs text-foreground/50">
        Bu formu göndererek, tarafımıza ilettiğiniz kişisel verilerin randevu talebinizin
        değerlendirilmesi amacıyla işlenmesini kabul etmiş olursunuz.
      </p>
    </form>
  );
}
