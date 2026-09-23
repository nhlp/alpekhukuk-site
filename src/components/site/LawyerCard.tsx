import Link from "next/link";
import { User } from "lucide-react";

import type { User as UserModel } from "@/generated/prisma/client";

export function LawyerCard({ lawyer }: { lawyer: UserModel }) {
  return (
    <Link
      href={`/avukatlarimiz/${lawyer.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-navy/5">
        {lawyer.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lawyer.photoUrl}
            alt={`${lawyer.title} ${lawyer.name}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-navy/20">
            <User className="h-16 w-16" strokeWidth={1} />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="font-serif text-lg font-semibold text-navy">
          {lawyer.title} {lawyer.name}
        </p>
        <p className="mt-1 text-sm text-foreground/60 line-clamp-2">
          {lawyer.bio || "Deneyimli hukuk ekibimizin bir üyesi."}
        </p>
        <span className="mt-3 inline-block text-sm font-medium text-gold group-hover:underline">
          Profili Görüntüle →
        </span>
      </div>
    </Link>
  );
}
