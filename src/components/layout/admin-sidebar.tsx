"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CalendarRange, ClipboardList, Settings, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoStore, type DemoRole } from "@/components/admin/demo-store";

const ROLE_LABEL: Record<DemoRole, string> = {
  DEVELOPER: "開発者",
  DIRECTOR: "院長",
  RECEPTION: "受付担当",
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { role, setRole } = useDemoStore();

  const groups = [
    { title: "日常業務", items: [
      { href: "/admin", label: "本日の予約・受付", icon: ClipboardList, visible: true },
      { href: "/admin/calendar", label: "予約カレンダー", icon: CalendarDays, visible: true },
      { href: "/admin/reservations", label: "患者・予約管理", icon: CalendarRange, visible: true },
    ] },
    { title: "管理・設定", items: [
      { href: "/admin/booking-settings", label: "予約枠・診療設定", icon: Settings, visible: role !== "RECEPTION" },
      { href: "/admin/analytics", label: "予約集計", icon: BarChart3, visible: role !== "RECEPTION" },
      { href: "/admin/settings", label: "システム設定", icon: Settings, visible: role === "DEVELOPER" },
    ] },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground max-lg:w-16 max-sm:w-14">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5 max-lg:px-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Stethoscope className="size-5" /></span>
        <span className="leading-tight max-lg:hidden"><span className="block text-sm font-semibold">Crestix Reserve</span><span className="text-xs text-sidebar-foreground/60">瓦谷クリニック</span></span>
      </Link>

      <nav className="space-y-5 px-3 py-2 max-lg:px-2" aria-label="管理画面">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;
          return <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-sidebar-foreground/45 max-lg:hidden">{group.title}</div>
            {visibleItems.map((item) => {
              const patientManagementActive = item.href === "/admin/reservations" && pathname.startsWith("/admin/patients");
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href) || patientManagementActive;
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} title={item.label} aria-label={item.label} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors max-lg:justify-center max-lg:px-2", active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                <Icon className="size-[18px] shrink-0" /><span className="max-lg:hidden">{item.label}</span>
              </Link>;
            })}
          </div>;
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-3 max-lg:hidden">
        <label className="mb-1 block text-[10px] font-semibold text-sidebar-foreground/50">デモ権限</label>
        <select value={role} onChange={(e) => setRole(e.target.value as DemoRole)} className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2 text-xs text-sidebar-accent-foreground">
          {(Object.keys(ROLE_LABEL) as DemoRole[]).map((value) => <option key={value} value={value}>{ROLE_LABEL[value]}</option>)}
        </select>
        <p className="mt-1 text-[10px] text-sidebar-foreground/45">本番ではログイン情報から自動判定</p>
      </div>
    </aside>
  );
}
