import Link from "next/link";
import { Plus } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { formatDateTR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function AdminArticlesPage() {
  const session = await requireSession();

  const articles = await prisma.article.findMany({
    where: session.role === "ADMIN" ? {} : { authorId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: { author: true, practiceArea: true },
  });

  return (
    <AdminShell
      session={session}
      title="Makaleler"
      actions={
        <Link href="/admin/makaleler/yeni">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Yeni Makale
          </Button>
        </Link>
      }
    >
      {articles.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white p-6 text-sm text-foreground/50">
          Henüz makale eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-5 py-3 font-medium">Başlık</th>
                <th className="px-5 py-3 font-medium">Yazar</th>
                <th className="px-5 py-3 font-medium">Alan</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">Güncellendi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-cream/60">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/makaleler/${article.id}`}
                      className="font-medium text-navy hover:text-gold"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-foreground/60">
                    {article.author.title} {article.author.name}
                  </td>
                  <td className="px-5 py-3.5 text-foreground/60">
                    {article.practiceArea?.name ?? "Genel"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        article.status === "PUBLISHED"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {article.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground/50">
                    {formatDateTR(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
