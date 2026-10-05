"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReservationTypeCount } from "@/lib/services/types";

const COLORS = ["#2563eb", "#0d9488", "#38bdf8", "#f59e0b", "#94a3b8"];

export function ReservationTypeChart({ data }: { data: ReservationTypeCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" />
        <YAxis
          type="category"
          dataKey="name"
          width={84}
          tick={{ fontSize: 13 }}
          stroke="currentColor"
          className="text-foreground"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }}
          formatter={(value) => [`${value}件`, "予約件数"]}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((entry, index) => (
            <Cell key={entry.reservationTypeId} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
