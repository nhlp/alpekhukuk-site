"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { toSlug } from "@/lib/utils";

const createUserSchema = z.object({
  name: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı."),
  title: z.string().trim().min(2, "Unvan gerekli.").max(20),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
  role: z.enum(["ADMIN", "LAWYER"]),
});

export type UserFormState = {
  errors?: Partial<Record<keyof z.infer<typeof createUserSchema>, string>>;
  submitError?: string;
};

async function uniqueUserSlug(base: string) {
  let slug = base || "avukat";
  let suffix = 2;
   
  while (true) {
    const existing = await prisma.user.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: UserFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<UserFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) {
    return { errors: { email: "Bu e-posta adresi zaten kayıtlı." } };
  }

  const slug = await uniqueUserSlug(toSlug(data.name));
  const passwordHash = await hashPassword(data.password);
  const memberCount = await prisma.user.count();

  await prisma.user.create({
    data: {
      name: data.name,
      title: data.title,
      email: data.email,
      passwordHash,
      role: data.role,
      slug,
      order: memberCount,
    },
  });

  revalidatePath("/admin/ayarlar");
  revalidatePath("/avukatlarimiz");
  return {};
}

export async function toggleUserActiveAction(id: string, active: boolean) {
  const session = await requireAdmin();
  if (session.userId === id) return;
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/admin/ayarlar");
  revalidatePath("/avukatlarimiz");
}

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
});

export async function resetUserPasswordAction(id: string, password: string) {
  await requireAdmin();
  const parsed = resetPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Geçersiz şifre.");
  }
  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}
