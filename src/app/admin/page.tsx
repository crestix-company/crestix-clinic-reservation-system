"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock3, Plus, Search, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { ReservationSourceBadge } from "@/components/reservations/reservation-source-badge";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import { useDemoStore } from "@/components/admin/demo-store";
import { getToday } from "@/lib/services/reservation-service";
import { getPatientSummary } from "@/lib/services/patient-service";
import { RESERVATION_STATUS_LABEL } from "@/lib/labels";
import type { ReservationType } from "@/types/domain";
import type { EnrichedReservation } from "@/lib/services/types";

const ALL = "ALL";
type ReceptionTab = "BEFORE_VISIT" | "CHECKED_IN" | "IN_SERVICE";
const RECEPTION_TABS: { value: ReceptionTab; label: string; description: string; statuses: string[] }[] = [
  { value: "BEFORE_VISIT", label: "来院前", description: "予約済みで、まだ来院受付していない患者", statuses: ["RESERVED"] },
  { value: "CHECKED_IN", label: "受付済・待機中", description: "来院受付後、診察開始前までの患者", statuses: ["CHECKED_IN", "WAITING", "CALLED"] },
  { value: "IN_SERVICE", label: "診察中・完了", description: "診察中または本日の診療が完了した患者", statuses: ["IN_CONSULTATION", "COMPLETED"] },
];
const columns = "xl:grid-cols-[82px_minmax(120px,1.2fr)_65px_minmax(100px,1.15fr)_minmax(85px,1fr)_75px_85px_66px]";

export default function AdminDashboardPage() {
  const { reservations, doctors, types, addReservation, updateReservation, updateStatus } = useDemoStore();
  const [keyword, setKeyword] = useState("");
  const [doctorFilter, setDoctorFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [receptionTab, setReceptionTab] = useState<ReceptionTab>("BEFORE_VISIT");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const today = getToday();

  const todays = reservations.filter((reservation) => reservation.reservationDate === today);
  const active = todays.filter((reservation) => reservation.status !== "CANCELLED");
  const noTimeReservations = active
    .filter((reservation) => !reservation.startTime)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const currentTab = RECEPTION_TABS.find((tab) => tab.value === receptionTab) ?? RECEPTION_TABS[0];
  const filtered = todays.filter((reservation) => {
    const query = keyword.trim().toLowerCase();
    return !!reservation.startTime && currentTab.statuses.includes(reservation.status) &&
      (!query || [reservation.patient.name, reservation.patient.phone, reservation.patient.id, reservation.id].some((value) => value.toLowerCase().includes(query))) &&
      (doctorFilter === ALL || reservation.doctorId === doctorFilter) &&
      (typeFilter === ALL || reservation.reservationTypeId === typeFilter) &&
      (statusFilter === ALL || reservation.status === statusFilter);
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const selected = reservations.find((reservation) => reservation.id === selectedId) ?? null;

  return <div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">本日の予約・受付</h1><p className="text-sm text-muted-foreground">本日 {today} の予約と来院受付・診察状況を確認</p></div>
      <Button onClick={() => setNewOpen(true)}><Plus className="size-4" />新規予約</Button>
    </header>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <ReservationKpi active={active} types={types} />
      <KpiCard label="来院前" value={active.filter((reservation) => reservation.status === "RESERVED").length} unit="件" icon={Users} accent="slate" />
      <KpiCard label="受付済・待機中" value={active.filter((reservation) => ["CHECKED_IN", "WAITING", "CALLED"].includes(reservation.status)).length} unit="件" icon={Clock3} accent="amber" />
      <KpiCard label="診察中・完了" value={active.filter((reservation) => ["IN_CONSULTATION", "COMPLETED"].includes(reservation.status)).length} unit="件" icon={Stethoscope} accent="teal" />
    </div>
    {noTimeReservations.length > 0 && (
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-amber-950">時間指定なし予約</h2>
              <p className="text-xs text-amber-800">時間指定予約に埋もれないよう、常に一覧上部へ固定表示します。</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">{noTimeReservations.length}件</span>
          </div>
          <div className="rounded-lg border bg-background">
            {noTimeReservations.map((reservation) => (
              <div key={reservation.id} className="grid gap-2 border-b px-3 py-2 text-sm last:border-b-0 md:grid-cols-[minmax(180px,1.5fr)_minmax(120px,1fr)_minmax(100px,1fr)_90px] md:items-center">
                <div className="min-w-0 font-medium">
                  <Link href={`/admin/patients/${reservation.patientId}`} className="text-primary hover:underline">{reservation.patient.name}</Link>
                  <span className="block truncate text-[11px] font-normal text-muted-foreground">Patient ID: {reservation.patient.id}</span>
                </div>
                <span>{types.find((type) => type.id === reservation.reservationTypeId)?.name ?? reservation.reservationType.name}</span>
                <ReservationStatusBadge status={reservation.status} />
                <Button size="sm" variant="outline" onClick={() => setSelectedId(reservation.id)}>詳細</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    <Card><CardContent className="space-y-3 pt-4">
      <div className="space-y-2">
        <Tabs value={receptionTab} onValueChange={(value) => { setReceptionTab(value as ReceptionTab); setStatusFilter(ALL); }}>
          <TabsList className="grid h-10 w-full grid-cols-3 overflow-hidden rounded-xl bg-muted/70 p-1">
            {RECEPTION_TABS.map((tab) => {
              const count = active.filter((reservation) => tab.statuses.includes(reservation.status)).length;
              return <TabsTrigger key={tab.value} value={tab.value} className="h-full gap-2 rounded-lg border-0 px-3 py-0 shadow-none data-active:bg-primary/10 data-active:text-primary data-active:shadow-none hover:bg-background/40"><span>{tab.label}</span><span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">{count}</span></TabsTrigger>;
            })}
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">{currentTab.description}</p>
      </div>
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,180px))]">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="患者名・電話番号・患者ID・予約IDで検索" placeholder="患者名・電話番号・患者ID・予約ID" className="pl-9" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
        <Filter value={doctorFilter} onChange={setDoctorFilter} label="担当医" options={doctors.map((doctor) => [doctor.id, doctor.name])} />
        <Filter value={typeFilter} onChange={setTypeFilter} label="診療メニュー" options={types.map((type) => [type.id, type.name])} />
        <Filter value={statusFilter} onChange={setStatusFilter} label="予約状態" options={Object.entries(RESERVATION_STATUS_LABEL)} />
      </div>
      <div className="rounded-lg border"><div className={`hidden gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground xl:grid ${columns}`}><span>予約時間</span><span>患者名 / Patient ID</span><span>初診・再診</span><span>診療メニュー</span><span>担当医</span><span>予約経路</span><span>受付状態</span><span>操作</span></div>
        <div className="max-h-[calc(100vh-390px)] min-h-40 overflow-y-auto">{filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">該当する予約がありません</p> : filtered.map((reservation) => {
          const pastVisits = getPatientSummary(reservation.patient, reservations, today).history.filter(({ reservation: visit }) => visit.status === "COMPLETED" && visit.reservationDate < reservation.reservationDate).length;
          return <div key={reservation.id} className={`grid gap-2 border-b px-3 py-2 text-sm last:border-b-0 xl:items-center ${columns}`}>
            <span className="font-semibold">{reservation.startTime}</span>
            <span className="min-w-0 truncate font-medium"><Link href={`/admin/patients/${reservation.patientId}`} className="text-primary hover:underline">{reservation.patient.name}</Link><span className="block truncate text-[11px] font-normal text-muted-foreground">Patient ID: {reservation.patient.id}</span></span>
            <span>{pastVisits > 0 ? "再診" : "初診"}</span>
            <span className="truncate">{types.find((type) => type.id === reservation.reservationTypeId)?.name ?? reservation.reservationType.name}</span>
            <span className="truncate">{doctors.find((doctor) => doctor.id === reservation.doctorId)?.name ?? "未設定"}</span>
            <ReservationSourceBadge source={reservation.reservationSource} /><ReservationStatusBadge status={reservation.status} />
            <Button size="sm" variant="outline" onClick={() => setSelectedId(reservation.id)}>詳細</Button>
          </div>;
        })}</div>
      </div>
    </CardContent></Card>
    <ReservationDetailDialog reservation={selected} open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)} onStatusChange={updateStatus} onUpdate={updateReservation} />
    <NewReservationDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addReservation} initialDate={today} />
  </div>;
}

