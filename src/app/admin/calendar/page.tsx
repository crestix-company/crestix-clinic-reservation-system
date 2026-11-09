"use client";

import { useState } from "react";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservationCalendar } from "@/components/calendar/reservation-calendar";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import { useDemoStore } from "@/components/admin/demo-store";
import { getToday } from "@/lib/services/reservation-service";

export default function CalendarPage() {
  const { reservations, doctors, types, schedule, addReservation, updateReservation, updateStatus } = useDemoStore();
  const [view, setView] = useState<"day" | "week">("day");
  const [anchor, setAnchor] = useState(() => new Date(`${getToday()}T00:00:00`));
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; time: string } | null>(null);
  const days = view === "day" ? [anchor] : Array.from({ length: 5 }, (_, index) => addDays(startOfWeek(anchor, { weekStartsOn: 1 }), index));
  const visible = reservations.filter((reservation) => reservation.doctorId === doctorId && reservation.status !== "CANCELLED" && (typeFilter === "ALL" || reservation.reservationTypeId === typeFilter) && days.some((day) => format(day, "yyyy-MM-dd") === reservation.reservationDate));
  const selected = reservations.find((reservation) => reservation.id === selectedId) ?? null;
  const move = (direction: number) => setAnchor((current) => view === "day" ? addDays(current, direction) : direction > 0 ? addWeeks(current, 1) : subWeeks(current, 1));

  return <div className="space-y-4">
    <div><h1 className="text-2xl font-semibold tracking-tight">予約カレンダー</h1><p className="text-sm text-muted-foreground">医師ごとの予約を表示。空き枠の＋から登録できます。</p></div>
    <Card><CardContent className="space-y-3 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="前へ"><ChevronLeft className="size-4" /></Button><span className="min-w-36 text-center text-sm font-medium">{view === "day" ? format(anchor, "yyyy年M月d日(E)", { locale: ja }) : `${format(days[0], "M/d")}〜${format(days[4], "M/d")}`}</span><Button variant="outline" size="icon" onClick={() => move(1)} aria-label="次へ"><ChevronRight className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => setAnchor(new Date(`${getToday()}T00:00:00`))}>デモ当日へ</Button></div>
        <div className="flex flex-wrap items-center gap-2"><Select value={doctorId} onValueChange={(value) => value && setDoctorId(value)}><SelectTrigger className="w-40"><SelectValue>{(value: string) => doctors.find((doctor) => doctor.id === value)?.name ?? "担当医"}</SelectValue></SelectTrigger><SelectContent>{doctors.filter((doctor) => doctor.active).map((doctor) => <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>)}</SelectContent></Select><Select value={typeFilter} onValueChange={(value) => value && setTypeFilter(value)}><SelectTrigger className="w-40"><SelectValue>{(value: string) => value === "ALL" ? "診療メニュー: すべて" : types.find((type) => type.id === value)?.name ?? "診療メニュー"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="ALL">すべて</SelectItem>{types.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}</SelectContent></Select><Tabs value={view} onValueChange={(value) => setView(value as "day" | "week")}><TabsList><TabsTrigger value="day">日</TabsTrigger><TabsTrigger value="week">週</TabsTrigger></TabsList></Tabs></div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">{types.filter((type) => type.active).map((type) => <span key={type.id} className="flex items-center gap-1"><span className="size-2.5 rounded-full" style={{ backgroundColor: type.color }} />{type.name}</span>)}</div>
      <ReservationCalendar view={view} days={days} reservations={visible} types={types} schedule={schedule} onSelect={(reservation) => setSelectedId(reservation.id)} onNew={(date, time) => setNewSlot({ date, time })} />
    </CardContent></Card>
    <ReservationDetailDialog reservation={selected} open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)} onStatusChange={updateStatus} onUpdate={updateReservation} />
    <NewReservationDialog open={!!newSlot} onOpenChange={(open) => !open && setNewSlot(null)} onCreate={addReservation} initialDate={newSlot?.date} initialTime={newSlot?.time} initialDoctorId={doctorId} />
  </div>;
}
