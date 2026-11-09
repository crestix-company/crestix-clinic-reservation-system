"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock3, Plus, Search, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReservationSourceBadge } from "@/components/reservations/reservation-source-badge";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import { EhrLinkButton } from "@/components/integrations/ehr-link-button";
import { enrich, getReservationsByPeriod, getToday, summarizeByType } from "@/lib/services/reservation-service";
import { reservationTypes } from "@/data/mock/reservation-types";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationStatus } from "@/types/domain";

const ALL = "ALL";

function doctorLabel(reservation: EnrichedReservation) {
  switch (reservation.reservationType.code) {
    case "GASTRO":
    case "COLON":
      return "担当医A";
    case "CHECKUP":
      return "健診担当";
    default:
      return "診察担当";
  }
}

function timeLabel(reservation: EnrichedReservation) {
  return reservation.startTime || "当日順番";
}

export default function AdminDashboardPage() {
  const today = getToday();
  const [extraReservations, setExtraReservations] = useState<EnrichedReservation[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});
  const [selected, setSelected] = useState<EnrichedReservation | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL);

  const todaysReservations = useMemo(() => {
    const base = getReservationsByPeriod("today", today)
      .map((r) => enrich(r))
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r));

    return [...extraReservations.filter((r) => r.reservationDate === today), ...base]
      .filter((r) => typeFilter === ALL || r.reservationTypeId === typeFilter)
      .filter((r) => {
        const q = keyword.trim().toLowerCase();
        if (!q) return true;
        return (
          r.patient.name.toLowerCase().includes(q) ||
          r.patient.id.toLowerCase().includes(q) ||
          r.reservationType.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (!a.startTime && b.startTime) return 1;
        if (a.startTime && !b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [today, extraReservations, overrides, keyword, typeFilter]);

  const allToday = useMemo(() => {
    const base = getReservationsByPeriod("today", today)
      .map((r) => enrich(r))
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r));
    return [...extraReservations.filter((r) => r.reservationDate === today), ...base];
  }, [today, extraReservations, overrides]);

  const checkedIn = allToday.filter((r) => r.status === "CHECKED_IN").length;
  const waiting = allToday.filter((r) => ["WAITING", "CALLED"].includes(r.status)).length;
  const inConsultation = allToday.filter((r) => r.status === "IN_CONSULTATION").length;
  const completed = allToday.filter((r) => r.status === "COMPLETED").length;
  const activeReservations = allToday.filter((r) => r.status !== "CANCELLED").length;
  const typeSummary = summarizeByType(allToday.filter((r) => r.status !== "CANCELLED")).slice(0, 6);

  function handleStatusChange(id: string, status: ReservationStatus) {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">本日の受付</h1>
          <p className="text-sm text-muted-foreground">本日の予約・検査内容・受付状況を1画面で確認できます</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/calendar">予約カレンダー</Link>
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            新規予約
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <KpiCard label="本日の予約" value={activeReservations} unit="件" icon={CalendarCheck} accent="blue" />
        <KpiCard label="受付済" value={checkedIn} unit="件" icon={CheckCircle2} accent="teal" />
        <KpiCard label="待機中" value={waiting} unit="件" icon={Clock3} accent="amber" />
        <KpiCard label="診察中" value={inConsultation} unit="件" icon={Stethoscope} accent="blue" />
        <KpiCard label="本日完了" value={completed} unit="件" icon={Users} accent="slate" />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <CardHeader className="space-y-4 border-b">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>本日の予約タイムライン</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">患者名・予約時間・診療メニュー・受付状況を一覧表示</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="すべての診療メニュー">
                      {(v: string) =>
                        v === ALL
                          ? "すべての診療メニュー"
                          : reservationTypes.find((t) => t.id === v)?.name ?? "診療メニュー"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>すべての診療メニュー</SelectItem>
                    {reservationTypes.filter((t) => t.active).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative min-w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="患者名・患者ID・診療内容で検索"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">時間</th>
                    <th className="px-5 py-3 font-medium">患者情報</th>
                    <th className="px-5 py-3 font-medium">予約内容（診療メニュー）</th>
                    <th className="px-5 py-3 font-medium">担当</th>
                    <th className="px-5 py-3 font-medium">受付状況</th>
                    <th className="px-5 py-3 font-medium">予約経路</th>
                    <th className="px-5 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {todaysReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="cursor-pointer transition hover:bg-muted/40"
                      onClick={() => setSelected(reservation)}
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold tabular-nums">{timeLabel(reservation)}</div>
                        {reservation.endTime ? <div className="mt-0.5 text-xs text-muted-foreground">〜 {reservation.endTime}</div> : null}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="font-medium">{reservation.patient.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">ID: {reservation.patient.id}</div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="font-medium">{reservation.reservationType.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {reservation.startTime
                            ? reservation.startTime + "〜" + reservation.endTime
                            : "当日受付・時間指定なし"}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-muted-foreground">{doctorLabel(reservation)}</td>
                      <td className="px-5 py-4 align-top"><ReservationStatusBadge status={reservation.status} /></td>
                      <td className="px-5 py-4 align-top"><ReservationSourceBadge source={reservation.reservationSource} /></td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <EhrLinkButton patientId={reservation.patient.id} patientName={reservation.patient.name} compact />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {todaysReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">該当する予約がありません</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">現在の受付状況</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <StatusSummary label="受付済" value={checkedIn} />
              <StatusSummary label="待機中・呼出中" value={waiting} />
              <StatusSummary label="診察中" value={inConsultation} />
              <StatusSummary label="本日完了" value={completed} />
              <Button asChild variant="outline" className="mt-2 w-full"><Link href="/admin/reception">当日受付管理を開く</Link></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">診療メニュー別 予約数</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {typeSummary.map((item) => (
                <div key={item.reservationTypeId} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold tabular-nums">{item.count}件</span>
                </div>
              ))}
              <Button asChild variant="ghost" className="w-full"><Link href="/admin/reservations">すべての予約を見る</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReservationDetailDialog
        reservation={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onStatusChange={handleStatusChange}
      />
      <NewReservationDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(reservation) => setExtraReservations((prev) => [reservation, ...prev])}
      />
    </div>
  );
}

function StatusSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}名</span>
    </div>
  );
}
