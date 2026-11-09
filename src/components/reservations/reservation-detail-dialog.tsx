"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/components/admin/demo-store";
import { checkBookingAvailability } from "@/lib/booking-availability";
import { ReservationSourceBadge } from "./reservation-source-badge";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { EhrLinkButton } from "@/components/integrations/ehr-link-button";
import { formatDateJp, formatDateTimeFull } from "@/lib/date";
import { RESERVATION_STATUS_LABEL } from "@/lib/labels";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationStatus } from "@/types/domain";

type Props = {
  reservation: EnrichedReservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: ReservationStatus) => void;
  onUpdate?: (id: string, changes: Partial<EnrichedReservation>) => void;
};

export function ReservationDetailDialog({ reservation, open, onOpenChange, onStatusChange, onUpdate }: Props) {
  const { doctors, reservations, types, schedule } = useDemoStore();
  const [rescheduling, setRescheduling] = useState(false);
  const [confirmChange, setConfirmChange] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!reservation) return null;
  const current = reservation;
  const proposedDate = date || current.reservationDate;
  const proposedTime = current.startTime ? time || current.startTime : "";
  const availability = checkBookingAvailability({ date: proposedDate, time: proposedTime, doctorId: current.doctorId, reservationTypeId: current.reservationTypeId }, reservations, types, schedule, current.id);
  const dateTimeLabel = current.startTime ? `${formatDateJp(current.reservationDate)} ${current.startTime}〜${current.endTime}` : `${formatDateJp(current.reservationDate)}（当日・時間指定なし）`;

  function close(nextOpen: boolean) {
    if (!nextOpen) { setRescheduling(false); setConfirmChange(false); setConfirmCancel(false); setDate(""); setTime(""); }
    onOpenChange(nextOpen);
  }

  function saveChange() {
    if (!availability.available) return;
    const duration = current.startTime && current.endTime ? Number(current.endTime.slice(0, 2)) * 60 + Number(current.endTime.slice(3)) - Number(current.startTime.slice(0, 2)) * 60 - Number(current.startTime.slice(3)) : current.reservationType.durationMinutes ?? 30;
    const [hour, minute] = proposedTime ? proposedTime.split(":").map(Number) : [0, 0];
    const endMinutes = hour * 60 + minute + duration;
    const endTime = proposedTime ? `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}` : "";
    onUpdate?.(current.id, { reservationDate: proposedDate, startTime: proposedTime, endTime });
    close(false);
  }

  return <Dialog open={open} onOpenChange={close}>
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>予約詳細</DialogTitle><DialogDescription>予約番号 {current.id}</DialogDescription></DialogHeader>
      <section className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
        <InfoRow label="患者名" value={current.patient.name} /><InfoRow label="診察券番号" value={current.patient.id} /><InfoRow label="電話番号" value={current.patient.phone} /><InfoRow label="生年月日" value={current.patient.birthDate} />
        <Link className={buttonVariants({ variant: "outline", size: "sm", className: "col-span-2" })} href={`/admin/patients/${current.patientId}`} onClick={() => close(false)}>患者履歴を見る</Link>
      </section>
      <section className="grid grid-cols-2 gap-4 rounded-lg border p-4">
        <InfoRow label="予約内容" value={current.reservationType.name} /><InfoRow label="担当医" value={doctors.find((doctor) => doctor.id === current.doctorId)?.name ?? "未設定"} /><InfoRow label="予約日時" value={dateTimeLabel} /><InfoRow label="予約番号" value={current.id} />
        <div><span className="block text-xs text-muted-foreground">予約経路</span><ReservationSourceBadge source={current.reservationSource} /></div><div><span className="block text-xs text-muted-foreground">状態</span><ReservationStatusBadge status={current.status} /></div>
      </section>
      {current.status !== "CANCELLED" && <div className="space-y-1"><Label htmlFor="detail-status">受付状態を変更</Label><select id="detail-status" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={current.status} onChange={(event) => onStatusChange?.(current.id, event.target.value as ReservationStatus)}>{(Object.entries(RESERVATION_STATUS_LABEL) as [ReservationStatus, string][]).filter(([status]) => status !== "CANCELLED").map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></div>}
      <div><Label className="text-xs text-muted-foreground">備考</Label><p className="min-h-10 rounded-md border bg-background px-3 py-2 text-sm">{current.notes || "特記事項なし"}</p></div>
      {rescheduling && <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
        <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="edit-date">変更後の日付</Label><Input id="edit-date" type="date" value={proposedDate} onChange={(event) => { setDate(event.target.value); setConfirmChange(false); }} /></div>{current.startTime && <div><Label htmlFor="edit-time">変更後の時間</Label><Input id="edit-time" type="time" value={proposedTime} onChange={(event) => { setTime(event.target.value); setConfirmChange(false); }} /></div>}</div>
        <p role="status" className={`text-sm ${availability.available ? "text-emerald-700" : "text-destructive"}`}>{availability.available ? `空きあり（${availability.booked}名／定員${availability.capacity}名）` : availability.reason}</p>
        {confirmChange ? <div className="space-y-2 rounded-md border bg-background p-3 text-sm"><p>{formatDateJp(proposedDate)} {proposedTime || "当日順番"} に変更しますか？</p><div className="flex gap-2"><Button size="sm" onClick={saveChange}>変更を確定</Button><Button size="sm" variant="outline" onClick={() => setConfirmChange(false)}>戻る</Button></div></div> : <Button size="sm" disabled={!availability.available} onClick={() => setConfirmChange(true)}>変更内容を確認</Button>}
      </section>}
      {confirmCancel && <section className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><p>この予約をキャンセルしますか？</p><div className="flex gap-2"><Button size="sm" variant="destructive" onClick={() => { onStatusChange?.(current.id, "CANCELLED"); close(false); }}>キャンセルを確定</Button><Button size="sm" variant="outline" onClick={() => setConfirmCancel(false)}>戻る</Button></div></section>}
      <Separator /><div className="flex flex-wrap justify-between gap-1 text-xs text-muted-foreground"><span>作成日時: {formatDateTimeFull(current.createdAt)}</span><span>更新日時: {formatDateTimeFull(current.updatedAt)}</span></div>
      <DialogFooter className="flex-row justify-between gap-2 sm:justify-between"><div className="flex flex-wrap gap-2"><EhrLinkButton patientId={current.patient.id} patientName={current.patient.name} compact /><Button variant="outline" size="sm" disabled={current.status === "CANCELLED"} onClick={() => { setRescheduling((value) => !value); setConfirmCancel(false); }}>予約変更</Button><Button variant="outline" size="sm" disabled={current.status === "CANCELLED"} className="text-destructive hover:text-destructive" onClick={() => { setConfirmCancel(true); setRescheduling(false); }}>キャンセル</Button></div><Button size="sm" onClick={() => onStatusChange?.(current.id, "CHECKED_IN")} disabled={current.status !== "RESERVED"}>受付する</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-xs text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}
