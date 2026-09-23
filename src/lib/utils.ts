import slugifyLib from "slugify";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/** Türkçe karakterleri de doğru şekilde URL dostu hale getirir. */
export function toSlug(value: string) {
  return slugifyLib(value, {
    lower: true,
    strict: true,
    trim: true,
    locale: "tr",
  });
}

/** HTML içeriğinden düz metin çıkarır (özet/SEO açıklaması üretmek için). */
export function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

/** İçerikten okunuş süresi (dakika) hesaplar. */
export function calculateReadingTime(html: string) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

/** Makale meta başlığı/açıklaması otomatik üretimi. */
export function generateSeoMeta(title: string, contentHtml: string) {
  const plain = stripHtml(contentHtml);
  const metaTitle = title.length > 60 ? truncate(title, 60) : title;
  const metaDescription = truncate(plain, 160);
  return { metaTitle, metaDescription };
}

export function formatDateTR(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTimeTR(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
