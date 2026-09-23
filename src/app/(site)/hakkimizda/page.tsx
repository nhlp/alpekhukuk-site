import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Eye, Target, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { getSiteSettings } from "@/lib/settings";
import { getLawyers } from "@/lib/queries";
import { LawyerCard } from "@/components/site/LawyerCard";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Alpek Hukuk ve Arabuluculuk Bürosu; güven, şeffaflık ve sonuç odaklı yaklaşımıyla Kayseri'de hukuki danışmanlık ve avukatlık hizmeti sunar.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Güven",
    text: "Meslek etiği ve gizlilik ilkeleri çerçevesinde, müvekkillerimizin hak ve menfaatlerini kararlılıkla koruruz.",
  },
  {
    icon: Eye,
    title: "Şeffaflık",
    text: "Dosyanızın her aşamasında süreç, süre ve olası maliyetler hakkında açık ve zamanında bilgilendirme yaparız.",
  },
  {
    icon: Target,
    title: "Sonuç",
    text: "Her uyuşmazlığa özgü hukuki strateji geliştirerek en etkin ve gerçekçi sonuca ulaşmayı hedefleriz.",
  },
];

export default async function AboutPage() {
  const [settings, lawyers] = await Promise.all([getSiteSettings(), getLawyers()]);

  return (
    <>
      <PageHero
        eyebrow="Bizi Tanıyın"
        title="Hakkımızda"
        description="Alpek Hukuk ve Arabuluculuk Bürosu olarak, hukuki süreçlerin her adımında müvekkillerimizin yanındayız."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="prose-article text-[15px] text-foreground/80">
          {settings.aboutText ? (
            <p>{settings.aboutText}</p>
          ) : (
            <>
              <p>
                Alpek Hukuk ve Arabuluculuk Bürosu, Kayseri merkezli olarak aile, iş ve ticaret
                hukuku başta olmak üzere geniş bir yelpazede hukuki danışmanlık ve avukatlık
                hizmeti sunmaktadır. Büromuz, her müvekkilin hukuki ihtiyacının kendine özgü
                olduğu ilkesinden hareketle, dosyalara bireysel ve titiz bir yaklaşımla
                yaklaşmaktadır.
              </p>
              <p>
                Deneyimli avukat kadromuz; dava öncesi danışmanlıktan dava sürecinin takibine,
                arabuluculuktan sözleşme hazırlığına kadar hukukun birçok alanında müvekkillerine
                rehberlik etmektedir. Amacımız, hukuki süreçleri müvekkillerimiz için anlaşılır
                kılmak ve onları her aşamada bilgilendirilmiş şekilde yanlarında tutmaktır.
              </p>
              <p>
                Güven, şeffaflık ve sonuç odaklılık ilkelerini merkezine alan çalışma
                anlayışımızla; aile hukuku, iş hukuku, ticaret hukuku, ceza hukuku, icra-iflas
                hukuku ve KVKK ile sözleşmeler hukuku alanlarında kapsamlı hizmet vermekteyiz.
              </p>
            </>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-serif text-2xl font-semibold text-navy">
            Çalışma İlkelerimiz
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-line bg-cream p-6 text-center"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold">
                  <value.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-navy">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lawyers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-serif text-2xl font-semibold text-navy">Ekibimizle Tanışın</h2>
            <Link
              href="/avukatlarimiz"
              className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
            >
              Tüm ekibi görüntüle
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
