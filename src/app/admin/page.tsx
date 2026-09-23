import Link from "next/link";
import { CalendarClock, Newspaper, FileEdit, Users, ArrowRight } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatDateTimeTR } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await requireSession();

  const [pendingCount, publishedCount, draftCount, lawyerCount, recentAppointments] =
    await Promise.all([
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({
        where: session.role === "ADMIN" ? { status: "DRAFT" } : { status: "DRAFT", authorId: session.userId },
      }),
      prisma.user.count({ where: { active: true } }),
      prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { practiceArea: true },
      }),
    ]);

  const stats = [
    {
      label: "Bekleyen Randevu",
      value: pendingCount,
      icon: CalendarClock,
      href: "/admin/randevular",
    },
    { label: "Yayımlanan Makale", value: publishedCount, icon: Newspaper, href: "/admin/makaleler" },
    { label: "Taslak Makale", value: draftCount, icon: FileEdit, href: "/admin/makaleler" },
    ...(session.role === "ADMIN"
      ? [{ label: "Aktif Ekip Üyesi", value: lawyerCount, icon: Users, href: "/admin/ayarlar" }]
      : []),
  ];

  return (
    <AdminShell session={session} title={`Hoş geldiniz, ${session.name}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-semibold text-navy">{stat.value}</p>
            <p className="mt-1 text-sm text-foreground/50">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-navy">Son Randevu Talepleri</h2>
          <Link
            href="/admin/randevular"
            className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
          >
            Tümünü Gör
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">Henüz randevu talebi yok.</p>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{appointment.fullName}</p>
                  <p className="text-xs text-foreground/50">
                    {appointment.practiceArea?.name ?? "Genel"} ·{" "}
                    {formatDateTimeTR(appointment.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy">
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
