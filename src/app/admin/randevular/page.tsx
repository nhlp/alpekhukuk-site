import Link from "next/link";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { AppointmentRow } from "@/components/admin/AppointmentRow";
import type { AppointmentStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const filters: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "CANCELLED", label: "İptal Edildi" },
];

export default async function AdminAppointmentsPage(props: PageProps<"/admin/randevular">) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const durumParam = typeof searchParams.durum === "string" ? searchParams.durum : "ALL";
  const activeFilter = filters.some((f) => f.value === durumParam) ? durumParam : "ALL";

  const appointments = await prisma.appointment.findMany({
    where: activeFilter === "ALL" ? {} : { status: activeFilter as AppointmentStatus },
    orderBy: { createdAt: "desc" },
    include: { practiceArea: true },
  });

  return (
    <AdminShell session={session} title="Randevu Talepleri">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "ALL" ? "/admin/randevular" : `/admin/randevular?durum=${filter.value}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === filter.value
                ? "bg-navy text-white"
                : "bg-white text-navy/70 border border-line hover:bg-navy/5",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {appointments.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-sm text-foreground/50">
            Bu filtrede randevu talebi bulunmuyor.
          </p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </AdminShell>
  );
}
