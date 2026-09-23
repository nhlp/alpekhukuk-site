import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Yönetim Paneli Girişi",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold">
            <Scale className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-serif text-xl font-semibold text-navy">
            Alpek Hukuk Yönetim Paneli
          </h1>
          <p className="mt-1 text-sm text-foreground/50">Devam etmek için giriş yapın.</p>
        </div>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
