import Link from "next/link";
import { Scale, MapPin, Phone, Mail, Clock } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { InstagramIcon, LinkedinIcon } from "@/components/site/SocialIcons";
import type { SiteSettings, PracticeArea } from "@/generated/prisma/client";

const quickLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/calisma-alanlari", label: "Çalışma Alanları" },
  { href: "/avukatlarimiz", label: "Avukatlarımız" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/randevu-al", label: "Randevu Al" },
];

export function Footer({
  settings,
  practiceAreas,
}: {
  settings: SiteSettings;
  practiceAreas: Pick<PracticeArea, "id" | "name" | "slug">[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-navy text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Scale className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="font-serif text-base font-semibold text-white">
              {siteConfig.shortName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {siteConfig.description}
          </p>
          <div className="mt-5 flex gap-3">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold hover:text-gold"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-gold">
            Hızlı Bağlantılar
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-gold">
            Çalışma Alanları
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {practiceAreas.slice(0, 6).map((area) => (
              <li key={area.id}>
                <Link
                  href={`/calisma-alanlari/${area.slug}`}
                  className="text-white/70 hover:text-white"
                >
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-gold">
            İletişim
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {settings.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {settings.workingHours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>
            © {year} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <p>Kayseri, Türkiye</p>
        </div>
      </div>
    </footer>
  );
}
