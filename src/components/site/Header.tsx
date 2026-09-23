import Link from "next/link";
import { Scale, Menu, Phone } from "lucide-react";

import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/calisma-alanlari", label: "Çalışma Alanları" },
  { href: "/avukatlarimiz", label: "Avukatlarımız" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/iletisim", label: "İletişim" },
];

export function Header({ phone }: { phone: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
            <Scale className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy">
              {siteConfig.shortName}
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-gold">
              {siteConfig.motto}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy/80 transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2 text-sm font-medium text-navy/80 hover:text-navy"
          >
            <Phone className="h-4 w-4" />
            {phone}
          </a>
          <Link
            href="/randevu-al"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Randevu Al
          </Link>
        </div>

        <details className="lg:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line text-navy">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-cream px-4 pb-6 shadow-lg">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/randevu-al"
                className="mt-2 rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Randevu Al
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
