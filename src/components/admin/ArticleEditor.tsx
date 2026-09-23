"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { FormRow, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  type ArticleFormState,
  type ArticleInput,
} from "@/actions/articles";
import { generateSeoMeta, calculateReadingTime, stripHtml } from "@/lib/utils";
import type { Article, PracticeArea, User } from "@/generated/prisma/client";

type Props = {
  article?: Article;
  practiceAreas: Pick<PracticeArea, "id" | "name">[];
  authors?: Pick<User, "id" | "name" | "title">[];
  canPublish: boolean;
  isAdmin: boolean;
};

export function ArticleEditor({ article, practiceAreas, authors, canPublish, isAdmin }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "<p></p>");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [practiceAreaId, setPracticeAreaId] = useState(article?.practiceAreaId ?? "");
  const [authorId, setAuthorId] = useState(article?.authorId ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? "");
  const [seoTouched, setSeoTouched] = useState(Boolean(article));
  const [state, setState] = useState<ArticleFormState>({});
  const [isPending, startTransition] = useTransition();

  function autoFillSeo() {
    const meta = generateSeoMeta(title || "Başlıksız Makale", content);
    setMetaTitle(meta.metaTitle);
    setMetaDescription(meta.metaDescription);
    setSeoTouched(true);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!seoTouched) {
      const meta = generateSeoMeta(value || "Başlıksız Makale", content);
      setMetaTitle(meta.metaTitle);
      setMetaDescription(meta.metaDescription || excerpt);
    }
  }

  function submit(status: "DRAFT" | "PUBLISHED") {
    const input: ArticleInput = {
      title,
      excerpt,
      content,
      coverImageUrl,
      practiceAreaId: practiceAreaId || undefined,
      metaTitle: metaTitle || generateSeoMeta(title, content).metaTitle,
      metaDescription: metaDescription || generateSeoMeta(title, content).metaDescription,
      status,
      authorId: isAdmin ? authorId || undefined : undefined,
    };

    startTransition(async () => {
      const result = article
        ? await updateArticleAction(article.id, input)
        : await createArticleAction(input);
      setState(result ?? {});
      if (!result?.errors && !result?.submitError) {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!article) return;
    if (!confirm("Bu makaleyi kalıcı olarak silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteArticleAction(article.id);
      router.push("/admin/makaleler");
    });
  }

  const readingTime = calculateReadingTime(content);
  const plainLength = stripHtml(content).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <FormRow label="Başlık" htmlFor="title" error={state.errors?.title}>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Makale başlığı"
          />
        </FormRow>

        <FormRow label="Özet" htmlFor="excerpt" error={state.errors?.excerpt} hint="Makale listelerinde gösterilir (maks. 300 karakter).">
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Makalenin kısa özeti..."
            maxLength={300}
          />
        </FormRow>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-navy">İçerik</p>
          <TiptapEditor content={content} onChange={setContent} />
          <p className="mt-1.5 text-xs text-foreground/40">
            {plainLength} karakter · Tahmini okuma süresi: {readingTime} dk
          </p>
          {state.errors?.content && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{state.errors.content}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-serif text-sm font-semibold text-navy">Yayın</h2>
          <div className="mt-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() => submit("DRAFT")}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Taslak Olarak Kaydet
            </Button>
            {canPublish && (
              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={isPending}
                onClick={() => submit("PUBLISHED")}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {article?.status === "PUBLISHED" ? "Güncelle" : "Yayımla"}
              </Button>
            )}
            {article && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50"
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Makaleyi Sil
              </Button>
            )}
          </div>
          {state.submitError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {state.submitError}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-serif text-sm font-semibold text-navy">Sınıflandırma</h2>
          <div className="mt-4 space-y-4">
            <FormRow label="Çalışma Alanı" htmlFor="practiceAreaId">
              <Select
                id="practiceAreaId"
                value={practiceAreaId}
                onChange={(e) => setPracticeAreaId(e.target.value)}
              >
                <option value="">Genel</option>
                {practiceAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </FormRow>
            {isAdmin && authors && authors.length > 0 && (
              <FormRow label="Yazar" htmlFor="authorId">
                <Select id="authorId" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                  <option value="">Ben</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.title} {author.name}
                    </option>
                  ))}
                </Select>
              </FormRow>
            )}
            <FormRow label="Kapak Görseli URL (opsiyonel)" htmlFor="coverImageUrl">
              <Input
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormRow>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-semibold text-navy">SEO Ayarları</h2>
            <button
              type="button"
              onClick={autoFillSeo}
              className="flex items-center gap-1.5 text-xs font-medium text-gold hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Otomatik Oluştur
            </button>
          </div>
          <p className="mt-1 text-xs text-foreground/40">
            Başlık girdiğinizde meta etiketleri otomatik önerilir; dilerseniz elle düzenleyin.
          </p>
          <div className="mt-4 space-y-4">
            <FormRow
              label="Meta Başlık"
              htmlFor="metaTitle"
              error={state.errors?.metaTitle}
              hint={`${metaTitle.length}/70`}
            >
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  setSeoTouched(true);
                }}
                maxLength={70}
              />
            </FormRow>
            <FormRow
              label="Meta Açıklama"
              htmlFor="metaDescription"
              error={state.errors?.metaDescription}
              hint={`${metaDescription.length}/170`}
            >
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value);
                  setSeoTouched(true);
                }}
                maxLength={170}
              />
            </FormRow>
          </div>
        </div>
      </div>
    </div>
  );
}
