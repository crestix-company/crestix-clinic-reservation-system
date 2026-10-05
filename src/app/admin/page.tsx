"use client";

import { useMemo, useState } from "react";
import { Plus, CalendarCheck, Stethoscope, Microscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { ReservationTypeChart } from "@/components/dashboard/reservation-type-chart";
import { ReservationSourceChart } from "@/components/dashboard/reservation-source-chart";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import {
  enrich,
  getDashboardKpis,
  getReservationsByPeriod,
  getToday,
  summarizeByType,
  summarizeBySource,
} from "@/lib/services/reservation-service";
import type { EnrichedReservation } from "@/lib/services/types";
import type { Period } from "@/lib/services/types";
import type { ReservationStatus } from "@/types/domain";

export default function AdminDashboardPage() {
  const today = getToday();
  const kpis = useMemo(() => getDashboardKpis(today), [today]);

  const [period, setPeriod] = useState<Period>("today");
  const [extraReservations, setExtraReservations] = useState<EnrichedReservation[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});
  const [selected, setSelected] = useState<EnrichedReservation | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const periodReservations = useMemo(() => {
    const base = getReservationsByPeriod(period, today)
      .map((r) => enrich(r))
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r));
    return [...extraReservations.filter((r) => r.reservationDate === today || period !== "today"), ...base];
  }, [period, today, extraReservations, overrides]);

  const typeChartData = useMemo(() => summarizeByType(periodReservations), [periodReservations]);
  const sourceChartData = useMemo(() => summarizeBySource(periodReservations), [periodReservations]);

  function handleStatusChange(id: string, status: ReservationStatus) {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">予約管理</h1>
          <p className="text-sm text-muted-foreground">本日の予約・受付状況を確認できます</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeTabs value={period} onChange={setPeriod} />
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            新規予約
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="本日の予約" value={kpis.totalToday} unit="件" icon={CalendarCheck} accent="blue" />
        <KpiCard label="当日診察" value={kpis.sameDayConsultation} unit="件" icon={Stethoscope} accent="teal" />
        <KpiCard label="検査予約" value={kpis.examReservation} unit="件" icon={Microscope} accent="blue" />
        <KpiCard label="待機中" value={kpis.waiting} unit="人" icon={Users} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>予約内容別</CardTitle>
            <CardDescription>予約メニューごとの件数</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationTypeChart data={typeChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>予約経路別</CardTitle>
            <CardDescription>どこから予約が入ったか</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationSourceChart data={sourceChartData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>本日の予約</CardTitle>
          <CardDescription>行をクリックすると予約詳細が確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationTable reservations={periodReservations} variant="today" onRowClick={setSelected} />
        </CardContent>
      </Card>

      <ReservationDetailDialog
        reservation={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onStatusChange={handleStatusChange}
      />
      <NewReservationDialog open={newOpen} onOpenChange={setNewOpen} onCreate={(r) => setExtraReservations((prev) => [r, ...prev])} />
    </div>
  );
}
