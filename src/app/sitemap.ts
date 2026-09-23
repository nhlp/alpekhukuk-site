import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [practiceAreas, lawyers, articles] = await Promise.all([
    prisma.practiceArea.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.user.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/hakkimizda`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/calisma-alanlari`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/avukatlarimiz`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/makaleler`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/iletisim`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteConfig.url}/randevu-al`, changeFrequency: "yearly", priority: 0.9 },
  ];

  const practiceAreaPages: MetadataRoute.Sitemap = practiceAreas.map((area) => ({
    url: `${siteConfig.url}/calisma-alanlari/${area.slug}`,
    lastModified: area.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lawyerPages: MetadataRoute.Sitemap = lawyers.map((lawyer) => ({
    url: `${siteConfig.url}/avukatlarimiz/${lawyer.slug}`,
    lastModified: lawyer.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/makaleler/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...practiceAreaPages, ...lawyerPages, ...articlePages];
}
