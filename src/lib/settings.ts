import { prisma } from "@/lib/prisma";

/** Site ayarları tekil (singleton) bir kayıttır; yoksa varsayılanlarla oluşturur. */
export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export async function getPracticeAreasForNav() {
  return prisma.practiceArea.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
