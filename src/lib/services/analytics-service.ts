import { reservationTypes } from "@/data/mock/reservation-types";
import { RESERVATION_SOURCE_LABEL } from "@/lib/labels";
import type { ReservationSource } from "@/types/domain";
import { getReservationsByPeriod, summarizeByType, summarizeBySource } from "./reservation-service";

export type TypeSourceMatrixRow = {
  reservationTypeId: string;
  typeName: string;
  bySource: { source: ReservationSource; label: string; count: number }[];
  total: number;
};

const SOURCES: ReservationSource[] = ["WEB", "LINE", "GOOGLE", "EHR", "COUNTER"];

export function getMonthlyAnalytics(referenceDate?: string) {
  const monthly = getReservationsByPeriod("month", referenceDate).filter((r) => r.status !== "CANCELLED");

  const byType = summarizeByType(monthly);
  const bySource = summarizeBySource(monthly);

  const matrix: TypeSourceMatrixRow[] = reservationTypes
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
