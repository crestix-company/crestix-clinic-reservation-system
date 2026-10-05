"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReservationSourceCount } from "@/lib/services/types";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#64748b", "#f43f5e"];

export function ReservationSourceChart({ data }: { data: ReservationSourceCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.source} fill={COLORS[index % COLORS.length]} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }}
          formatter={(value, name) => [`${value}件`, name]}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 13, lineHeight: "22px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
