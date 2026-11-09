"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationStatusBadge } from "@/components/reservations/reservation-status-badge";
import { NewReservationDialog } from "@/components/reservations/new-reservation-dialog";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { useDemoStore } from "@/components/admin/demo-store";
import { listPatients, getPatientSummary } from "@/lib/services/patient-service";
import { getToday } from "@/lib/services/reservation-service";
import { formatDateJp } from "@/lib/date";

export function PatientDetail({ patientId }: { patientId: string }) {
  const { reservations, doctors, types, addReservation, updateReservation, updateStatus } = useDemoStore();
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const patient = reservations.find((reservation) => reservation.patientId === patientId)?.patient ?? listPatients().find((item) => item.id === patientId);
  if (!patient) return <div className="space-y-3"><h1 className="text-xl font-semibold">患者が見つかりません</h1><Link href="/admin/patients" className="text-primary underline">患者一覧へ戻る</Link></div>;
  const summary = getPatientSummary(patient, reservations, getToday());
  const selected = reservations.find((reservation) => reservation.id === selectedId) ?? null;

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Link href="/admin/patients" className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />患者一覧へ</Link><h1 className="text-2xl font-semibold tracking-tight">{patient.name} さん</h1><p className="text-sm text-muted-foreground">診察券番号 {patient.id}</p></div><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />この患者の新規予約</Button></div>
    <Card><CardHeader><CardTitle>基本情報</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4"><Info label="氏名" value={patient.name} /><Info label="フリガナ" value={patient.kana || "未登録"} /><Info label="生年月日" value={patient.birthDate} /><Info label="電話番号" value={patient.phone} /><Info label="診察券番号" value={patient.id} /><Info label="初回来院日" value={summary.firstVisit ? formatDateJp(summary.firstVisit) : "—"} /><Info label="最終来院日" value={summary.lastVisit ? formatDateJp(summary.lastVisit) : "—"} /><Info label="来院済み回数" value={`${summary.visitCount}回`} /><Info label="次回予約" value={summary.nextReservation ? `${formatDateJp(summary.nextReservation.reservationDate)} ${summary.nextReservation.startTime || "当日順番"}` : "なし"} /></CardContent></Card>
    <Card><CardHeader><CardTitle>来院・予約履歴</CardTitle></CardHeader><CardContent className="space-y-2">{summary.history.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">予約・来院履歴はありません。</p> : summary.history.map(({ reservation, visitNumber }) => {
      const type = types.find((item) => item.id === reservation.reservationTypeId);
      const upcoming = reservation.id === summary.nextReservation?.id;
      const title = visitNumber ? visitNumber === 1 ? "初回" : `${visitNumber}回目` : upcoming ? "次回予約" : reservation.status === "CANCELLED" ? "キャンセル済み" : "予約・受付履歴";
      return <details key={reservation.id} className="group rounded-lg border border-l-4 bg-card" style={{ borderLeftColor: type?.color ?? "#64748b" }}><summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-3 text-sm"><span className="font-semibold">{title}｜{formatDateJp(reservation.reservationDate)}</span><span className="text-muted-foreground">{type?.name ?? reservation.reservationType.name}</span><span className="ml-auto"><ReservationStatusBadge status={reservation.status} /></span></summary><div className="grid gap-2 border-t px-3 py-3 text-sm sm:grid-cols-2"><Info label="予約時間" value={reservation.startTime || "当日順番"} /><Info label="担当医" value={doctors.find((doctor) => doctor.id === reservation.doctorId)?.name ?? "未設定"} /><Info label="予約番号" value={reservation.id} /><Info label="受付・来院状態" value={reservation.status === "COMPLETED" ? "来院済み" : reservation.status === "CANCELLED" ? "キャンセル済み" : "来院完了の記録なし"} /><Button size="sm" variant="outline" className="sm:col-span-2" onClick={() => setSelectedId(reservation.id)}>予約詳細を開く</Button></div></details>;
    })}</CardContent></Card>
    <NewReservationDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addReservation} initialPatient={patient} />
    <ReservationDetailDialog reservation={selected} open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)} onStatusChange={updateStatus} onUpdate={updateReservation} />
  </div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>;
}
