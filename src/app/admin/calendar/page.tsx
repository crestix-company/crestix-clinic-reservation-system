"use client";

import { useMemo, useState } from "react";
import { addDays, addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservationCalendar } from "@/components/calendar/reservation-calendar";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { enrich, getReservationsByDate, getToday } from "@/lib/services/reservation-service";
import { reservationTypes } from "@/data/mock/reservation-types";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationStatus } from "@/types/domain";

const ALL = "ALL";

export default function CalendarPage() {
  const today = getToday();
  const [view, setView] = useState<"day" | "week">("day");
  const [anchor, setAnchor] = useState(new Date(`${today}T00:00:00`));
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});
  const [selected, setSelected] = useState<EnrichedReservation | null>(null);

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  const reservations = useMemo(() => {
    const all = days.flatMap((d) => getReservationsByDate(format(d, "yyyy-MM-dd")));
    return all
      .filter((r) => r.status !== "CANCELLED")
      .filter((r) => typeFilter === ALL || r.reservationTypeId === typeFilter)
      .map((r) => enrich(r))
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r));
  }, [days, typeFilter, overrides]);

  function goPrev() {
    setAnchor((prev) => (view === "day" ? addDays(prev, -1) : subWeeks(prev, 1)));
  }
  function goNext() {
    setAnchor((prev) => (view === "day" ? addDays(prev, 1) : addWeeks(prev, 1)));
  }

  const rangeLabel =
    view === "day"
      ? format(anchor, "yyyy年M月d日(E)", { locale: ja })
      : `${format(startOfWeek(anchor, { weekStartsOn: 1 }), "M/d", { locale: ja })} 〜 ${format(
          endOfWeek(startOfWeek(anchor, { weekStartsOn: 1 }), { weekStartsOn: 1 }),
          "M/d",
          { locale: ja },
        )}`;

  function handleStatusChange(id: string, status: ReservationStatus) {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">予約カレンダー</h1>
        <p className="text-sm text-muted-foreground">日表示・週表示で予約状況を確認できます</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goPrev}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-48 text-center text-sm font-medium">{rangeLabel}</span>
              <Button variant="outline" size="icon" onClick={goNext}>
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="予約種別">
                    {(v: string) => (v === ALL ? "すべて" : (reservationTypes.find((t) => t.id === v)?.name ?? "予約種別"))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>すべて</SelectItem>
                  {reservationTypes
                    .filter((t) => t.code !== "OTHER")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
                <TabsList>
                  <TabsTrigger value="day">日表示</TabsTrigger>
                  <TabsTrigger value="week">週表示</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ReservationCalendar view={view} days={days} reservations={reservations} onSelect={setSelected} />
        </CardContent>
      </Card>

      <ReservationDetailDialog
        reservation={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
