import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { PracticeAreasManager } from "@/components/admin/PracticeAreasManager";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  const [settings, practiceAreas, users] = await Promise.all([
    getSiteSettings(),
    prisma.practiceArea.findMany({ orderBy: { order: "asc" } }),
    prisma.user.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <AdminShell session={session} title="Site Ayarları">
      <div className="space-y-8">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-navy">Genel Bilgiler</h2>
          <p className="mt-1 text-sm text-foreground/50">
            İletişim bilgileri, ana sayfa metinleri ve sosyal bağlantılar.
          </p>
          <div className="mt-5">
            <SiteSettingsForm settings={settings} />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-navy">Çalışma Alanları</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Sitede görüntülenen hukuk alanlarını yönetin.
          </p>
          <div className="mt-5">
            <PracticeAreasManager areas={practiceAreas} />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-navy">Ekip Üyeleri</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Yönetim paneline erişebilecek avukat ve yönetici hesaplarını yönetin.
          </p>
          <div className="mt-5">
            <UsersManager users={users} currentUserId={session.userId} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
