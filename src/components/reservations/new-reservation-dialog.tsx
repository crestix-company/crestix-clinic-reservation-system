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
import type { ReservationSource } from "@/types/domain";
import type { EnrichedReservation } from "@/lib/services/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (reservation: EnrichedReservation) => void;
};

const SOURCES: ReservationSource[] = ["WEB", "LINE", "GOOGLE", "EHR", "COUNTER", "PHONE"];

let localSeq = 0;

export function NewReservationDialog({ open, onOpenChange, onCreate }: Props) {
  const [patientName, setPatientName] = useState("");
  const [typeId, setTypeId] = useState(reservationTypes[0].id);
  const [time, setTime] = useState("09:00");
  const [source, setSource] = useState<ReservationSource>("COUNTER");

  const isWalkInGeneral = reservationTypes.find((t) => t.id === typeId)?.code === "GENERAL";

  function handleSubmit() {
    if (!patientName.trim()) return;
    localSeq += 1;
    const type = reservationTypes.find((t) => t.id === typeId)!;
    const today = getToday();
    const now = new Date().toISOString();
    const slotTime = type.code === "GENERAL" ? "" : time;
    const reservation: EnrichedReservation = {
      id: `rsv-new-${localSeq}`,
      clinicId: type.clinicId,
      patientId: `pt-new-${localSeq}`,
      reservationTypeId: type.id,
      reservationDate: today,
      startTime: slotTime,
      endTime: slotTime,
      reservationSource: source,
      acquisitionSource: source,
      status: "RESERVED",
      notes: "",
      createdAt: now,
      updatedAt: now,
      patient: {
        id: `pt-new-${localSeq}`,
        clinicId: type.clinicId,
        name: patientName.trim(),
        kana: "",
        phone: "未登録",
        birthDate: "未登録",
      },
      reservationType: type,
    };
    onCreate(reservation);
    setPatientName("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規予約</DialogTitle>
          <DialogDescription>デモ用の簡易登録フォームです。登録内容はこの画面を閉じるまで保持されます。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-res-name">患者名</Label>
            <Input id="new-res-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="例: 山田太郎" />
          </div>

          <div className="space-y-1.5">
            <Label>予約内容</Label>
            <Select value={typeId} onValueChange={(v) => v && setTypeId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: string) => reservationTypes.find((t) => t.id === v)?.name ?? ""}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reservationTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-res-time">時間</Label>
              {isWalkInGeneral ? (
                <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">当日受付（時間指定なし）</div>
              ) : (
                <Input id="new-res-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
