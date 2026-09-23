import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function EditArticlePage(props: PageProps<"/admin/makaleler/[id]">) {
  const session = await requireSession();
  const { id } = await props.params;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();
  if (session.role !== "ADMIN" && article.authorId !== session.userId) notFound();

  const [practiceAreas, authors] = await Promise.all([
    prisma.practiceArea.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    session.role === "ADMIN"
      ? prisma.user.findMany({
          where: { active: true },
          select: { id: true, name: true, title: true },
        })
      : Promise.resolve(undefined),
  ]);

  return (
    <AdminShell session={session} title="Makaleyi Düzenle">
      <ArticleEditor
        article={article}
        practiceAreas={practiceAreas}
        authors={authors}
        canPublish
        isAdmin={session.role === "ADMIN"}
      />
    </AdminShell>
  );
}
