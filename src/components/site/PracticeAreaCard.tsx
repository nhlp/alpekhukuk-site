import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PracticeArea } from "@/generated/prisma/client";
import { PracticeAreaIcon } from "@/components/site/PracticeAreaIcon";

export function PracticeAreaCard({ area }: { area: PracticeArea }) {
  return (
    <Link
      href={`/calisma-alanlari/${area.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-navy group-hover:bg-navy group-hover:text-gold">
        <PracticeAreaIcon icon={area.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold text-navy">{area.name}</h3>
      <p className="mt-2 text-sm text-foreground/60 line-clamp-3">{area.shortDescription}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
        Detaylı Bilgi
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
