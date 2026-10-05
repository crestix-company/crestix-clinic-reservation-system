"use client";

import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import type { EnrichedReservation } from "@/lib/services/types";

export const CALENDAR_TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

type Props = {
  view: "day" | "week";
  days: Date[];
  reservations: EnrichedReservation[];
  onSelect: (reservation: EnrichedReservation) => void;
};

function ReservationCard({ reservation, onSelect }: { reservation: EnrichedReservation; onSelect: (r: EnrichedReservation) => void }) {
  return (
    <button
      onClick={() => onSelect(reservation)}
      className="w-full truncate rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-left text-xs leading-tight text-blue-800 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
    >
      <div className="truncate font-medium">{reservation.patient.name}</div>
      <div className="truncate text-blue-600 dark:text-blue-300">{reservation.reservationType.name}</div>
    </button>
  );
}

export function ReservationCalendar({ view, days, reservations, onSelect }: Props) {
  const noSlotReservations = reservations.filter((r) => !r.startTime);
  const slotted = reservations.filter((r) => r.startTime);

  const colTemplate = view === "day" ? "minmax(80px,auto) 1fr" : `minmax(80px,auto) repeat(${days.length}, 1fr)`;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[640px]">
        <div className="grid border-b bg-muted/40" style={{ gridTemplateColumns: colTemplate }}>
          <div className="border-r px-3 py-2 text-xs text-muted-foreground">時間</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="border-r px-3 py-2 text-center text-sm font-medium last:border-r-0">
              {format(day, "M/d (E)", { locale: ja })}
            </div>
          ))}
        </div>

        <div className="grid border-b" style={{ gridTemplateColumns: colTemplate }}>
          <div className="border-r px-3 py-2 text-xs text-muted-foreground">
            当日受付
            <br />
            （時間指定なし）
          </div>
          {days.map((day) => {
            const items = noSlotReservations.filter((r) => isSameDay(new Date(`${r.reservationDate}T00:00:00`), day));
            return (
              <div key={day.toISOString()} className="flex max-h-40 flex-col gap-1 overflow-y-auto border-r p-1.5 last:border-r-0">
                {items.length === 0 ? <span className="px-1 text-xs text-muted-foreground/60">—</span> : null}
                {items.map((r) => (
                  <ReservationCard key={r.id} reservation={r} onSelect={onSelect} />
                ))}
              </div>
            );
          })}
        </div>

        {CALENDAR_TIME_SLOTS.map((slot) => (
          <div key={slot} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: colTemplate }}>
            <div className="border-r px-3 py-2 text-xs text-muted-foreground">{slot}</div>
            {days.map((day) => {
              const items = slotted.filter((r) => r.startTime === slot && isSameDay(new Date(`${r.reservationDate}T00:00:00`), day));
              return (
                <div key={day.toISOString()} className="flex flex-col gap-1 border-r p-1.5 last:border-r-0 min-h-14">
                  {items.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onSelect={onSelect} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
