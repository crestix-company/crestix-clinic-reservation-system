"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus } from "lucide-react";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationType } from "@/types/domain";

export const CALENDAR_TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

type Props = {
  view: "day" | "week";
  days: Date[];
  reservations: EnrichedReservation[];
  types: ReservationType[];
  schedule: { morningStart: string; morningEnd: string; afternoonStart: string; afternoonEnd: string; closedDays: number[] };
  onSelect: (reservation: EnrichedReservation) => void;
  onNew: (date: string, time: string) => void;
};

export function ReservationCalendar({ view, days, reservations, types, schedule, onSelect, onNew }: Props) {
  const configuredSlots = CALENDAR_TIME_SLOTS.filter(
    (slot) =>
      (slot >= schedule.morningStart && slot < schedule.morningEnd) ||
      (slot >= schedule.afternoonStart && slot < schedule.afternoonEnd),
  );
  const extraSlots = reservations
    .map((reservation) => reservation.startTime)
    .filter((slot) => slot && !configuredSlots.includes(slot));
  const slots = [...new Set([...configuredSlots, ...extraSlots].sort())];
  const columns = view === "day" ? "76px minmax(0,1fr)" : "60px repeat(5,minmax(0,1fr))";

  return (
    <div className="max-h-[calc(100vh-245px)] overflow-y-auto rounded-lg border">
      <div className="grid border-b bg-muted/40" style={{ gridTemplateColumns: columns }}>
        <div className="border-r px-2 py-2 text-xs text-muted-foreground">時間</div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border-r px-1 py-2 text-center text-xs font-medium last:border-r-0"
          >
            {format(day, "M/d (E)", { locale: ja })}
          </div>
        ))}
      </div>

      {slots.map((slot) => (
        <div key={slot} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: columns }}>
          <div className="border-r px-2 py-2 text-xs text-muted-foreground">{slot}</div>
          {days.map((day) => {
            const date = format(day, "yyyy-MM-dd");
            const items = reservations.filter(
              (reservation) => reservation.reservationDate === date && reservation.startTime === slot,
            );
            const isOpen = !schedule.closedDays.includes(day.getDay()) && configuredSlots.includes(slot);

            return (
              <div key={date} className="min-w-0 border-r p-1 last:border-r-0">
                <div className="min-h-10 space-y-1">
                  {types
                    .filter((type) => items.some((item) => item.reservationTypeId === type.id))
                    .map((type) => (
                      <SlotGroup
                        key={type.id}
                        type={type}
                        slot={slot}
                        items={items.filter((item) => item.reservationTypeId === type.id)}
                        onSelect={onSelect}
                      />
                    ))}

                  {isOpen ? (
                    <button
                      title={`${date} ${slot}に予約を追加`}
                      aria-label={`${date} ${slot}に予約を追加`}
                      onClick={() => onNew(date, slot)}
                      className="flex min-h-8 w-full items-center justify-center rounded border border-dashed text-muted-foreground/50 hover:border-primary hover:text-primary"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  ) : items.length === 0 ? (
                    <span className="px-1 py-2 text-[10px] text-muted-foreground/50">—</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SlotGroup({
  type,
  slot,
  items,
  onSelect,
}: {
  type: ReservationType;
  slot: string;
  items: EnrichedReservation[];
  onSelect: (reservation: EnrichedReservation) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 3);

  return (
    <div
      className="min-w-0 rounded border-l-4 px-1.5 py-1 text-xs"
      style={{
        borderLeftColor: type.color ?? "#64748b",
        backgroundColor: `${type.color ?? "#64748b"}18`,
      }}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-1 font-semibold">
        <span className="truncate">{type.name}</span>
        <span className="whitespace-nowrap">
          {items.length}名／定員{type.capacity ?? 1}名
        </span>
      </div>

      <div className="space-y-0.5 pt-1">
        {shown.map((reservation) => (
          <button
            key={reservation.id}
            onClick={() => onSelect(reservation)}
            className="block w-full min-w-0 rounded bg-background/70 px-1 py-0.5 text-left hover:bg-background focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="block truncate font-medium">{reservation.patient.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {type.name} · {slot}
            </span>
          </button>
        ))}
      </div>

      {!expanded && items.length > 3 ? (
        <button className="mt-1 text-primary underline" onClick={() => setExpanded(true)}>
          ほか{items.length - 3}名を表示
        </button>
      ) : null}
      {expanded && items.length > 3 ? (
        <button className="mt-1 text-primary underline" onClick={() => setExpanded(false)}>
          折りたたむ
        </button>
      ) : null}
    </div>
  );
}
