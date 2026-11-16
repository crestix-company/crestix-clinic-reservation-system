"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reservationTypes } from "@/data/mock/reservation-types";
import { getToday } from "@/lib/services/reservation-service";
import { useDemoStore } from "@/components/admin/demo-store";
import { checkBookingAvailability } from "@/lib/booking-availability";
import type { Patient } from "@/types/domain";
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

let localSeq = 0;
const PHONE_PATTERN = /^(?:0\d{1,4}-?\d{1,4}-?\d{3,4})$/;

export function NewReservationDialog({ open, onOpenChange, onCreate, initialDate, initialTime, initialDoctorId, initialPatient }: Props) {
  const { types, doctors, reservations, schedule } = useDemoStore();
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [typeId, setTypeId] = useState(reservationTypes[0].id);
  const [time, setTime] = useState("09:00");
  const [noTime, setNoTime] = useState(false);
  const [date, setDate] = useState(getToday());
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [error, setError] = useState("");

  const nameValue = initialPatient?.name ?? patientName;
  const phoneValue = initialPatient?.phone ?? phone;
  const nameValid = useMemo(() => {
    const value = nameValue.trim();
    return value.length >= 2 && value.length <= 50 && !/^\d+$/.test(value);
  }, [nameValue]);
  const phoneValid = useMemo(() => PHONE_PATTERN.test(phoneValue.trim()), [phoneValue]);

  function handleSubmit() {
    setError("");
    if (!nameValid) { setError("患者名は2〜50文字で、数字のみでは登録できません。"); return; }
    if (!phoneValid) { setError("電話番号を10〜11桁の国内電話番号形式で入力してください。"); return; }

    const type = types.find((t) => t.id === typeId);
    if (!type) { setError("診療メニューを選択してください。"); return; }
    const chosenDate = initialDate ?? date;
    const chosenTime = initialTime ?? (noTime ? "" : time);
    const assignedDoctor = initialDoctorId ?? doctorId;
    if (!chosenDate || !assignedDoctor || (!noTime && !chosenTime)) { setError("予約日・担当医を選択し、時間指定予約では予約時間も入力してください。"); return; }

    const availability = checkBookingAvailability(
      { date: chosenDate, time: chosenTime, doctorId: assignedDoctor, reservationTypeId: type.id },
      reservations,
      types,
      schedule,
    );
    if (!availability.available) { setError(availability.reason); return; }

    localSeq += 1;
    const now = new Date().toISOString();
    const [hour, minute] = chosenTime ? chosenTime.split(":").map(Number) : [0, 0];
    const total = hour * 60 + minute + (type.durationMinutes ?? 30);
    const patientId = initialPatient?.id ?? `pt-new-${localSeq}`;
    const patient: Patient = initialPatient ?? {
      id: patientId,
      clinicId: type.clinicId,
      name: patientName.trim(),
      kana: "",
      phone: phone.trim(),
      birthDate: "未登録",
      ehrPatientId: undefined,
    };

    const reservation: EnrichedReservation = {
      id: `rsv-new-${localSeq}`,
      clinicId: type.clinicId,
      patientId,
      reservationTypeId: type.id,
      doctorId: assignedDoctor,
      reservationDate: chosenDate,
      startTime: chosenTime,
      endTime: chosenTime ? `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}` : "",
      reservationSource: "COUNTER",
      acquisitionSource: "COUNTER",
      status: "RESERVED",
      notes: "",
      createdAt: now,
      updatedAt: now,
      patient,
      reservationType: type,
    };

    onCreate(reservation);
    setPatientName("");
    setPhone("");
    setError("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規予約</DialogTitle>
          <DialogDescription>院内スタッフが登録する予約です。予約経路は「院内受付」で固定されます。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-res-name">患者名 <span className="text-destructive">*</span></Label>
            <Input id="new-res-name" value={nameValue} disabled={!!initialPatient} onChange={(e) => setPatientName(e.target.value)} placeholder="例: 山田太郎" aria-invalid={!initialPatient && patientName.length > 0 && !nameValid} />
            {!initialPatient && patientName.length > 0 && <p className={`text-xs ${nameValid ? "text-emerald-700" : "text-destructive"}`}>{nameValid ? "入力形式OK" : "2〜50文字で入力してください（数字のみ不可）"}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-res-phone">電話番号 <span className="text-destructive">*</span></Label>
            <Input id="new-res-phone" value={phoneValue} disabled={!!initialPatient} onChange={(e) => setPhone(e.target.value)} placeholder="例: 090-1234-5678" aria-invalid={!initialPatient && phone.length > 0 && !phoneValid} />
            {!initialPatient && phone.length > 0 && <p className={`text-xs ${phoneValid ? "text-emerald-700" : "text-destructive"}`}>{phoneValid ? "電話番号形式OK" : "10〜11桁の国内電話番号を入力してください"}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>診療メニュー</Label>
            <Select value={typeId} onValueChange={(v) => v && setTypeId(v)}>
              <SelectTrigger className="w-full"><SelectValue>{(v: string) => types.find((t) => t.id === v)?.name ?? ""}</SelectValue></SelectTrigger>
              <SelectContent>{types.filter((t) => t.active).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="new-res-date">予約日</Label><Input id="new-res-date" type="date" value={initialDate ?? date} disabled={!!initialDate} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>担当医</Label><Select value={initialDoctorId ?? doctorId} onValueChange={(v) => v && setDoctorId(v)} disabled={!!initialDoctorId}><SelectTrigger className="w-full"><SelectValue>{(v: string) => doctors.find((d) => d.id === v)?.name ?? "担当医"}</SelectValue></SelectTrigger><SelectContent>{doctors.filter((d) => d.active).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
          </div>

          <div className="space-y-2">
            <Label>予約時間の指定</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setNoTime(false)} className={`rounded-md border px-3 py-2 text-sm ${!noTime ? "border-primary bg-primary/5 font-medium text-primary" : "hover:bg-muted/50"}`}>時間を指定する</button>
              <button type="button" onClick={() => setNoTime(true)} className={`rounded-md border px-3 py-2 text-sm ${noTime ? "border-primary bg-primary/5 font-medium text-primary" : "hover:bg-muted/50"}`}>時間指定なし</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-res-time">予約時間</Label>
              {noTime ? <div className="flex h-9 items-center rounded-md border bg-amber-50 px-3 text-sm text-amber-800">時間指定なし予約</div> : <Input id="new-res-time" type="time" value={initialTime ?? time} disabled={!!initialTime} onChange={(e) => setTime(e.target.value)} />}
            </div>
            <div className="space-y-1.5"><Label>予約経路</Label><div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm font-medium">院内受付</div><p className="text-xs text-muted-foreground">管理画面からの登録は変更できません。</p></div>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit}>登録する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
