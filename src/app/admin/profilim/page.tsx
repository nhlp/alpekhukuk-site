import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { PasswordForm } from "@/components/admin/PasswordForm";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });

  return (
    <AdminShell session={session} title="Profilim">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-navy">
            Profil Bilgileri
          </h2>
          <p className="mt-1 text-sm text-foreground/50">
            Bu bilgiler &ldquo;Avukatlarımız&rdquo; sayfanızda herkese açık olarak görünür.
          </p>
          <div className="mt-5">
            <ProfileForm user={user} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-navy">Şifre Değiştir</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Güvenliğiniz için güçlü bir şifre seçin.
          </p>
          <div className="mt-5">
            <PasswordForm />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
