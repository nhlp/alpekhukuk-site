import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { PracticeAreaIcon } from "@/components/site/PracticeAreaIcon";
import { ArticleCard } from "@/components/site/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPracticeAreaBySlug, getArticlesByPracticeArea } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(
  props: PageProps<"/calisma-alanlari/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const area = await getPracticeAreaBySlug(slug);
  if (!area) return {};

  return {
    title: area.name,
    description: area.shortDescription,
    alternates: { canonical: absoluteUrl(`/calisma-alanlari/${area.slug}`) },
    openGraph: {
      title: area.name,
      description: area.shortDescription,
      url: absoluteUrl(`/calisma-alanlari/${area.slug}`),
    },
  };
}

export default async function PracticeAreaDetailPage(
  props: PageProps<"/calisma-alanlari/[slug]">,
) {
  const { slug } = await props.params;
  const area = await getPracticeAreaBySlug(slug);
  if (!area) notFound();

  const articles = await getArticlesByPracticeArea(area.id, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Anasayfa", item: absoluteUrl("/") },
            {
              "@type": "ListItem",
              position: 2,
              name: "Çalışma Alanları",
              item: absoluteUrl("/calisma-alanlari"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: area.name,
              item: absoluteUrl(`/calisma-alanlari/${area.slug}`),
            },
          ],
        }}
      />
      <PageHero eyebrow="Çalışma Alanı" title={area.name} description={area.shortDescription} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="prose-article text-[15px] text-foreground/80">
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-gold">
              <PracticeAreaIcon icon={area.icon} className="h-7 w-7" />
            </span>
            {area.content ? (
              <div dangerouslySetInnerHTML={{ __html: area.content }} />
            ) : (
              <p>{area.shortDescription}</p>
            )}
          </article>

          <aside className="h-fit rounded-2xl border border-line bg-white p-6">
            <h2 className="font-serif text-lg font-semibold text-navy">
              Bu alanda danışmanlık almak ister misiniz?
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Formu doldurun, uzman avukatlarımız en kısa sürede sizinle iletişime geçsin.
            </p>
            <Link href={`/randevu-al?alan=${area.slug}`} className="mt-4 block">
              <Button variant="primary" className="w-full">
                Randevu Al
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </aside>
        </div>

        {articles.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-semibold text-navy">İlgili Makaleler</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{ ...article, practiceArea: area }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
