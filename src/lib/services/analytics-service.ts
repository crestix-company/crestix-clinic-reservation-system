import { reservationTypes } from "@/data/mock/reservation-types";
import { RESERVATION_SOURCE_LABEL } from "@/lib/labels";
import type { Reservation, ReservationSource, ReservationType } from "@/types/domain";
import { getReservationsByPeriod, getToday, summarizeByType, summarizeBySource } from "./reservation-service";

export type TypeSourceMatrixRow = {
  reservationTypeId: string;
  typeName: string;
  bySource: { source: ReservationSource; label: string; count: number }[];
  total: number;
};

const SOURCES: ReservationSource[] = ["WEB", "LINE", "GOOGLE", "EHR", "COUNTER", "PHONE"];

export function getMonthlyAnalytics(referenceDate?: string, allReservations?: Reservation[], configuredTypes: ReservationType[] = reservationTypes) {
  const base = allReservations ?? getReservationsByPeriod("month", referenceDate);
  const month = (referenceDate ?? getToday()).slice(0, 7);
  const monthly = base.filter((r) => r.reservationDate.startsWith(month) && r.status !== "CANCELLED");

  const byType = summarizeByType(monthly).map((row) => ({ ...row, name: configuredTypes.find((type) => type.id === row.reservationTypeId)?.name ?? row.name }));
  const bySource = summarizeBySource(monthly);

  const matrix: TypeSourceMatrixRow[] = configuredTypes
    .map((type) => {
      const typeReservations = monthly.filter((r) => r.reservationTypeId === type.id);
      if (typeReservations.length === 0) return null;
      const bySourceRow = SOURCES.map((source) => ({
        source,
        label: RESERVATION_SOURCE_LABEL[source],
        count: typeReservations.filter((r) => r.reservationSource === source).length,
      })).filter((row) => row.count > 0);
      return {
        reservationTypeId: type.id,
        typeName: type.name,
        bySource: bySourceRow,
        total: typeReservations.length,
      };
    })
    .filter((row): row is TypeSourceMatrixRow => row !== null)
    .sort((a, b) => b.total - a.total);

  return {
    totalCount: monthly.length,
    byType,
    bySource,
    matrix,
  };
}
