import type { Metadata } from "next";

import { PageHero } from "@/components/site/PageHero";
import { ArticleCard } from "@/components/site/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Makaleler",
  description:
    "Aile hukuku, iş hukuku, ticaret hukuku ve daha birçok alanda avukatlarımızın kaleme aldığı güncel hukuki makaleler.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <PageHero
        eyebrow="Bilgi Bankası"
        title="Makaleler"
        description="Avukatlarımızın kaleme aldığı güncel hukuki gelişmeler ve bilgilendirici yazılar."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {articles.length === 0 ? (
          <p className="text-sm text-foreground/60">Henüz yayımlanmış makale bulunmuyor.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
