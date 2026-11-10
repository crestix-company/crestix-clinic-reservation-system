"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { useDemoStore } from "@/components/admin/demo-store";
import { RESERVATION_SOURCE_LABEL, RESERVATION_STATUS_LABEL } from "@/lib/labels";
import { listPatients, getPatientSummary } from "@/lib/services/patient-service";
import { getToday } from "@/lib/services/reservation-service";
import { formatDateJp } from "@/lib/date";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationSource, ReservationStatus } from "@/types/domain";

const PAGE_SIZE = 10;
const ALL = "ALL";
const patientColumns = "xl:grid-cols-[90px_minmax(110px,1.1fr)_minmax(100px,1fr)_120px_85px_85px_65px_100px_66px]";

export default function ReservationsListPage() {
  const { reservations: allReservations, types, updateReservation, updateStatus } = useDemoStore();

  const [tab, setTab] = useState<"reservations" | "patients">("reservations");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [sourceFilter, setSourceFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EnrichedReservation | null>(null);

  const filteredReservations = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allReservations
      .filter((reservation) => {
        if (
          kw &&
          !(
            reservation.patient.name.toLowerCase().includes(kw) ||
            reservation.patient.kana.toLowerCase().includes(kw) ||
            reservation.patient.phone.includes(kw) ||
            reservation.patient.id.toLowerCase().includes(kw) ||
            reservation.id.toLowerCase().includes(kw)
          )
        ) {
          return false;
        }
        if (typeFilter !== ALL && reservation.reservationTypeId !== typeFilter) return false;
        if (sourceFilter !== ALL && reservation.reservationSource !== sourceFilter) return false;
        if (statusFilter !== ALL && reservation.status !== statusFilter) return false;
        if (dateFilter && reservation.reservationDate !== dateFilter) return false;
        return true;
      })
      .sort((a, b) => (b.reservationDate + b.startTime).localeCompare(a.reservationDate + a.startTime));
  }, [allReservations, keyword, typeFilter, sourceFilter, statusFilter, dateFilter]);

  const patients = useMemo(() => {
    const map = new Map(listPatients().map((patient) => [patient.id, patient]));
    allReservations.forEach((reservation) => map.set(reservation.patient.id, reservation.patient));
    const kw = keyword.trim().toLowerCase();
    return [...map.values()]
      .filter((patient) =>
        !kw ||
        [patient.id, patient.name, patient.kana, patient.phone].some((value) => value.toLowerCase().includes(kw)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }, [allReservations, keyword]);

  const reservationTotalPages = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE));
  const currentPage = Math.min(page, reservationTotalPages);
  const pageItems = filteredReservations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const currentSelected = allReservations.find((reservation) => reservation.id === selected?.id) ?? null;

  function resetPage() {
    setPage(1);
  }

  function handleTabChange(value: string) {
    setTab(value as "reservations" | "patients");
    setKeyword("");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">患者・予約管理</h1>
        <p className="text-sm text-muted-foreground">
          予約から探す場合と患者から探す場合を、同じ画面で切り替えて確認できます
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="reservations">予約から探す</TabsTrigger>
          <TabsTrigger value="patients">患者から探す</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                tab === "reservations"
                  ? "患者名・フリガナ・電話番号・患者ID・予約番号で検索"
                  : "氏名・フリガナ・電話番号・診察券番号で検索"
              }
              className="pl-9"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                resetPage();
              }}
            />
          </div>

          {tab === "reservations" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  if (!value) return;
                  setTypeFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="予約内容">
                    {(value: string) =>
                      value === ALL ? "予約内容: すべて" : types.find((type) => type.id === value)?.name ?? "予約内容"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>予約内容: すべて</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sourceFilter}
                onValueChange={(value) => {
                  if (!value) return;
                  setSourceFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="予約経路">
                    {(value: string) =>
                      value === ALL
                        ? "予約経路: すべて"
                        : RESERVATION_SOURCE_LABEL[value as ReservationSource] ?? "予約経路"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>予約経路: すべて</SelectItem>
                  {(Object.keys(RESERVATION_SOURCE_LABEL) as ReservationSource[]).map((source) => (
                    <SelectItem key={source} value={source}>
                      {RESERVATION_SOURCE_LABEL[source]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (!value) return;
                  setStatusFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="状態">
                    {(value: string) =>
                      value === ALL ? "状態: すべて" : RESERVATION_STATUS_LABEL[value as ReservationStatus] ?? "状態"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>状態: すべて</SelectItem>
                  {(Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {RESERVATION_STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  resetPage();
                }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {tab === "reservations" ? (
        <Card>
          <CardContent className="pt-6">
            <ReservationTable reservations={pageItems} variant="list" onRowClick={setSelected} />
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredReservations.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, filteredReservations.length)} / 全{filteredReservations.length}件
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="tabular-nums">
                  {currentPage} / {reservationTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= reservationTotalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <div
                className={`hidden gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground xl:grid ${patientColumns}`}
              >
                <span>診察券番号</span>
                <span>患者名</span>
                <span>フリガナ</span>
                <span>電話番号</span>
                <span>初回来院日</span>
                <span>最終来院日</span>
                <span>来院回数</span>
                <span>次回予約</span>
                <span>操作</span>
              </div>

              <div className="max-h-[calc(100vh-300px)] min-h-36 overflow-y-auto">
                {patients.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">該当する患者がいません</p>
                ) : (
                  patients.map((patient) => {
                    const summary = getPatientSummary(patient, allReservations, getToday());
                    return (
                      <div
                        key={patient.id}
                        className={`grid gap-1 border-b px-3 py-2 text-sm last:border-b-0 xl:items-center xl:gap-2 ${patientColumns}`}
                      >
                        <span className="truncate font-mono text-xs text-muted-foreground">{patient.id}</span>
                        <Link
                          href={`/admin/patients/${patient.id}`}
                          className="truncate font-medium text-primary hover:underline"
                        >
                          {patient.name}
                        </Link>
                        <span className="truncate">{patient.kana || "—"}</span>
                        <span>{patient.phone}</span>
                        <span>{summary.firstVisit ? formatDateJp(summary.firstVisit) : "—"}</span>
                        <span>{summary.lastVisit ? formatDateJp(summary.lastVisit) : "—"}</span>
                        <span>{summary.visitCount}回</span>
                        <span>{summary.nextReservation ? formatDateJp(summary.nextReservation.reservationDate) : "—"}</span>
                        <Link
                          href={`/admin/patients/${patient.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          詳細
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ReservationDetailDialog
        reservation={currentSelected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onStatusChange={updateStatus}
        onUpdate={updateReservation}
      />
    </div>
  );
}
