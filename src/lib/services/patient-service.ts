import { patients as mockPatients, getPatientById as getPatientByIdRaw } from "@/data/mock/patients";
import { listEnrichedReservations } from "./reservation-service";

export function listPatients() {
  return [...mockPatients];
}

export function getPatientById(id: string) {
  return getPatientByIdRaw(id);
}

export function getPatientReservationCount(patientId: string): number {
  return listEnrichedReservations().filter((r) => r.patientId === patientId).length;
}
