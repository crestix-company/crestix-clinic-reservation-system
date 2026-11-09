"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock3, Plus, Search, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
const columns = "xl:grid-cols-[82px_minmax(105px,1.15fr)_65px_minmax(100px,1.15fr)_minmax(85px,1fr)_75px_85px_66px]";

export default function AdminDashboardPage() {
  const { reservations, doctors, types, addReservation, updateReservation, updateStatus } = useDemoStore();
  const [keyword, setKeyword] = useState("");
  const [doctorFilter, setDoctorFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [date, setDate] = useState(getToday());

  const todays = reservations.filter((reservation) => reservation.reservationDate === date);
  const active = todays.filter((reservation) => reservation.status !== "CANCELLED");
  const filtered = todays.filter((reservation) => {
    const query = keyword.trim().toLowerCase();
    return (!query || [reservation.patient.name, reservation.patient.phone, reservation.id].some((value) => value.toLowerCase().includes(query))) &&
      (doctorFilter === ALL || reservation.doctorId === doctorFilter) &&
      (typeFilter === ALL || reservation.reservationTypeId === typeFilter) &&
      (statusFilter === ALL || reservation.status === statusFilter);
  }).sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
  const selected = reservations.find((reservation) => reservation.id === selectedId) ?? null;

  return <div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">本日の予約・受付</h1><p className="text-sm text-muted-foreground">デモ日付: {getToday()} ｜ 予約と受付状態をまとめて確認</p></div><div className="flex items-center gap-2"><Input aria-label="対象日" type="date" className="w-36" value={date} onChange={(event) => setDate(event.target.value)} /><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />新規予約</Button></div></header>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <ReservationKpi active={active} types={types} />
      <KpiCard label="未受付" value={active.filter((reservation) => reservation.status === "RESERVED").length} unit="件" icon={Users} accent="slate" />
      <KpiCard label="待機中" value={active.filter((reservation) => ["CHECKED_IN", "WAITING", "CALLED"].includes(reservation.status)).length} unit="件" icon={Clock3} accent="amber" />
      <KpiCard label="診察中" value={active.filter((reservation) => reservation.status === "IN_CONSULTATION").length} unit="件" icon={Stethoscope} accent="teal" />
    </div>
    <Card><CardContent className="space-y-3 pt-4">
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,180px))]">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="患者名・電話番号・予約番号で検索" placeholder="患者名・電話番号・予約番号" className="pl-9" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
        <Filter value={doctorFilter} onChange={setDoctorFilter} label="担当医" options={doctors.map((doctor) => [doctor.id, doctor.name])} />
        <Filter value={typeFilter} onChange={setTypeFilter} label="診療メニュー" options={types.map((type) => [type.id, type.name])} />
        <Filter value={statusFilter} onChange={setStatusFilter} label="予約状態" options={Object.entries(RESERVATION_STATUS_LABEL)} />
      </div>
      <div className="rounded-lg border"><div className={`hidden gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground xl:grid ${columns}`}><span>予約時間</span><span>患者名</span><span>初診・再診</span><span>診療メニュー</span><span>担当医</span><span>予約経路</span><span>受付状態</span><span>操作</span></div>
        <div className="max-h-[calc(100vh-355px)] min-h-40 overflow-y-auto">{filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">該当する予約がありません</p> : filtered.map((reservation) => {
          const pastVisits = getPatientSummary(reservation.patient, reservations, date).history.filter(({ reservation: visit }) => visit.status === "COMPLETED" && visit.reservationDate < reservation.reservationDate).length;
          return <div key={reservation.id} className={`grid gap-2 border-b px-3 py-2 text-sm last:border-b-0 xl:items-center ${columns}`}>
            <span className="font-semibold">{reservation.startTime || "当日順番"}</span>
            <span className="min-w-0 truncate font-medium"><Link href={`/admin/patients/${reservation.patientId}`} className="text-primary hover:underline">{reservation.patient.name}</Link><span className="block truncate text-[11px] font-normal text-muted-foreground">{reservation.id}</span></span>
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
    <NewReservationDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addReservation} initialDate={date} />
  </div>;
}

function ReservationKpi({ active, types }: { active: EnrichedReservation[]; types: ReservationType[] }) {
  const [open, setOpen] = useState(false);
  const rows = types.map((type) => ({ ...type, count: active.filter((reservation) => reservation.reservationTypeId === type.id).length })).filter((type) => type.count > 0);
  return <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
    <button type="button" className="w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="本日の予約の診療メニュー別内訳" aria-expanded={open} onClick={() => setOpen(true)}><KpiCard label="本日の予約総数" value={active.length} unit="件" icon={CalendarCheck} accent="blue" /></button>
    <div className={`absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg transition ${open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}>
      <div className="mb-2 font-semibold">診療メニュー別内訳</div>{rows.length === 0 ? <p className="text-muted-foreground">予約はありません</p> : rows.map((type) => <div key={type.id} className="flex items-center gap-2 py-0.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: type.color }} /><span className="flex-1">{type.name}</span><span className="tabular-nums">{type.count}件</span></div>)}
      <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>合計</span><span>{active.length}件</span></div>
    </div>
  </div>;
}

function Filter({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: [string, string][] }) {
  return <Select value={value} onValueChange={(next) => next && onChange(next)}><SelectTrigger className="w-full"><SelectValue>{(selected: string) => selected === ALL ? `${label}: すべて` : `${label}: ${options.find(([id]) => id === selected)?.[1] ?? "すべて"}`}</SelectValue></SelectTrigger><SelectContent><SelectItem value={ALL}>すべて</SelectItem>{options.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>;
}