function ReservationKpi({ active, types }: { active: EnrichedReservation[]; types: ReservationType[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rows = types.map((type) => ({ ...type, count: active.filter((reservation) => reservation.reservationTypeId === type.id).length })).filter((type) => type.count > 0);

  const keepOpen = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 450);
  };

  return <div className="relative" onMouseEnter={keepOpen} onMouseLeave={closeWithDelay} onFocus={keepOpen} onBlur={closeWithDelay} onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
    <button type="button" className="w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="本日の予約の診療メニュー別内訳" aria-expanded={open} onClick={() => setOpen((value) => !value)}><KpiCard label="本日の予約総数" value={active.length} unit="件" icon={CalendarCheck} accent="blue" /></button>
    <div className={`absolute left-0 top-full z-20 w-64 pt-2 transition ${open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`} onMouseEnter={keepOpen} onMouseLeave={closeWithDelay}>
      <div className="rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg">
        <div className="mb-2 font-semibold">診療メニュー別内訳</div>{rows.length === 0 ? <p className="text-muted-foreground">予約はありません</p> : rows.map((type) => <div key={type.id} className="flex items-center gap-2 py-0.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: type.color }} /><span className="flex-1">{type.name}</span><span className="tabular-nums">{type.count}件</span></div>)}
        <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>合計</span><span>{active.length}件</span></div>
      </div>
    </div>
  </div>;
}

function Filter({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: [string, string][] }) {
  return <Select value={value} onValueChange={(next) => next && onChange(next)}><SelectTrigger className="w-full"><SelectValue>{(selected: string) => selected === ALL ? `${label}: すべて` : `${label}: ${options.find(([id]) => id === selected)?.[1] ?? "すべて"}`}</SelectValue></SelectTrigger><SelectContent><SelectItem value={ALL}>すべて</SelectItem>{options.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>;
}
