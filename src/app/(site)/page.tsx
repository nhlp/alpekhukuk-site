import Link from "next/link";
import { ShieldCheck, Eye, Target, ArrowRight, Phone } from "lucide-react";

import { getSiteSettings } from "@/lib/settings";
import { getPracticeAreas, getLawyers, getPublishedArticles } from "@/lib/queries";
import { PracticeAreaCard } from "@/components/site/PracticeAreaCard";
import { LawyerCard } from "@/components/site/LawyerCard";
import { ArticleCard } from "@/components/site/ArticleCard";
import { HeroScene } from "@/components/site/HeroScene";
import { Button } from "@/components/ui/Button";

const pillars = [
  { icon: ShieldCheck, title: "Güven" },
  { icon: Eye, title: "Şeffaflık" },
  { icon: Target, title: "Sonuç" },
];

export default async function HomePage() {
  const [settings, practiceAreas, lawyers, articles] = await Promise.all([
    getSiteSettings(),
    getPracticeAreas(),
    getLawyers(),
    getPublishedArticles(3),
  ]);

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-81px)] items-center overflow-hidden bg-navy">
        <HeroScene />
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, rgba(176,141,63,0.22) 0%, rgba(11,31,58,0) 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,31,58,0.92) 0%, rgba(11,31,58,0.65) 42%, rgba(11,31,58,0.35) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="max-w-xl">
            <span className="inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              Kayseri Hukuk ve Arabuluculuk Bürosu
            </span>
            <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.15] text-white sm:text-5xl">
              Adaletin Terazisinde,{" "}
              <span className="italic text-gold">Sizin Tarafınızdayız.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              {settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/randevu-al">
                <Button variant="gold" size="lg">
                  Randevu Al
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  {settings.phone}
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <pillar.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-medium text-white/80">{pillar.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <a
          href="#hizmetler"
          className="absolute inset-x-0 bottom-7 z-10 flex justify-center"
          aria-label="Aşağı kaydırıp hizmetlerimizi keşfedin"
        >
          <span className="flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70">
            <span className="text-[11px] uppercase tracking-[0.2em]">Keşfedin</span>
            <span className="h-9 w-5 rounded-full border border-white/25 p-1">
              <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
            </span>
          </span>
        </a>
      </section>

      <section id="hizmetler" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-gold">
              Hizmetlerimiz
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-navy">
              Çalışma Alanlarımız
            </h2>
          </div>
          <Link
            href="/calisma-alanlari"
            className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
          >
            Tüm alanları görüntüle
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map((area) => (
            <PracticeAreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      {lawyers.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wide text-gold">
                  Ekibimiz
                </span>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-navy">
                  Avukatlarımız
                </h2>
              </div>
              <Link
                href="/avukatlarimiz"
                className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
              >
                Tüm ekibi görüntüle
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lawyers.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-gold">
                Bilgi Bankası
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-navy">
                Güncel Makaleler
              </h2>
            </div>
            <Link
              href="/makaleler"
              className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
            >
              Tüm makaleler
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-cream py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-line bg-white px-6 py-14 text-center shadow-sm sm:px-14">
          <span className="rounded-full bg-navy/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-navy">
            Ücretsiz Ön Görüşme
          </span>
          <h2 className="font-serif text-3xl font-semibold text-navy">
            Hukuki sorunuz mu var? Hemen randevu alın.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-foreground/60">
            Uzman avukat kadromuz, davanızı veya danışmanlık talebinizi değerlendirmek için sizi
            dinlemeye hazır. Online randevu formunu doldurun, en kısa sürede size dönüş yapalım.
          </p>
          <Link href="/randevu-al">
            <Button variant="primary" size="lg">
              Randevu Al
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
