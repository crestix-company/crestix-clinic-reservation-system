import { isWithinInterval, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import type { Reservation } from "@/types/domain";
import { reservations as mockReservations, TODAY } from "@/data/mock/reservations";
import { getPatientById } from "@/data/mock/patients";
import { getReservationTypeById, reservationTypes } from "@/data/mock/reservation-types";
import { RESERVATION_SOURCE_LABEL } from "@/lib/labels";
import type { DashboardKpis, EnrichedReservation, Period, ReservationSourceCount, ReservationTypeCount } from "./types";

/**
 * Data access layer for reservations. Everything here reads from the
 * in-memory mock dataset today. A future implementation can swap the body
 * of these functions for Supabase/Prisma queries without touching any
 * calling UI component, since the exported signatures stay the same.
 */

export function getToday(): string {
  return TODAY;
}

export function listReservations(): Reservation[] {
  return [...mockReservations];
}

export function getReservation(id: string): Reservation | undefined {
  return mockReservations.find((r) => r.id === id);
}

export function enrich(reservation: Reservation): EnrichedReservation {
  const patient = getPatientById(reservation.patientId);
  const reservationType = getReservationTypeById(reservation.reservationTypeId);
  if (!patient || !reservationType) {
    throw new Error(`Missing reference data for reservation ${reservation.id}`);
  }
  return { ...reservation, patient, reservationType };
}

export function listEnrichedReservations(): EnrichedReservation[] {
  return mockReservations.map(enrich);
}

export function getEnrichedReservation(id: string): EnrichedReservation | undefined {
  const reservation = getReservation(id);
  return reservation ? enrich(reservation) : undefined;
}

export function getReservationsByPeriod(period: Period, referenceDate: string = TODAY): Reservation[] {
  const ref = parseISO(referenceDate);
  if (period === "today") {
    return mockReservations.filter((r) => r.reservationDate === referenceDate);
  }
  const interval =
    period === "week"
      ? { start: startOfWeek(ref, { weekStartsOn: 1 }), end: endOfWeek(ref, { weekStartsOn: 1 }) }
      : { start: startOfMonth(ref), end: endOfMonth(ref) };
  return mockReservations.filter((r) => isWithinInterval(parseISO(r.reservationDate), interval));
}

export function getReservationsByDate(date: string): Reservation[] {
  return mockReservations.filter((r) => r.reservationDate === date);
}

/**
 * General consultations (一般診察) are walk-in style and get issued a
 * reception number when the patient is booked, unlike scheduled exam
 * reservations which are identified by their time slot instead. The
 * sequence starts at 021 to reflect tickets already issued earlier in the
 * day before this reservation list was pulled.
 */
export function getReceptionNumberLabel(reservation: Reservation): string | null {
  const generalTypeId = reservationTypes.find((t) => t.code === "GENERAL")?.id;
  if (!generalTypeId || reservation.reservationTypeId !== generalTypeId) return null;
  const sameDayGeneral = getReservationsByDate(reservation.reservationDate).filter((r) => r.reservationTypeId === generalTypeId);
  const idx = sameDayGeneral.findIndex((r) => r.id === reservation.id);
  if (idx === -1) return null;
  return String(21 + idx).padStart(3, "0");
}

export function summarizeByType(reservations: Reservation[]): ReservationTypeCount[] {
  const counts = new Map<string, number>();
  for (const r of reservations) {
    counts.set(r.reservationTypeId, (counts.get(r.reservationTypeId) ?? 0) + 1);
  }
  return reservationTypes
    .filter((t) => counts.has(t.id))
    .map((t) => ({ reservationTypeId: t.id, name: t.name, count: counts.get(t.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export function summarizeBySource(reservations: Reservation[]): ReservationSourceCount[] {
  const counts = new Map<string, number>();
  for (const r of reservations) {
    counts.set(r.reservationSource, (counts.get(r.reservationSource) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, label: RESERVATION_SOURCE_LABEL[source as keyof typeof RESERVATION_SOURCE_LABEL], count }))
    .sort((a, b) => b.count - a.count);
}

const EXAM_TYPE_CODES = ["GASTRO", "COLON", "CHECKUP", "OTHER"];

export function getDashboardKpis(referenceDate: string = TODAY): DashboardKpis {
  // Counts every reservation booked for the day (including cancellations),
  // matching how "本日の予約" is communicated to reception staff — a
  // cancellation is still visible in the day's table with a status badge.
  const todays = getReservationsByDate(referenceDate);
  const examTypeIds = reservationTypes.filter((t) => EXAM_TYPE_CODES.includes(t.code)).map((t) => t.id);
  const generalTypeId = reservationTypes.find((t) => t.code === "GENERAL")?.id;

  const examCounterWalkins = todays.filter((r) => examTypeIds.includes(r.reservationTypeId) && r.reservationSource === "COUNTER").length;
  const generalCount = todays.filter((r) => r.reservationTypeId === generalTypeId).length;
  const examTotal = todays.filter((r) => examTypeIds.includes(r.reservationTypeId)).length;
  const waiting = todays.filter((r) => r.status === "WAITING").length;

  return {
    totalToday: todays.length,
    sameDayConsultation: generalCount + examCounterWalkins,
    examReservation: examTotal - examCounterWalkins,
    waiting,
  };
}

export function searchReservations(
  query: {
    keyword?: string;
    reservationTypeId?: string;
    reservationSource?: string;
    status?: string;
    date?: string;
  } = {},
): EnrichedReservation[] {
  let results = listEnrichedReservations();

  if (query.keyword) {
    const kw = query.keyword.trim().toLowerCase();
    results = results.filter(
      (r) =>
        r.patient.name.toLowerCase().includes(kw) ||
        r.patient.kana.toLowerCase().includes(kw) ||
        r.patient.phone.includes(kw) ||
        r.id.toLowerCase().includes(kw),
    );
  }
  if (query.reservationTypeId) {
    results = results.filter((r) => r.reservationTypeId === query.reservationTypeId);
  }
  if (query.reservationSource) {
    results = results.filter((r) => r.reservationSource === query.reservationSource);
  }
  if (query.status) {
    results = results.filter((r) => r.status === query.status);
  }
  if (query.date) {
    results = results.filter((r) => r.reservationDate === query.date);
  }

  return results.sort((a, b) => (a.reservationDate + a.startTime).localeCompare(b.reservationDate + b.startTime));
}
