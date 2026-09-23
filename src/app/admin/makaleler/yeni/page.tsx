import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function NewArticlePage() {
  const session = await requireSession();

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
    <AdminShell session={session} title="Yeni Makale">
      <ArticleEditor
        practiceAreas={practiceAreas}
        authors={authors}
        canPublish
        isAdmin={session.role === "ADMIN"}
      />
    </AdminShell>
  );
}
