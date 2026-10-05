"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReservationSourceBadge } from "./reservation-source-badge";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { formatDateJp, formatDateTimeFull } from "@/lib/date";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationStatus } from "@/types/domain";

type Props = {
  reservation: EnrichedReservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: ReservationStatus) => void;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ReservationDetailDialog({ reservation, open, onOpenChange, onStatusChange }: Props) {
  const [rescheduling, setRescheduling] = useState(false);

  if (!reservation) return null;
  const current = reservation;

  const dateTimeLabel = current.startTime
    ? `${formatDateJp(current.reservationDate)} ${current.startTime}〜${current.endTime}`
    : `${formatDateJp(current.reservationDate)}（当日・時間指定なし）`;

  function handleCancel() {
    onStatusChange?.(current.id, "CANCELLED");
    onOpenChange(false);
  }

  function handleCheckIn() {
    onStatusChange?.(current.id, "CHECKED_IN");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>予約詳細</DialogTitle>
          <DialogDescription>予約番号 {reservation.id}</DialogDescription>
        </DialogHeader>

        <section className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
          <InfoRow label="患者名" value={reservation.patient.name} />
          <InfoRow label="患者ID" value={reservation.patient.id} />
          <InfoRow label="電話番号" value={reservation.patient.phone} />
          <InfoRow label="生年月日" value={reservation.patient.birthDate} />
        </section>

        <section className="grid grid-cols-2 gap-4 rounded-lg border p-4">
          <InfoRow label="予約内容" value={reservation.reservationType.name} />
          <InfoRow label="予約日時" value={dateTimeLabel} />
          <InfoRow label="予約番号" value={reservation.id} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">予約経路</span>
            <ReservationSourceBadge source={reservation.reservationSource} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">状態</span>
            <ReservationStatusBadge status={reservation.status} />
          </div>
        </section>

        <section className="space-y-2">
          <Label className="text-xs text-muted-foreground">備考</Label>
          {rescheduling ? (
            <Textarea defaultValue={reservation.notes} placeholder="備考を入力" rows={3} />
          ) : (
            <p className="min-h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground">
              {reservation.notes || "特記事項なし"}
            </p>
          )}
        </section>

        <Separator />

        <section className="flex justify-between text-xs text-muted-foreground">
          <span>作成日時: {formatDateTimeFull(reservation.createdAt)}</span>
          <span>更新日時: {formatDateTimeFull(reservation.updatedAt)}</span>
        </section>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRescheduling((v) => !v)}>
              予約変更
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleCancel}>
              キャンセル
            </Button>
          </div>
          <Button size="sm" onClick={handleCheckIn} disabled={reservation.status !== "RESERVED"}>
            受付する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
