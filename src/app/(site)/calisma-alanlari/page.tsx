import type { Metadata } from "next";

import { PageHero } from "@/components/site/PageHero";
import { PracticeAreaCard } from "@/components/site/PracticeAreaCard";
import { getPracticeAreas } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Çalışma Alanlarımız",
  description:
    "Aile hukuku, iş hukuku, ticaret hukuku, ceza hukuku, icra-iflas hukuku ve KVKK alanlarında sunduğumuz hukuki danışmanlık hizmetleri.",
};

export default async function PracticeAreasPage() {
  const practiceAreas = await getPracticeAreas();

  return (
    <>
      <PageHero
        eyebrow="Hizmetlerimiz"
        title="Çalışma Alanlarımız"
        description="Uzmanlaştığımız hukuk alanlarında, dosyanızın niteliğine uygun stratejiyle yanınızdayız."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {practiceAreas.length === 0 ? (
          <p className="text-sm text-foreground/60">Henüz çalışma alanı eklenmedi.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => (
              <PracticeAreaCard key={area.id} area={area} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
