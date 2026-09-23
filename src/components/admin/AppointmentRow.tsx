"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, Check } from "lucide-react";

import {
  updateAppointmentStatus,
  updateAppointmentNote,
  deleteAppointment,
} from "@/actions/appointments";
import { Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatDateTimeTR, formatDateTR } from "@/lib/utils";
import type { Appointment, AppointmentStatus, PracticeArea } from "@/generated/prisma/client";

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal Edildi",
  COMPLETED: "Tamamlandı",
};

const statusColors: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-700",
  COMPLETED: "bg-green-50 text-green-700",
};

type AppointmentWithArea = Appointment & { practiceArea: PracticeArea | null };

export function AppointmentRow({ appointment }: { appointment: AppointmentWithArea }) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(appointment.adminNote ?? "");
  const [noteSaved, setNoteSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-semibold text-navy">{appointment.fullName}</p>
          <p className="mt-1 text-sm text-foreground/60">
            <a href={`tel:${appointment.phone.replace(/\s+/g, "")}`} className="hover:text-navy">
              {appointment.phone}
            </a>
            {appointment.email && (
              <>
                {" · "}
                <a href={`mailto:${appointment.email}`} className="hover:text-navy">
                  {appointment.email}
                </a>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            {appointment.practiceArea?.name ?? "Genel"} · Talep: {formatDateTimeTR(appointment.createdAt)}
            {appointment.preferredDate &&
              ` · Tercih edilen: ${formatDateTR(appointment.preferredDate)}${
                appointment.preferredTime ? ` ${appointment.preferredTime}` : ""
              }`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[appointment.status]}`}>
            {statusLabels[appointment.status]}
          </span>
          <Select
            className="w-auto py-1.5 text-xs"
            value={appointment.status}
            disabled={isPending}
            onChange={(event) => {
              const value = event.target.value as AppointmentStatus;
              startTransition(() => updateAppointmentStatus(appointment.id, value));
            }}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-navy/40" />}
          <button
            type="button"
            aria-label="Randevuyu sil"
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
            onClick={() => {
              if (confirm("Bu randevu talebini silmek istediğinize emin misiniz?")) {
                startTransition(() => deleteAppointment(appointment.id));
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {appointment.message && (
        <p className="mt-3 rounded-lg bg-cream px-3.5 py-2.5 text-sm text-foreground/70">
          {appointment.message}
        </p>
      )}

      <div className="mt-3 flex items-start gap-2">
        <Textarea
          className="min-h-16 text-sm"
          placeholder="Dahili not ekleyin (müvekkile görünmez)..."
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteSaved(false);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            startTransition(async () => {
              await updateAppointmentNote(appointment.id, note);
              setNoteSaved(true);
            })
          }
        >
          {noteSaved ? <Check className="h-3.5 w-3.5" /> : "Notu Kaydet"}
        </Button>
      </div>
    </div>
  );
}
