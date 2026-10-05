"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Period } from "@/lib/services/types";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "week", label: "今週" },
  { value: "month", label: "今月" },
];

export function DateRangeTabs({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Period)}>
      <TabsList>
        {OPTIONS.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value}>
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
