import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { AppointmentForm } from "@/components/site/AppointmentForm";
import { getPracticeAreas } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Randevu Al",
  description:
    "Alpek Hukuk ve Arabuluculuk Bürosu ile online randevu formu üzerinden hızlıca iletişime geçin.",
};

export default async function AppointmentPage(props: PageProps<"/randevu-al">) {
  const searchParams = await props.searchParams;
  const alanParam = typeof searchParams.alan === "string" ? searchParams.alan : undefined;

  const [practiceAreas, settings] = await Promise.all([getPracticeAreas(), getSiteSettings()]);
  const defaultPracticeAreaId = practiceAreas.find((area) => area.slug === alanParam)?.id;

  return (
    <>
      <PageHero
        eyebrow="İletişime Geçin"
        title="Randevu Al"
        description="Aşağıdaki formu doldurun, uzman avukatlarımız en kısa sürede sizinle iletişime geçsin."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <AppointmentForm
              practiceAreas={practiceAreas}
              defaultPracticeAreaId={defaultPracticeAreaId}
            />
          </div>

          <aside className="h-fit space-y-6 rounded-2xl border border-line bg-navy p-6 text-white">
            <div>
              <h2 className="font-serif text-lg font-semibold">Bize Ulaşın</h2>
              <p className="mt-1 text-sm text-white/60">
                Form dışında doğrudan da bizimle iletişime geçebilirsiniz.
              </p>
            </div>
            <div className="space-y-4 text-sm">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-white/80 hover:text-gold"
              >
                <Phone className="h-4 w-4 text-gold" />
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 text-white/80 hover:text-gold"
              >
                <Mail className="h-4 w-4 text-gold" />
                {settings.email}
              </a>
              <div className="flex items-start gap-3 text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {settings.address}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
