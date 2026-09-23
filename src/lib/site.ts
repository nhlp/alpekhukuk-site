export const siteConfig = {
  name: "Alpek Hukuk ve Arabuluculuk",
  shortName: "Alpek Hukuk",
  description:
    "Kayseri merkezli Alpek Hukuk ve Arabuluculuk Bürosu; aile, iş, ticaret, ceza, icra-iflas ve KVKK hukuku alanlarında güven, şeffaflık ve sonuç odaklı danışmanlık sunar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.alpekhukuk.com.tr",
  locale: "tr_TR",
  motto: "Güven · Şeffaflık · Sonuç",
};

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
