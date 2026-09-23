"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const settingsSchema = z.object({
  address: z.string().trim().min(5, "Adres gerekli."),
  phone: z.string().trim().min(7, "Geçerli bir telefon numarası girin."),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  workingHours: z.string().trim().min(3, "Çalışma saatleri gerekli."),
  mapEmbedUrl: z.string().trim().url("Geçerli bir harita bağlantısı girin.").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("Geçerli bir Instagram bağlantısı girin.").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Geçerli bir LinkedIn bağlantısı girin.").optional().or(z.literal("")),
  heroSubtitle: z.string().trim().min(5, "Ana sayfa alt başlığı gerekli."),
  aboutText: z.string().trim().optional(),
});

export type SettingsFormState = {
  errors?: Partial<Record<keyof z.infer<typeof settingsSchema>, string>>;
  success?: boolean;
};

export async function updateSiteSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: SettingsFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<SettingsFormState["errors"]>;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const normalized = {
    ...data,
    mapEmbedUrl: data.mapEmbedUrl || null,
    instagramUrl: data.instagramUrl || null,
    linkedinUrl: data.linkedinUrl || null,
    aboutText: data.aboutText || "",
  };
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main", ...normalized },
    update: normalized,
  });

  revalidatePath("/", "layout");
  return { success: true };
}
