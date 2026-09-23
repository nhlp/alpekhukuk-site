import { prisma } from "@/lib/prisma";

export function getLawyers() {
  return prisma.user.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export function getLawyerBySlug(slug: string) {
  return prisma.user.findFirst({
    where: { slug, active: true },
  });
}

export function getPracticeAreas() {
  return prisma.practiceArea.findMany({
    orderBy: { order: "asc" },
  });
}

export function getPracticeAreaBySlug(slug: string) {
  return prisma.practiceArea.findUnique({
    where: { slug },
  });
}

export function getPublishedArticles(limit?: number) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { author: true, practiceArea: true },
  });
}

export function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: true, practiceArea: true },
  });
}

export function getArticlesByPracticeArea(practiceAreaId: string, limit?: number) {
  return prisma.article.findMany({
    where: { practiceAreaId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { author: true },
  });
}

export function getArticlesByAuthor(authorId: string) {
  return prisma.article.findMany({
    where: { authorId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { practiceArea: true },
  });
}
