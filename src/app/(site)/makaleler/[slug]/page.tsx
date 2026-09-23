import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { ArticleCard } from "@/components/site/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedArticleBySlug, getArticlesByPracticeArea } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";
import { formatDateTR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(
  props: PageProps<"/makaleler/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  const url = absoluteUrl(`/makaleler/${article.slug}`);

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

export default async function ArticleDetailPage(props: PageProps<"/makaleler/[slug]">) {
  const { slug } = await props.params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const related = article.practiceAreaId
    ? (await getArticlesByPracticeArea(article.practiceAreaId, 4)).filter(
        (item) => item.id !== article.id,
      )
    : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.metaDescription,
          image: article.coverImageUrl ?? undefined,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author: {
            "@type": "Person",
            name: `${article.author.title} ${article.author.name}`,
            url: absoluteUrl(`/avukatlarimiz/${article.author.slug}`),
          },
          publisher: {
            "@type": "Organization",
            name: "Alpek Hukuk ve Arabuluculuk",
          },
          mainEntityOfPage: absoluteUrl(`/makaleler/${article.slug}`),
        }}
      />
      <PageHero
        eyebrow={article.practiceArea?.name ?? "Makale"}
        title={article.title}
        description={article.excerpt}
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex items-center gap-5 border-b border-line pb-6 text-sm text-foreground/50">
          <Link
            href={`/avukatlarimiz/${article.author.slug}`}
            className="font-medium text-navy hover:text-gold"
          >
            {article.author.title} {article.author.name}
          </Link>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {article.publishedAt ? formatDateTR(article.publishedAt) : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTimeMinutes} dk okuma
          </span>
        </div>

        <div
          className="prose-article mt-8 text-[15px] text-foreground/80"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 rounded-2xl border border-line bg-white p-6 text-center">
          <h2 className="font-serif text-lg font-semibold text-navy">
            Bu konuyla ilgili hukuki desteğe mi ihtiyacınız var?
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Uzman avukatlarımızla görüşmek için hemen randevu alın.
          </p>
          <Link href="/randevu-al" className="mt-4 inline-block">
            <Button variant="primary">
              Randevu Al
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-xl font-semibold text-navy">Benzer Makaleler</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.slice(0, 2).map((item) => (
                <ArticleCard
                  key={item.id}
                  article={{ ...item, practiceArea: article.practiceArea }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
