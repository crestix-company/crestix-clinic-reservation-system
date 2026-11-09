import { patients as mockPatients, getPatientById as getPatientByIdRaw } from "@/data/mock/patients";
import { listEnrichedReservations } from "./reservation-service";
import type { EnrichedReservation } from "./types";
import type { Patient } from "@/types/domain";

export function listPatients() {
  return [...mockPatients];
}

export function getPatientById(id: string) {
  return getPatientByIdRaw(id);
}

export function getPatientReservationCount(patientId: string): number {
  return listEnrichedReservations().filter((r) => r.patientId === patientId).length;
}

export function getPatientSummary(patient: Patient, reservations: EnrichedReservation[], referenceDate: string) {
  const history = reservations.filter((reservation) => reservation.patientId === patient.id)
    .sort((a, b) => (a.reservationDate + a.startTime).localeCompare(b.reservationDate + b.startTime));
  const visits = history.filter((reservation) => reservation.status === "COMPLETED");
  const upcoming = history.filter((reservation) => reservation.reservationDate >= referenceDate && reservation.status === "RESERVED");
  const visitOrder = new Map(visits.map((reservation, index) => [reservation.id, index + 1]));
  return {
    patient,
    firstVisit: visits[0]?.reservationDate ?? null,
    lastVisit: visits.at(-1)?.reservationDate ?? null,
    visitCount: visits.length,
    nextReservation: upcoming[0] ?? null,
    history: history.toReversed().map((reservation) => ({ reservation, visitNumber: visitOrder.get(reservation.id) ?? null })),
  };
}
