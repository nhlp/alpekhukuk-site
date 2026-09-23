"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";

import {
  createPracticeAreaAction,
  updatePracticeAreaAction,
  deletePracticeAreaAction,
  type PracticeAreaFormState,
} from "@/actions/practice-areas";
import { FormRow, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PracticeAreaIcon, iconOptions } from "@/components/site/PracticeAreaIcon";
import { cn } from "@/lib/utils";
import type { PracticeArea } from "@/generated/prisma/client";

const emptyState: PracticeAreaFormState = {};

function AreaFields({
  area,
  state,
}: {
  area?: PracticeArea;
  state: PracticeAreaFormState;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px_90px]">
        <FormRow label="Alan Adı" htmlFor="name" error={state.errors?.name}>
          <Input id="name" name="name" defaultValue={area?.name} required />
        </FormRow>
        <FormRow label="İkon" htmlFor="icon">
          <Select id="icon" name="icon" defaultValue={area?.icon ?? "scale"}>
            {iconOptions.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="Sıra" htmlFor="order">
          <Input id="order" name="order" type="number" defaultValue={area?.order ?? 0} min={0} />
        </FormRow>
      </div>
      <FormRow
        label="Kısa Açıklama"
        htmlFor="shortDescription"
        error={state.errors?.shortDescription}
        hint="Kartlarda ve meta açıklamada kullanılır."
      >
        <Textarea id="shortDescription" name="shortDescription" defaultValue={area?.shortDescription} maxLength={220} required />
      </FormRow>
      <FormRow label="Detay İçeriği (HTML, opsiyonel)" htmlFor="content">
        <Textarea id="content" name="content" defaultValue={area?.content} className="min-h-32 font-mono text-xs" />
      </FormRow>
    </>
  );
}

function EditAreaRow({ area }: { area: PracticeArea }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const boundAction = updatePracticeAreaAction.bind(null, area.id);
  const [state, formAction, pending] = useActionState(boundAction, emptyState);

  return (
    <div className="rounded-xl border border-line bg-cream">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-3">
          <PracticeAreaIcon icon={area.icon} className="h-4 w-4 text-navy" />
          <span className="text-sm font-medium text-navy">{area.name}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-navy/50 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">
          <form action={formAction} className="space-y-4">
            <AreaFields area={area} state={state} />
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={pending}>
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Güncelle
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                disabled={isPending}
                onClick={() => {
                  if (confirm(`"${area.name}" alanını silmek istediğinize emin misiniz?`)) {
                    startTransition(() => deletePracticeAreaAction(area.id));
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Sil
              </Button>
              {state.submitError && (
                <span className="text-xs text-red-600">{state.submitError}</span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function PracticeAreasManager({ areas }: { areas: PracticeArea[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [createState, createFormAction, createPending] = useActionState(
    createPracticeAreaAction,
    emptyState,
  );

  return (
    <div className="space-y-3">
      {areas.map((area) => (
        <EditAreaRow key={area.id} area={area} />
      ))}

      {showCreate ? (
        <div className="rounded-xl border border-dashed border-navy/30 bg-white p-4">
          <form action={createFormAction} className="space-y-4">
            <AreaFields state={createState} />
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={createPending}>
                {createPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Ekle
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                Vazgeç
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Yeni Çalışma Alanı Ekle
        </Button>
      )}
    </div>
  );
}
