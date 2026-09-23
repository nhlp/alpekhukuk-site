"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession, hashPassword, verifyPassword } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı."),
  title: z.string().trim().min(2, "Unvan gerekli.").max(20),
  bio: z.string().trim().max(2000).optional(),
  phone: z.string().trim().max(30).optional(),
  photoUrl: z.string().trim().url("Geçerli bir görsel adresi girin.").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Geçerli bir LinkedIn adresi girin.").optional().or(z.literal("")),
});

export type ProfileFormState = {
  errors?: Partial<Record<keyof z.infer<typeof profileSchema>, string>>;
  success?: boolean;
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireSession();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: ProfileFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ProfileFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: data.name,
      title: data.title,
      bio: data.bio || "",
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      linkedinUrl: data.linkedinUrl || null,
    },
  });

  revalidatePath("/admin/profilim");
  revalidatePath("/avukatlarimiz");
  return { success: true };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin."),
    newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı."),
    confirmPassword: z.string().min(1, "Şifre tekrarını girin."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type PasswordFormState = {
  errors?: Partial<Record<keyof z.infer<typeof passwordSchema>, string>>;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await requireSession();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: PasswordFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<PasswordFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { errors: { currentPassword: "Mevcut şifreniz hatalı." } };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });

  return { success: true };
}
