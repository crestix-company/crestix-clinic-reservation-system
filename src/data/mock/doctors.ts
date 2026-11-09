import type { Doctor } from "@/types/domain";
import { CLINIC_ID } from "./clinics";

export const doctors: Doctor[] = [
  { id: "dr-director", clinicId: CLINIC_ID, name: "瓦谷 院長", role: "院長", active: true },
  { id: "dr-sato", clinicId: CLINIC_ID, name: "佐藤 医師", role: "内科", active: true },
  { id: "dr-tanaka", clinicId: CLINIC_ID, name: "田中 医師", role: "内視鏡", active: true },
];
