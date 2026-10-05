import type { Patient, Reservation, ReservationType } from "@/types/domain";

/**
 * A reservation joined with its patient and type for display purposes.
 * UI components should depend on this shape, not on the raw mock arrays,
 * so a future API-backed implementation of these services is a drop-in
 * replacement.
 */
export type EnrichedReservation = Reservation & {
  patient: Patient;
  reservationType: ReservationType;
};

export type ReservationTypeCount = {
  reservationTypeId: string;
  name: string;
  count: number;
};

export type ReservationSourceCount = {
  source: string;
  label: string;
  count: number;
};

export type DashboardKpis = {
  totalToday: number;
  sameDayConsultation: number;
  examReservation: number;
  waiting: number;
};

export type Period = "today" | "week" | "month";
