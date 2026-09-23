import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings, getPracticeAreasForNav } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, practiceAreas] = await Promise.all([
    getSiteSettings(),
    getPracticeAreasForNav(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LegalService",
          name: siteConfig.name,
          description: siteConfig.description,
          url: siteConfig.url,
          telephone: settings.phone,
          email: settings.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: "Kayseri",
            addressCountry: "TR",
          },
          areaServed: "TR",
          priceRange: "$$",
        }}
      />
      <Header phone={settings.phone} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} practiceAreas={practiceAreas} />
    </>
  );
}
