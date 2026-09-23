import Link from "next/link";

import type { User as UserModel } from "@/generated/prisma/client";
import { getInitials } from "@/lib/utils";

export function LawyerCard({ lawyer }: { lawyer: UserModel }) {
  return (
    <Link
      href={`/avukatlarimiz/${lawyer.slug}`}
      className="group block rounded-2xl border border-line bg-white p-6 text-center transition-shadow hover:shadow-lg"
    >
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy font-serif text-xl font-semibold text-gold">
        {getInitials(lawyer.name)}
      </span>
      <p className="mt-4 font-serif text-lg font-semibold text-navy">
        {lawyer.title} {lawyer.name}
      </p>
      <p className="mt-1 text-sm text-foreground/60 line-clamp-2">
        {lawyer.bio || "Deneyimli hukuk ekibimizin bir üyesi."}
      </p>
      <span className="mt-3 inline-block text-sm font-medium text-gold group-hover:underline">
        Profili Görüntüle →
      </span>
    </Link>
  );
}
