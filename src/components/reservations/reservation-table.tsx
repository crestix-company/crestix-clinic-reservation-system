"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/components/admin/demo-store";
import { ReservationSourceBadge } from "./reservation-source-badge";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { formatDateTimeLabel } from "@/lib/date";
import { getToday } from "@/lib/services/reservation-service";
import type { EnrichedReservation } from "@/lib/services/types";

type Props = { reservations: EnrichedReservation[]; variant?: "today" | "list"; onRowClick?: (reservation: EnrichedReservation) => void };
const columns = "lg:grid-cols-[minmax(85px,1fr)_minmax(110px,1.25fr)_minmax(100px,1fr)_minmax(90px,1fr)_minmax(110px,1.1fr)_78px_86px_70px]";

export function ReservationTable({ reservations, onRowClick }: Props) {
  const { doctors } = useDemoStore();
  return <div className="rounded-lg border">
    <div className={`hidden gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground lg:grid ${columns}`}><span>予約番号</span><span>患者名</span><span>診療メニュー</span><span>担当医</span><span>予約日時</span><span>予約経路</span><span>状態</span><span>操作</span></div>
    <div className="max-h-[calc(100vh-315px)] min-h-36 overflow-y-auto">{reservations.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">該当する予約がありません</div> : reservations.map((reservation) => <div key={reservation.id} className={`grid gap-2 border-b px-3 py-2 text-sm last:border-b-0 lg:items-center ${columns}`}>
      <span className="truncate font-mono text-xs text-muted-foreground">{reservation.id}</span>
      <Link href={`/admin/patients/${reservation.patientId}`} className="truncate font-medium text-primary hover:underline">{reservation.patient.name}</Link>
      <span className="truncate">{reservation.reservationType.name}</span>
      <span className="truncate">{doctors.find((doctor) => doctor.id === reservation.doctorId)?.name ?? "未設定"}</span>
      <span>{formatDateTimeLabel(reservation.reservationDate, reservation.startTime, getToday())}</span>
      <ReservationSourceBadge source={reservation.reservationSource} />
      <ReservationStatusBadge status={reservation.status} />
      <Button size="sm" variant="outline" onClick={() => onRowClick?.(reservation)}>詳細</Button>
    </div>)}</div>
  </div>;
}
