"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { toSlug, calculateReadingTime } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı."),
  excerpt: z.string().trim().min(10, "Özet en az 10 karakter olmalı.").max(300, "Özet en fazla 300 karakter olabilir."),
  content: z.string().trim().min(20, "İçerik en az 20 karakter olmalı."),
  coverImageUrl: z
    .string()
    .trim()
    .url("Geçerli bir görsel adresi girin.")
    .optional()
    .or(z.literal("")),
  practiceAreaId: z.string().optional(),
  metaTitle: z.string().trim().min(5, "Meta başlık en az 5 karakter olmalı.").max(70, "Meta başlık en fazla 70 karakter olabilir."),
  metaDescription: z
    .string()
    .trim()
    .min(10, "Meta açıklama en az 10 karakter olmalı.")
    .max(170, "Meta açıklama en fazla 170 karakter olabilir."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  authorId: z.string().optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;
export type ArticleFormState = {
  errors?: Partial<Record<keyof ArticleInput, string>>;
  submitError?: string;
};

function collectErrors(issues: z.core.$ZodIssue[]) {
  const errors: ArticleFormState["errors"] = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof NonNullable<ArticleFormState["errors"]>;
    errors[key] = issue.message;
  }
  return errors;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "makale";
  let suffix = 2;
   
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createArticleAction(input: ArticleInput): Promise<ArticleFormState> {
  const session = await requireSession();
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) return { errors: collectErrors(parsed.error.issues) };

  const data = parsed.data;
  const authorId = session.role === "ADMIN" && data.authorId ? data.authorId : session.userId;
  const slug = await uniqueSlug(toSlug(data.title));

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      status: data.status,
      readingTimeMinutes: calculateReadingTime(data.content),
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId,
      practiceAreaId: data.practiceAreaId || null,
    },
  });

  revalidatePath("/admin/makaleler");
  revalidatePath("/makaleler");
  revalidatePath("/");
  redirect(`/admin/makaleler/${article.id}`);
}

export async function updateArticleAction(
  id: string,
  input: ArticleInput,
): Promise<ArticleFormState> {
  const session = await requireSession();
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { submitError: "Makale bulunamadı." };
  if (session.role !== "ADMIN" && existing.authorId !== session.userId) {
    return { submitError: "Bu makaleyi düzenleme yetkiniz yok." };
  }

  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) return { errors: collectErrors(parsed.error.issues) };

  const data = parsed.data;
  const authorId =
    session.role === "ADMIN" && data.authorId ? data.authorId : existing.authorId;

  await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      status: data.status,
      readingTimeMinutes: calculateReadingTime(data.content),
      publishedAt: existing.publishedAt ?? (data.status === "PUBLISHED" ? new Date() : null),
      authorId,
      practiceAreaId: data.practiceAreaId || null,
    },
  });

  revalidatePath("/admin/makaleler");
  revalidatePath(`/admin/makaleler/${id}`);
  revalidatePath("/makaleler");
  revalidatePath(`/makaleler/${existing.slug}`);
  revalidatePath("/");
  return {};
}

export async function deleteArticleAction(id: string) {
  const session = await requireSession();
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return;
  if (session.role !== "ADMIN" && existing.authorId !== session.userId) {
    throw new Error("Bu makaleyi silme yetkiniz yok.");
  }
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/makaleler");
  revalidatePath("/makaleler");
  revalidatePath("/");
}
