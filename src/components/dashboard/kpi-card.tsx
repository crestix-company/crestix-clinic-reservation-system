import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  accent?: "blue" | "teal" | "amber" | "slate";
  className?: string;
};

const ACCENT_CLASS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function KpiCard({ label, value, unit, icon: Icon, accent = "blue", className }: KpiCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-sm", className)}>
      <CardContent className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
            {unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span> : null}
          </span>
        </div>
        {Icon ? (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", ACCENT_CLASS[accent])}>
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
