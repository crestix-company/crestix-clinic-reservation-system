"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reservationTypes } from "@/data/mock/reservation-types";
import { RESERVATION_SOURCE_LABEL } from "@/lib/labels";
import { getToday } from "@/lib/services/reservation-service";
import { useDemoStore } from "@/components/admin/demo-store";
import { checkBookingAvailability } from "@/lib/booking-availability";
import type { Patient, ReservationSource } from "@/types/domain";
import type { EnrichedReservation } from "@/lib/services/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (reservation: EnrichedReservation) => void;
  initialDate?: string;
  initialTime?: string;
  initialDoctorId?: string;
  initialPatient?: Patient;
};

const SOURCES: ReservationSource[] = ["WEB", "LINE", "GOOGLE", "EHR", "COUNTER", "PHONE"];

let localSeq = 0;

export function NewReservationDialog({ open, onOpenChange, onCreate, initialDate, initialTime, initialDoctorId, initialPatient }: Props) {
  const { types, doctors, reservations, schedule } = useDemoStore();
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [typeId, setTypeId] = useState(reservationTypes[0].id);
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState(getToday());
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [error, setError] = useState("");
  const [source, setSource] = useState<ReservationSource>("COUNTER");

  const isWalkInGeneral = types.find((t) => t.id === typeId)?.code === "GENERAL";

  function handleSubmit() {
    if (!(initialPatient?.name ?? patientName).trim()) return;
    const type = types.find((t) => t.id === typeId)!;
    const chosenDate = initialDate ?? date;
    const chosenTime = initialTime ?? time;
    const now = new Date().toISOString();
    const slotTime = initialTime ? chosenTime : type.code === "GENERAL" ? "" : chosenTime;
    const assignedDoctor = initialDoctorId ?? doctorId;
    if (!chosenDate || !assignedDoctor) { setError("予約日と担当医を選択してください。"); return; }
    const availability = checkBookingAvailability({ date: chosenDate, time: slotTime, doctorId: assignedDoctor, reservationTypeId: type.id }, reservations, types, schedule);
    if (!availability.available) { setError(availability.reason); return; }
    localSeq += 1;
    const reservation: EnrichedReservation = {
      id: `rsv-new-${localSeq}`,
      clinicId: type.clinicId,
      patientId: initialPatient?.id ?? `pt-new-${localSeq}`,
      reservationTypeId: type.id,
      doctorId: assignedDoctor,
      reservationDate: chosenDate,
      startTime: slotTime,
      endTime: slotTime ? (() => { const [hour, minute] = slotTime.split(":").map(Number); const total = hour * 60 + minute + (type.durationMinutes ?? 30); return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; })() : "",
      reservationSource: source,
      acquisitionSource: source,
      status: "RESERVED",
      notes: "",
      createdAt: now,
      updatedAt: now,
      patient: initialPatient ?? {
        id: `pt-new-${localSeq}`,
        clinicId: type.clinicId,
        name: patientName.trim(),
        kana: "",
        phone: phone.trim() || "未登録",
        birthDate: "未登録",
      },
      reservationType: type,
    };
    onCreate(reservation);
    setPatientName(""); setPhone(""); setError("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規予約</DialogTitle>
          <DialogDescription>管理画面共通のデモ予約に登録します。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-res-name">患者名</Label>
            <Input id="new-res-name" value={initialPatient?.name ?? patientName} disabled={!!initialPatient} onChange={(e) => setPatientName(e.target.value)} placeholder="例: 山田太郎" />
          </div>
          <div className="space-y-1.5"><Label htmlFor="new-res-phone">電話番号</Label><Input id="new-res-phone" value={initialPatient?.phone ?? phone} disabled={!!initialPatient} onChange={(e) => setPhone(e.target.value)} placeholder="例: 090-1234-5678" /></div>

          <div className="space-y-1.5">
            <Label>予約内容</Label>
            <Select value={typeId} onValueChange={(v) => v && setTypeId(v)}>
              <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => types.find((t) => t.id === v)?.name ?? ""}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {types.filter((t) => t.active).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label htmlFor="new-res-date">予約日</Label><Input id="new-res-date" type="date" value={initialDate ?? date} disabled={!!initialDate} onChange={(e) => setDate(e.target.value)} /></div><div className="space-y-1.5"><Label>担当医</Label><Select value={initialDoctorId ?? doctorId} onValueChange={(v) => v && setDoctorId(v)} disabled={!!initialDoctorId}><SelectTrigger className="w-full"><SelectValue>{(v: string) => doctors.find((d) => d.id === v)?.name ?? "担当医"}</SelectValue></SelectTrigger><SelectContent>{doctors.filter((d) => d.active).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-res-time">時間</Label>
              {isWalkInGeneral && !initialTime ? (
                <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">当日受付（時間指定なし）</div>
              ) : (
                <Input id="new-res-time" type="time" value={initialTime ?? time} disabled={!!initialTime} onChange={(e) => setTime(e.target.value)} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>予約経路</Label>
              <Select value={source} onValueChange={(v) => setSource(v as ReservationSource)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: ReservationSource) => RESERVATION_SOURCE_LABEL[v] ?? ""}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {RESERVATION_SOURCE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>登録する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
