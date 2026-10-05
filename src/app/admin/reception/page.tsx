"use client";

import { useMemo, useState } from "react";
import { PhoneCall, Users, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReceptionQueue } from "@/components/reception/reception-queue";
import { listTodayReceptionQueue, getReceptionSummary, type EnrichedReception } from "@/lib/services/reception-service";
import type { ReceptionStatus } from "@/types/domain";

function withTimestamp(reception: EnrichedReception, status: ReceptionStatus): EnrichedReception {
  const now = new Date().toISOString();
  return {
    ...reception,
    status,
    calledAt: status === "CALLED" ? now : reception.calledAt,
    consultationStartedAt: status === "IN_CONSULTATION" ? now : reception.consultationStartedAt,
    completedAt: status === "COMPLETED" ? now : reception.completedAt,
  };
}

export default function ReceptionPage() {
  const initial = useMemo(() => listTodayReceptionQueue(), []);
  const [queue, setQueue] = useState<EnrichedReception[]>(initial);

  const summary = getReceptionSummary(queue);

  function handleAdvance(id: string, nextStatus: ReceptionStatus) {
    setQueue((prev) => prev.map((item) => (item.id === id ? withTimestamp(item, nextStatus) : item)));
  }

  const activeQueue = queue
    .filter((q) => q.status !== "COMPLETED")
    .concat(queue.filter((q) => q.status === "COMPLETED"))
    .sort((a, b) => {
      const order: Record<ReceptionStatus, number> = { IN_CONSULTATION: 0, CALLED: 1, WAITING: 2, COMPLETED: 3 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return a.receptionNumber.localeCompare(b.receptionNumber);
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">当日受付管理</h1>
        <p className="text-sm text-muted-foreground">受付番号順に呼出・診察・完了の状態を進めます</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="現在診察中" value={summary.inConsultation} unit="件" icon={PhoneCall} accent="teal" />
        <KpiCard label="待機人数" value={summary.waiting} unit="人" icon={Users} accent="amber" />
        <KpiCard label="本日受付" value={summary.totalToday} unit="人" icon={ClipboardCheck} accent="blue" />
        <KpiCard label="完了" value={summary.completed} unit="人" icon={CheckCircle2} accent="slate" />
      </div>

      <ReceptionQueue queue={activeQueue} onAdvance={handleAdvance} />
    </div>
  );
}
