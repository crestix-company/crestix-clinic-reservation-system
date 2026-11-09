"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/components/admin/demo-store";
import { listPatients, getPatientSummary } from "@/lib/services/patient-service";
import { getToday } from "@/lib/services/reservation-service";
import { formatDateJp } from "@/lib/date";

const columns = "xl:grid-cols-[90px_minmax(110px,1.1fr)_minmax(100px,1fr)_120px_85px_85px_65px_100px_66px]";

export default function PatientsPage() {
  const { reservations } = useDemoStore();
  const [keyword, setKeyword] = useState("");
  const patients = new Map(listPatients().map((patient) => [patient.id, patient]));
  reservations.forEach((reservation) => patients.set(reservation.patient.id, reservation.patient));
  const filtered = [...patients.values()].filter((patient) =>
    [patient.id, patient.name, patient.kana, patient.phone].some((value) => value.toLowerCase().includes(keyword.trim().toLowerCase())),
  );

  return <div className="space-y-4">
    <div><h1 className="text-2xl font-semibold tracking-tight">患者一覧</h1><p className="text-sm text-muted-foreground">来院回数は完了した予約のみを数えています。</p></div>
    <Card><CardContent className="space-y-3 pt-4">
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="患者検索" placeholder="氏名・フリガナ・電話番号・診察券番号" className="pl-9" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></div>
      <div className="rounded-lg border">
        <div className={`hidden gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground xl:grid ${columns}`}><span>診察券番号</span><span>患者名</span><span>フリガナ</span><span>電話番号</span><span>初回来院日</span><span>最終来院日</span><span>来院回数</span><span>次回予約</span><span>操作</span></div>
        <div className="max-h-[calc(100vh-250px)] min-h-36 overflow-y-auto">
          {filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">該当する患者がいません</p> : filtered.map((patient) => {
            const summary = getPatientSummary(patient, reservations, getToday());
            return <div key={patient.id} className={`grid gap-1 border-b px-3 py-2 text-sm last:border-b-0 xl:items-center xl:gap-2 ${columns}`}>
              <span className="truncate font-mono text-xs text-muted-foreground">{patient.id}</span>
              <Link href={`/admin/patients/${patient.id}`} className="truncate font-medium text-primary hover:underline">{patient.name}</Link>
              <span className="truncate">{patient.kana || "—"}</span><span>{patient.phone}</span>
              <span>{summary.firstVisit ? formatDateJp(summary.firstVisit) : "—"}</span><span>{summary.lastVisit ? formatDateJp(summary.lastVisit) : "—"}</span>
              <span>{summary.visitCount}回</span><span>{summary.nextReservation ? formatDateJp(summary.nextReservation.reservationDate) : "—"}</span>
              <Link href={`/admin/patients/${patient.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>詳細</Link>
            </div>;
          })}
        </div>
      </div>
    </CardContent></Card>
  </div>;
}
