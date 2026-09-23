import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Randevu Talebiniz Alındı",
  robots: { index: false, follow: false },
};

export default function AppointmentThankYouPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-serif text-2xl font-semibold text-navy">
        Randevu Talebiniz Alındı
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/60">
        Bize ulaştığınız için teşekkür ederiz. Ekibimiz talebinizi inceleyerek en kısa sürede
        sizinle iletişime geçecektir.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="primary">Anasayfaya Dön</Button>
      </Link>
    </section>
  );
}
