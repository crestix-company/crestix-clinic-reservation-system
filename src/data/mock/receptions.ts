import type { Reception, ReceptionStatus } from "@/types/domain";
import { CLINIC_ID } from "./clinics";
import { reservations, TODAY } from "./reservations";
import { NAMED_PATIENTS } from "./patients";

/**
 * 当日受付管理 (/admin/reception) demo queue.
 * 本日受付22人 = 17 COMPLETED + 1 IN_CONSULTATION + 4 WAITING
 */
const todaysReservations = reservations.filter((r) => r.reservationDate === TODAY);

function reservationFor(patientId: string) {
  const found = todaysReservations.find((r) => r.patientId === patientId);
  return found ?? todaysReservations[0];
}

type QueueSpec = { patientId: string; status: ReceptionStatus };

const completedFillers: QueueSpec[] = todaysReservations
  .slice(7, 24) // skip the 7 named sample rows, take 17 filler reservations
  .map((r) => ({ patientId: r.patientId, status: "COMPLETED" as const }));

const queueSpecs: QueueSpec[] = [
  ...completedFillers, // 001-017
  { patientId: NAMED_PATIENTS.tanakaTaro.id, status: "IN_CONSULTATION" }, // 018
  { patientId: NAMED_PATIENTS.yamadaHanako.id, status: "WAITING" }, // 019
  { patientId: NAMED_PATIENTS.satoTaro.id, status: "WAITING" }, // 020
  { patientId: NAMED_PATIENTS.suzukiHanako.id, status: "WAITING" }, // 021
  { patientId: NAMED_PATIENTS.takahashiIchiro.id, status: "WAITING" }, // 022
];

function timeOf(hour: number, minute: number): string {
  return `${TODAY}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`;
}

export const receptions: Reception[] = queueSpecs.map((spec, index) => {
  const number = String(index + 1).padStart(3, "0");
  const reservation = reservationFor(spec.patientId);
  const baseHour = 9 + Math.floor(index / 4);
  const baseMinute = (index % 4) * 15;

  const checkedInAt = timeOf(baseHour, baseMinute);
  const calledAt = spec.status === "WAITING" ? null : timeOf(baseHour, baseMinute + 5);
  const consultationStartedAt = spec.status === "WAITING" ? null : timeOf(baseHour, baseMinute + 10);
  const completedAt = spec.status === "COMPLETED" ? timeOf(baseHour, baseMinute + 25) : null;

  return {
    id: `rcp-${number}`,
    clinicId: CLINIC_ID,
    patientId: spec.patientId,
    reservationId: reservation.id,
    receptionDate: TODAY,
    receptionNumber: number,
    status: spec.status,
    checkedInAt,
    calledAt,
    consultationStartedAt,
    completedAt,
  };
});

export function getReceptionById(id: string): Reception | undefined {
  return receptions.find((r) => r.id === id);
}
