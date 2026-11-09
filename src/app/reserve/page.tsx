"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Stethoscope, Microscope, Activity, HeartPulse, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/components/admin/demo-store";
import { checkBookingAvailability } from "@/lib/booking-availability";
import { CALENDAR_TIME_SLOTS } from "@/components/calendar/reservation-calendar";

type Step = "type" | "date" | "time" | "info" | "confirm" | "done";

const TYPE_ICONS: Record<string, typeof Stethoscope> = {
  GENERAL: Stethoscope,
  GASTRO: Microscope,
  COLON: Activity,
  CHECKUP: HeartPulse,
};

const AVAILABILITY_MARK: Record<"open" | "few" | "full", { label: string; className: string }> = {
  open: { label: "○", className: "text-emerald-600 dark:text-emerald-400" },
  few: { label: "△", className: "text-amber-600 dark:text-amber-400" },
  full: { label: "×", className: "text-red-500" },
};

function StepHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {onBack ? (
        <button onClick={onBack} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
          <ChevronLeft className="size-5" />
        </button>
      ) : null}
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

export default function ReservePage() {
  const { reservations, types, doctors, schedule, addReservation, updateReservation, updateStatus } = useDemoStore();
  const bookableTypes = types.filter((type) => type.active && type.code !== "OTHER");
  const patientDoctor = doctors.find((doctor) => doctor.active) ?? doctors[0];
  const [step, setStep] = useState<Step>("type");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kana, setKana] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [visitType, setVisitType] = useState<"初診" | "再診">("初診");
  const [notes, setNotes] = useState("");
  const [reservationNumber, setReservationNumber] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const selectedType = bookableTypes.find((t) => t.id === typeId);
  const isWalkInGeneral = selectedType?.code === "GENERAL";

  const upcomingDates = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1)), []);

  function reset() {
    setStep("type");
    setTypeId(null);
    setDate(null);
    setTime(null);
    setName("");
    setKana("");
    setPhone("");
    setBirthDate("");
    setVisitType("初診");
    setNotes("");
    setReservationNumber("");
    setCancelled(false);
    setBookingError("");
  }

  function handleConfirm() {
    if (!selectedType || !patientDoctor) return;
    const bookingDate = isWalkInGeneral ? format(new Date(), "yyyy-MM-dd") : date;
    const bookingTime = isWalkInGeneral ? "" : time;
    if (!bookingDate || (!isWalkInGeneral && !bookingTime)) return;
    const availability = checkBookingAvailability({ date: bookingDate, time: bookingTime ?? "", doctorId: patientDoctor.id, reservationTypeId: selectedType.id }, reservations, types, schedule, reservationNumber || undefined);
    if (!availability.available) { setBookingError(availability.reason); return; }
    const d = new Date(`${bookingDate}T00:00:00`);
    const seq = String(reservations.filter((reservation) => reservation.id.startsWith(`R-${format(d, "MMdd")}-`)).length + 1).padStart(4, "0");
    const id = reservationNumber || `R-${format(d, "MMdd")}-${seq}`;
    const [hour, minute] = bookingTime ? bookingTime.split(":").map(Number) : [0, 0];
    const endMinutes = hour * 60 + minute + (selectedType.durationMinutes ?? 30);
    const endTime = bookingTime ? `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}` : "";
    const now = new Date().toISOString();
    const patient = { id: `pt-web-${id}`, clinicId: selectedType.clinicId, name: name.trim(), kana: kana.trim(), phone: phone.trim(), birthDate: birthDate || "未登録" };
    if (reservationNumber) updateReservation(id, { reservationDate: bookingDate, startTime: bookingTime ?? "", endTime, reservationTypeId: selectedType.id, reservationType: selectedType, patient, notes, status: "RESERVED" });
    else addReservation({ id, clinicId: selectedType.clinicId, patientId: patient.id, reservationTypeId: selectedType.id, doctorId: patientDoctor.id, reservationDate: bookingDate, startTime: bookingTime ?? "", endTime, reservationSource: "WEB", acquisitionSource: "WEB", status: "RESERVED", notes, createdAt: now, updatedAt: now, patient, reservationType: selectedType });
    setReservationNumber(id);
    setCancelled(false);
    setBookingError("");
    setStep("done");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div className="text-sm font-medium text-primary">瓦谷クリニック</div>
        <div className="text-xs text-muted-foreground">Web予約</div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6 pb-28">
        {step === "type" && (
          <div className="space-y-4">
            <StepHeader title="予約内容を選択してください" />
            <div className="grid grid-cols-2 gap-3">
              {bookableTypes.map((t) => {
                const Icon = TYPE_ICONS[t.code] ?? Stethoscope;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTypeId(t.id);
                      setDate(null);
                      setTime(null);
                      setStep(t.code === "GENERAL" ? "info" : "date");
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-6 text-center shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "date" && selectedType && (
          <div className="space-y-4">
            <StepHeader title="希望日を選択" onBack={() => setStep("type")} />
            <div className="grid grid-cols-3 gap-2">
              {upcomingDates.map((d) => {
                const iso = format(d, "yyyy-MM-dd");
                const active = date === iso;
                const closed = schedule.closedDays.includes(d.getDay());
                return (
                  <button
                    key={iso}
                    disabled={closed}
                    onClick={() => setDate(iso)}
                    className={cn(
                      "rounded-lg border px-2 py-3 text-center text-sm transition",
                      closed && "cursor-not-allowed opacity-40",
                      active ? "border-primary bg-primary/10 font-medium text-primary" : "bg-card hover:border-primary/40",
                    )}
                  >
                    <div>{format(d, "M/d", { locale: ja })}</div>
                    <div className="text-xs text-muted-foreground">{format(d, "(E)", { locale: ja })}</div>
                    {closed && <div className="text-[10px]">休診</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "time" && selectedType && date && (
          <div className="space-y-4">
            <StepHeader title="時間選択" onBack={() => setStep("date")} />
            <div className="grid grid-cols-2 gap-2">
              {CALENDAR_TIME_SLOTS.map((slot) => {
                const check = checkBookingAvailability({ date, time: slot, doctorId: patientDoctor?.id, reservationTypeId: selectedType.id }, reservations, types, schedule, reservationNumber || undefined);
                const availability = !check.available ? "full" : check.booked === 0 ? "open" : "few";
                const disabled = availability === "full";
                const active = time === slot;
                return (
                  <button
                    key={slot}
                    disabled={disabled}
                    onClick={() => setTime(slot)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition",
                      disabled && "cursor-not-allowed opacity-50",
                      active ? "border-primary bg-primary/10 font-medium text-primary" : "bg-card hover:border-primary/40",
                    )}
                  >
                    <span>{slot}</span>
                    <span className={AVAILABILITY_MARK[availability].className}>{AVAILABILITY_MARK[availability].label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "info" && (
          <div className="space-y-4">
            <StepHeader title="患者情報" onBack={() => setStep(isWalkInGeneral ? "type" : "time")} />
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="r-name">氏名</Label>
                  <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-kana">フリガナ</Label>
                  <Input id="r-kana" value={kana} onChange={(e) => setKana(e.target.value)} placeholder="ヤマダ タロウ" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-phone">電話番号</Label>
                  <Input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080-1234-5678" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-birth">生年月日</Label>
                  <Input id="r-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>初診・再診</Label>
                  <div className="flex gap-2">
                    {(["初診", "再診"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVisitType(v)}
                        className={cn(
                          "flex-1 rounded-lg border px-4 py-2 text-sm transition",
                          visitType === v ? "border-primary bg-primary/10 font-medium text-primary" : "bg-card",
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-notes">備考</Label>
                  <Textarea id="r-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="症状や気になる点があればご記入ください" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "confirm" && selectedType && (
          <div className="space-y-4">
            <StepHeader title="予約内容の確認" onBack={() => setStep("info")} />
            <Card>
              <CardContent className="space-y-3 pt-6 text-sm">
                <Row label="予約内容" value={selectedType.name} />
                <Row
                  label="予約日時"
                  value={isWalkInGeneral ? "当日受付（時間指定なし）" : `${date ? format(new Date(`${date}T00:00:00`), "M月d日(E)", { locale: ja }) : ""} ${time ?? ""}`}
                />
                <Row label="氏名" value={name} />
                <Row label="フリガナ" value={kana || "未入力"} />
                <Row label="電話番号" value={phone} />
                <Row label="生年月日" value={birthDate || "未入力"} />
                <Row label="初診・再診" value={visitType} />
                <Row label="備考" value={notes || "特記事項なし"} />
              </CardContent>
            </Card>
            {bookingError && <p role="alert" className="text-sm text-destructive">{bookingError}</p>}
          </div>
        )}

        {step === "done" && selectedType && (
          <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="size-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{cancelled ? "予約をキャンセルしました" : "予約が完了しました"}</h2>
              <p className="text-sm text-muted-foreground">{cancelled ? "キャンセルした予約内容" : "ご予約内容は以下の通りです"}</p>
            </div>
            <Card className="w-full">
              <CardContent className="space-y-2 pt-6 text-center">
                <div className="text-xs text-muted-foreground">予約番号</div>
                <div className="font-mono text-lg font-semibold tracking-wide">{reservationNumber}</div>
                <div className={cancelled ? "text-sm font-medium text-destructive" : "text-sm font-medium text-emerald-700"}>{cancelled ? "キャンセル済み" : "予約済み"}</div>
                <div className="pt-2 text-base font-medium">{selectedType.name}</div>
                <div className="text-sm text-muted-foreground">
                  {isWalkInGeneral
                    ? "当日受付（時間指定なし）"
                    : `${date ? format(new Date(`${date}T00:00:00`), "M月d日", { locale: ja }) : ""} ${time ?? ""}`}
                </div>
              </CardContent>
            </Card>
            {!cancelled && <div className="grid w-full grid-cols-2 gap-2"><Button variant="outline" onClick={() => setStep("type")}>予約内容を変更</Button><Button variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)}>予約をキャンセル</Button></div>}
            <Button variant="outline" className="w-full" onClick={reset}>
              トップに戻る
            </Button>
          </div>
        )}
      </main>
      {["date", "time", "info", "confirm"].includes(step) && <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 backdrop-blur"><div className="mx-auto flex max-w-md gap-2"><Button variant="outline" size="lg" className="w-24" onClick={() => setStep(step === "date" ? "type" : step === "time" ? "date" : step === "info" ? isWalkInGeneral ? "type" : "time" : "info")}>戻る</Button><Button size="lg" className="flex-1" disabled={(step === "date" && !date) || (step === "time" && !time) || (step === "info" && (!name || !phone))} onClick={() => step === "confirm" ? handleConfirm() : setStep(step === "date" ? "time" : step === "time" ? "info" : "confirm")}>{step === "confirm" ? reservationNumber ? "変更を確定する" : "予約を確定する" : step === "info" ? "予約内容を確認する" : "次へ"}</Button></div></div>}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>予約をキャンセル</DialogTitle><DialogDescription>予約番号 {reservationNumber} をキャンセルしますか？</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setCancelOpen(false)}>戻る</Button><Button variant="destructive" onClick={() => { updateStatus(reservationNumber, "CANCELLED"); setCancelled(true); setCancelOpen(false); }}>キャンセルを確定</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
