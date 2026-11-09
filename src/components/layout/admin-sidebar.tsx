"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CalendarRange, ClipboardList, Settings, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  { title: "日常業務", items: [
    { href: "/admin", label: "本日の予約・受付", icon: ClipboardList },
    { href: "/admin/calendar", label: "予約カレンダー", icon: CalendarDays },
    { href: "/admin/reservations", label: "予約一覧", icon: CalendarRange },
    { href: "/admin/patients", label: "患者一覧", icon: Users },
  ] },
  { title: "管理・設定", items: [
    { href: "/admin/booking-settings", label: "予約枠・診療設定", icon: Settings },
    { href: "/admin/analytics", label: "予約集計", icon: BarChart3 },
    { href: "/admin/settings", label: "システム設定", icon: Settings },
  ] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground max-lg:w-16 max-sm:w-14">
    <Link href="/admin" className="flex items-center gap-2 px-5 py-5 max-lg:px-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Stethoscope className="size-5" /></span>
      <span className="leading-tight max-lg:hidden"><span className="block text-sm font-semibold">Crestix Reserve</span><span className="text-xs text-sidebar-foreground/60">瓦谷クリニック</span></span>
    </Link>
    <nav className="space-y-5 px-3 py-2 max-lg:px-2" aria-label="管理画面">
      {groups.map((group) => <div key={group.title} className="space-y-1">
        <div className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-sidebar-foreground/45 max-lg:hidden">{group.title}</div>
        {group.items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} title={item.label} aria-label={item.label} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors max-lg:justify-center max-lg:px-2", active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}><Icon className="size-[18px] shrink-0" /><span className="max-lg:hidden">{item.label}</span></Link>;
        })}
      </div>)}
    </nav>
  </aside>;
}
