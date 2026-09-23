import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/site/PageHero";
import { getSiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Alpek Hukuk ve Arabuluculuk Bürosu iletişim bilgileri, adres ve çalışma saatleri.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Bize Ulaşın"
        title="İletişim"
        description="Sorularınız için bize telefon, e-posta veya randevu formu üzerinden ulaşabilirsiniz."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Adres</p>
                <p className="mt-1 text-sm text-foreground/60">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Telefon</p>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="mt-1 block text-sm text-foreground/60 hover:text-navy"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">E-posta</p>
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-1 block text-sm text-foreground/60 hover:text-navy"
                >
                  {settings.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Çalışma Saatleri</p>
                <p className="mt-1 text-sm text-foreground/60">{settings.workingHours}</p>
              </div>
            </div>

            <Link href="/randevu-al" className="block pt-2">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Randevu Al
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {settings.mapEmbedUrl ? (
              <iframe
                src={settings.mapEmbedUrl}
                className="h-full min-h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ofis Konumu"
              />
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center bg-navy/5 p-8 text-center text-sm text-foreground/50">
                Harita, yönetim panelinden Google Maps gömme bağlantısı eklendiğinde burada
                görüntülenecek.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
