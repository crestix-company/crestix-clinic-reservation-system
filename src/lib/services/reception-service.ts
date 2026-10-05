import type { Reception } from "@/types/domain";
import { receptions as mockReceptions } from "@/data/mock/receptions";
import { getPatientById } from "@/data/mock/patients";

export type EnrichedReception = Reception & { patientName: string };

/**
 * Data access layer for the same-day reception queue. Returns a fresh copy
 * so that client components can hold their own local state and mutate it
 * (call/start/complete) without affecting the shared mock module.
 */
export function listTodayReceptionQueue(): EnrichedReception[] {
  return mockReceptions.map((r) => ({
    ...r,
    patientName: getPatientById(r.patientId)?.name ?? "不明",
  }));
}

export function getReceptionSummary(queue: EnrichedReception[]) {
  return {
    inConsultation: queue.filter((r) => r.status === "IN_CONSULTATION").length,
    waiting: queue.filter((r) => r.status === "WAITING" || r.status === "CALLED").length,
    totalToday: queue.length,
    completed: queue.filter((r) => r.status === "COMPLETED").length,
  };
}
