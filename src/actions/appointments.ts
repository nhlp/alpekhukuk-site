"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import type { AppointmentStatus } from "@/generated/prisma/client";

const appointmentSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı."),
  phone: z.string().trim().min(10, "Geçerli bir telefon numarası girin."),
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta adresi girin.")
    .optional()
    .or(z.literal("")),
  practiceAreaId: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  message: z.string().trim().max(2000).optional(),
});

export type AppointmentFormState = {
  errors?: Partial<Record<keyof z.infer<typeof appointmentSchema>, string>>;
  submitError?: string;
};

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: AppointmentFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<AppointmentFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;

  try {
    await prisma.appointment.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        message: data.message || null,
        practiceAreaId: data.practiceAreaId || null,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredTime: data.preferredTime || null,
      },
    });
  } catch {
    return { submitError: "Randevu talebiniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  redirect("/randevu-al/tesekkurler");
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await requireSession();
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}

export async function updateAppointmentNote(id: string, adminNote: string) {
  await requireSession();
  await prisma.appointment.update({ where: { id }, data: { adminNote } });
  revalidatePath("/admin/randevular");
}

export async function deleteAppointment(id: string) {
  await requireSession();
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin");
}
