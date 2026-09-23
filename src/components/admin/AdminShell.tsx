import Link from "next/link";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarClock,
  Newspaper,
  UserCircle,
  Settings,
  LogOut,
  Scale,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";
import type { SessionPayload } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/randevular", label: "Randevular", icon: CalendarClock },
  { href: "/admin/makaleler", label: "Makaleler", icon: Newspaper },
  { href: "/admin/profilim", label: "Profilim", icon: UserCircle },
];

export function AdminShell({
  session,
  title,
  actions,
  children,
}: {
  session: SessionPayload;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-navy text-white md:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Scale className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <span className="font-serif text-base font-semibold">Alpek Panel</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {session.role === "ADMIN" && (
            <Link
              href="/admin/ayarlar"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Site Ayarları
            </Link>
          )}
        </nav>
        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-sm font-medium text-white">{session.name}</p>
          <p className="text-xs text-white/50">
            {session.role === "ADMIN" ? "Yönetici" : "Avukat"}
          </p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-gold"
            >
              <LogOut className="h-3.5 w-3.5" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-5 sm:px-8">
          <h1 className="font-serif text-xl font-semibold text-navy">{title}</h1>
          {actions}
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
