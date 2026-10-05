"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservationTable } from "@/components/reservations/reservation-table";
import { ReservationDetailDialog } from "@/components/reservations/reservation-detail-dialog";
import { listEnrichedReservations } from "@/lib/services/reservation-service";
import { reservationTypes } from "@/data/mock/reservation-types";
import { RESERVATION_SOURCE_LABEL, RESERVATION_STATUS_LABEL } from "@/lib/labels";
import type { EnrichedReservation } from "@/lib/services/types";
import type { ReservationSource, ReservationStatus } from "@/types/domain";

const PAGE_SIZE = 10;
const ALL = "ALL";

export default function ReservationsListPage() {
  const allReservations = useMemo(() => listEnrichedReservations(), []);
  const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [sourceFilter, setSourceFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EnrichedReservation | null>(null);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allReservations
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r))
      .filter((r) => {
        if (kw && !(r.patient.name.toLowerCase().includes(kw) || r.patient.phone.includes(kw) || r.id.toLowerCase().includes(kw))) {
          return false;
        }
        if (typeFilter !== ALL && r.reservationTypeId !== typeFilter) return false;
        if (sourceFilter !== ALL && r.reservationSource !== sourceFilter) return false;
        if (statusFilter !== ALL && r.status !== statusFilter) return false;
        if (dateFilter && r.reservationDate !== dateFilter) return false;
        return true;
      })
      .sort((a, b) => (b.reservationDate + b.startTime).localeCompare(a.reservationDate + a.startTime));
  }, [allReservations, overrides, keyword, typeFilter, sourceFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  function handleStatusChange(id: string, status: ReservationStatus) {
    setOverrides((prev) => ({ ...prev, [id]: status }));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">予約一覧</h1>
        <p className="text-sm text-muted-foreground">全{allReservations.length}件の予約データから検索・絞り込みができます</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="患者名・電話番号・予約番号で検索"
              className="pl-9"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                resetPage();
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                if (!v) return;
                setTypeFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="予約内容">
                  {(v: string) => (v === ALL ? "予約内容: すべて" : (reservationTypes.find((t) => t.id === v)?.name ?? "予約内容"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>予約内容: すべて</SelectItem>
                {reservationTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sourceFilter}
              onValueChange={(v) => {
                if (!v) return;
                setSourceFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="予約経路">
                  {(v: string) => (v === ALL ? "予約経路: すべて" : (RESERVATION_SOURCE_LABEL[v as ReservationSource] ?? "予約経路"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>予約経路: すべて</SelectItem>
                {(Object.keys(RESERVATION_SOURCE_LABEL) as ReservationSource[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {RESERVATION_SOURCE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                if (!v) return;
                setStatusFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="状態">
                  {(v: string) => (v === ALL ? "状態: すべて" : (RESERVATION_STATUS_LABEL[v as ReservationStatus] ?? "状態"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>状態: すべて</SelectItem>
                {(Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {RESERVATION_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                resetPage();
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ReservationTable reservations={pageItems} variant="list" onRowClick={setSelected} />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} / 全
              {filtered.length}件
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReservationDetailDialog
        reservation={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
