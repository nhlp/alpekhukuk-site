"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toSlug } from "@/lib/utils";
import { iconOptions } from "@/components/site/PracticeAreaIcon";

const areaSchema = z.object({
  name: z.string().trim().min(2, "Alan adı gerekli."),
  shortDescription: z.string().trim().min(10, "Kısa açıklama en az 10 karakter olmalı.").max(220),
  content: z.string().trim().optional(),
  icon: z.enum(iconOptions as [string, ...string[]]),
  order: z.coerce.number().int().min(0),
});

export type PracticeAreaFormState = {
  errors?: Partial<Record<keyof z.infer<typeof areaSchema>, string>>;
  submitError?: string;
};

async function uniqueAreaSlug(base: string, ignoreId?: string) {
  let slug = base || "alan";
  let suffix = 2;
   
  while (true) {
    const existing = await prisma.practiceArea.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createPracticeAreaAction(
  _prevState: PracticeAreaFormState,
  formData: FormData,
): Promise<PracticeAreaFormState> {
  await requireAdmin();
  const parsed = areaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: PracticeAreaFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<PracticeAreaFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const slug = await uniqueAreaSlug(toSlug(data.name));

  await prisma.practiceArea.create({
    data: { ...data, content: data.content || "", slug },
  });

  revalidatePath("/admin/ayarlar");
  revalidatePath("/calisma-alanlari");
  revalidatePath("/");
  return {};
}

export async function updatePracticeAreaAction(
  id: string,
  _prevState: PracticeAreaFormState,
  formData: FormData,
): Promise<PracticeAreaFormState> {
  await requireAdmin();
  const parsed = areaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: PracticeAreaFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<PracticeAreaFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const existing = await prisma.practiceArea.findUnique({ where: { id } });
  if (!existing) return { submitError: "Çalışma alanı bulunamadı." };

  await prisma.practiceArea.update({
    where: { id },
    data: { ...data, content: data.content || "" },
  });

  revalidatePath("/admin/ayarlar");
  revalidatePath("/calisma-alanlari");
  revalidatePath(`/calisma-alanlari/${existing.slug}`);
  revalidatePath("/");
  return {};
}

export async function deletePracticeAreaAction(id: string) {
  await requireAdmin();
  await prisma.practiceArea.delete({ where: { id } });
  revalidatePath("/admin/ayarlar");
  revalidatePath("/calisma-alanlari");
  revalidatePath("/");
}
