import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, User } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { ArticleCard } from "@/components/site/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkedinIcon } from "@/components/site/SocialIcons";
import { getLawyerBySlug, getArticlesByAuthor } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata(
  props: PageProps<"/avukatlarimiz/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) return {};

  return {
    title: `${lawyer.title} ${lawyer.name}`,
    description: lawyer.bio || `${lawyer.title} ${lawyer.name} - Alpek Hukuk ve Arabuluculuk`,
    alternates: { canonical: absoluteUrl(`/avukatlarimiz/${lawyer.slug}`) },
  };
}

export default async function LawyerDetailPage(props: PageProps<"/avukatlarimiz/[slug]">) {
  const { slug } = await props.params;
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) notFound();

  const articles = await getArticlesByAuthor(lawyer.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: `${lawyer.title} ${lawyer.name}`,
          jobTitle: "Avukat",
          worksFor: { "@type": "LegalService", name: "Alpek Hukuk ve Arabuluculuk" },
          url: absoluteUrl(`/avukatlarimiz/${lawyer.slug}`),
        }}
      />
      <PageHero eyebrow="Avukat" title={`${lawyer.title} ${lawyer.name}`} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <div>
            <div className="aspect-4/5 w-full overflow-hidden rounded-2xl bg-navy/5">
              {lawyer.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lawyer.photoUrl}
                  alt={`${lawyer.title} ${lawyer.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-navy/20">
                  <User className="h-20 w-20" strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              {lawyer.phone && (
                <a
                  href={`tel:${lawyer.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-navy hover:text-gold"
                >
                  <Phone className="h-4 w-4" />
                  {lawyer.phone}
                </a>
              )}
              <a
                href="mailto:info@alpekhukuk.com.tr"
                className="flex items-center gap-2 text-navy hover:text-gold"
              >
                <Mail className="h-4 w-4" />
                info@alpekhukuk.com.tr
              </a>
              {lawyer.linkedinUrl && (
                <a
                  href={lawyer.linkedinUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 text-navy hover:text-gold"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn Profili
                </a>
              )}
            </div>
          </div>

          <div className="prose-article text-[15px] text-foreground/80">
            {lawyer.bio ? (
              <p>{lawyer.bio}</p>
            ) : (
              <p>Deneyimli hukuk ekibimizin bir üyesi olarak müvekkillerimize hizmet vermektedir.</p>
            )}
          </div>
        </div>

        {articles.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              {lawyer.title} {lawyer.name.split(" ")[0]}&apos;in Makaleleri
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={{ ...article, author: lawyer }} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
