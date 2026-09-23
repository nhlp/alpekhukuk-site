import type { Metadata } from "next";

import { PageHero } from "@/components/site/PageHero";
import { LawyerCard } from "@/components/site/LawyerCard";
import { getLawyers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Avukatlarımız",
  description:
    "Alpek Hukuk ve Arabuluculuk Bürosu avukat kadrosu ile tanışın: uzmanlık alanları ve deneyimleri.",
};

export default async function LawyersPage() {
  const lawyers = await getLawyers();

  return (
    <>
      <PageHero
        eyebrow="Ekibimiz"
        title="Avukatlarımız"
        description="Alanında deneyimli avukat kadromuzla, hukuki süreçlerinizde güvenilir bir çözüm ortağıyız."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {lawyers.length === 0 ? (
          <p className="text-sm text-foreground/60">Henüz avukat eklenmedi.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
