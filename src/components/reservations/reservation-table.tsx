"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReservationSourceBadge } from "./reservation-source-badge";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { formatDateTimeLabel, formatDateTimeFull } from "@/lib/date";
import { getReceptionNumberLabel, getToday } from "@/lib/services/reservation-service";
import type { EnrichedReservation } from "@/lib/services/types";

type Props = {
  reservations: EnrichedReservation[];
  variant?: "today" | "list";
  onRowClick?: (reservation: EnrichedReservation) => void;
};

export function ReservationTable({ reservations, variant = "today", onRowClick }: Props) {
  const today = getToday();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">{variant === "today" ? "受付番号" : "予約番号"}</TableHead>
            <TableHead>患者名</TableHead>
            <TableHead>予約内容</TableHead>
            <TableHead>{variant === "today" ? "日時" : "予約日時"}</TableHead>
            <TableHead>予約経路</TableHead>
            <TableHead>状態</TableHead>
            {variant === "list" ? <TableHead>登録日時</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={variant === "list" ? 7 : 6} className="h-24 text-center text-sm text-muted-foreground">
                該当する予約がありません
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onRowClick?.(r)}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {variant === "today" ? getReceptionNumberLabel(r) ?? "-" : r.id}
                </TableCell>
                <TableCell className="font-medium">{r.patient.name}</TableCell>
                <TableCell>{r.reservationType.name}</TableCell>
                <TableCell className="text-sm">{formatDateTimeLabel(r.reservationDate, r.startTime, today)}</TableCell>
                <TableCell>
                  <ReservationSourceBadge source={r.reservationSource} />
                </TableCell>
                <TableCell>
                  <ReservationStatusBadge status={r.status} />
                </TableCell>
                {variant === "list" ? (
                  <TableCell className="text-xs text-muted-foreground">{formatDateTimeFull(r.createdAt)}</TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
