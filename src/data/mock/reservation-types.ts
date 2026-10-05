import type { ReservationType } from "@/types/domain";
import { CLINIC_ID } from "./clinics";

export const RESERVATION_TYPE_IDS = {
  GENERAL: "rt-general",
  GASTRO: "rt-gastro",
  COLON: "rt-colon",
  CHECKUP: "rt-checkup",
  OTHER: "rt-other",
} as const;

export const reservationTypes: ReservationType[] = [
  { id: RESERVATION_TYPE_IDS.GENERAL, clinicId: CLINIC_ID, code: "GENERAL", name: "一般診察", active: true },
  { id: RESERVATION_TYPE_IDS.GASTRO, clinicId: CLINIC_ID, code: "GASTRO", name: "胃カメラ", active: true },
  { id: RESERVATION_TYPE_IDS.COLON, clinicId: CLINIC_ID, code: "COLON", name: "大腸関連", active: true },
  { id: RESERVATION_TYPE_IDS.CHECKUP, clinicId: CLINIC_ID, code: "CHECKUP", name: "人間ドック", active: true },
  { id: RESERVATION_TYPE_IDS.OTHER, clinicId: CLINIC_ID, code: "OTHER", name: "その他検査", active: true },
];

export function getReservationTypeById(id: string): ReservationType | undefined {
  return reservationTypes.find((t) => t.id === id);
}
