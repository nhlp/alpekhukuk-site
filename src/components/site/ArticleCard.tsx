import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";

import type { Article, PracticeArea, User } from "@/generated/prisma/client";
import { formatDateTR } from "@/lib/utils";

type ArticleWithRelations = Article & {
  author: User;
  practiceArea: PracticeArea | null;
};

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  return (
    <Link
      href={`/makaleler/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-16/9 w-full overflow-hidden bg-navy/5">
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-navy to-navy-light">
            <span className="font-serif text-2xl text-gold/70">Alpek Hukuk</span>
          </div>
        )}
        {article.practiceArea && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy shadow-sm">
            {article.practiceArea.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold text-navy line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-foreground/60 line-clamp-3">{article.excerpt}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-foreground/50">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {article.publishedAt ? formatDateTR(article.publishedAt) : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTimeMinutes} dk okuma
          </span>
        </div>
      </div>
    </Link>
  );
}
