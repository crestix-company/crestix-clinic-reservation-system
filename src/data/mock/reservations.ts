import type { Reservation, ReservationSource, ReservationStatus, AcquisitionSource } from "@/types/domain";
import { CLINIC_ID } from "./clinics";
import { RESERVATION_TYPE_IDS } from "./reservation-types";
import { NAMED_PATIENTS, fillerPatients } from "./patients";

/**
 * "Today" for this demo. Kept as a constant (rather than `new Date()`) so
 * the dashboard numbers stay stable no matter when the demo is run.
 */
export const TODAY = "2026-10-05";

const EXAM_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

function slotEnd(start: string): string {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function acquisitionFor(source: ReservationSource, index: number): AcquisitionSource {
  // Most patients book through the same channel they discovered the
  // clinic from, but a portion discover via Google and then book via
  // LINE/WEB — this is what later analytics screens want to highlight.
  if (source === "LINE" && index % 3 === 0) return "GOOGLE";
  if (source === "WEB" && index % 4 === 0) return "GOOGLE";
  return source;
}

let seq = 0;
function nextId(): string {
  seq += 1;
  return `rsv-${String(seq).padStart(4, "0")}`;
}

function timestampsFor(date: string, status: ReservationStatus) {
  const createdAt = `${date}T08:${String(10 + (seq % 40)).padStart(2, "0")}:00+09:00`;
  const updatedAt =
    status === "RESERVED" ? createdAt : `${date}T${String(9 + (seq % 6)).padStart(2, "0")}:${String((seq * 7) % 60).padStart(2, "0")}:00+09:00`;
  return { createdAt, updatedAt };
}

function buildReservation(input: {
  patientId: string;
  reservationTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  source: ReservationSource;
  status: ReservationStatus;
  notes?: string;
}): Reservation {
  const { createdAt, updatedAt } = timestampsFor(input.date, input.status);
  return {
    id: nextId(),
    clinicId: CLINIC_ID,
    patientId: input.patientId,
    reservationTypeId: input.reservationTypeId,
    reservationDate: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    reservationSource: input.source,
    acquisitionSource: acquisitionFor(input.source, seq),
    status: input.status,
    notes: input.notes ?? "",
    createdAt,
    updatedAt,
  };
}

const reservationsToday: Reservation[] = [];

// --- The 7 explicit sample rows from the spec's dashboard table ---------
reservationsToday.push(
  buildReservation({
    patientId: NAMED_PATIENTS.yamadaTaro.id,
    reservationTypeId: RESERVATION_TYPE_IDS.GENERAL,
    date: TODAY,
    startTime: "",
    endTime: "",
    source: "LINE",
    status: "WAITING",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.satoHanako.id,
    reservationTypeId: RESERVATION_TYPE_IDS.GASTRO,
    date: TODAY,
    startTime: "09:30",
    endTime: "10:00",
    source: "WEB",
    status: "RESERVED",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.suzukiIchiro.id,
    reservationTypeId: RESERVATION_TYPE_IDS.CHECKUP,
    date: TODAY,
    startTime: "10:00",
    endTime: "12:00",
    source: "EHR",
    status: "RESERVED",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.takahashiMisaki.id,
    reservationTypeId: RESERVATION_TYPE_IDS.GENERAL,
    date: TODAY,
    startTime: "",
    endTime: "",
    source: "COUNTER",
    status: "IN_CONSULTATION",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.tanakaKen.id,
    reservationTypeId: RESERVATION_TYPE_IDS.COLON,
    date: TODAY,
    startTime: "11:30",
    endTime: "12:30",
    source: "GOOGLE",
    status: "RESERVED",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.itoMisaki.id,
    reservationTypeId: RESERVATION_TYPE_IDS.GASTRO,
    date: TODAY,
    startTime: "13:00",
    endTime: "13:30",
    source: "LINE",
    status: "CHECKED_IN",
  }),
  buildReservation({
    patientId: NAMED_PATIENTS.kimuraSho.id,
    reservationTypeId: RESERVATION_TYPE_IDS.CHECKUP,
    date: TODAY,
    startTime: "14:30",
    endTime: "16:30",
    source: "WEB",
    status: "RESERVED",
  }),
);

// --- Remaining grid cells to reach the dashboard's exact totals ---------
// 予約内容別: 一般診察15 / 胃カメラ14 / 大腸関連8 / 人間ドック5 (= 42 件)
// 予約経路別: WEB16 / LINE11 / 電子カルテ6 / 院内受付5 / Google4 (= 42 件)
type Cell = { type: string; source: ReservationSource; count: number };

const remainingCells: Cell[] = [
  // GENERAL remaining 13 (15 - 2 already placed above)
  { type: RESERVATION_TYPE_IDS.GENERAL, source: "WEB", count: 5 },
  { type: RESERVATION_TYPE_IDS.GENERAL, source: "LINE", count: 6 },
  { type: RESERVATION_TYPE_IDS.GENERAL, source: "COUNTER", count: 1 },
  { type: RESERVATION_TYPE_IDS.GENERAL, source: "GOOGLE", count: 1 },
  // GASTRO remaining 12 (14 - 2 already placed above)
  { type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", count: 5 },
  { type: RESERVATION_TYPE_IDS.GASTRO, source: "LINE", count: 2 },
  { type: RESERVATION_TYPE_IDS.GASTRO, source: "EHR", count: 3 },
  { type: RESERVATION_TYPE_IDS.GASTRO, source: "COUNTER", count: 1 },
  { type: RESERVATION_TYPE_IDS.GASTRO, source: "GOOGLE", count: 1 },
  // COLON remaining 7 (8 - 1 already placed above)
  { type: RESERVATION_TYPE_IDS.COLON, source: "WEB", count: 3 },
  { type: RESERVATION_TYPE_IDS.COLON, source: "LINE", count: 1 },
  { type: RESERVATION_TYPE_IDS.COLON, source: "EHR", count: 2 },
  { type: RESERVATION_TYPE_IDS.COLON, source: "COUNTER", count: 1 },
  // CHECKUP remaining 3 (5 - 2 already placed above)
  { type: RESERVATION_TYPE_IDS.CHECKUP, source: "WEB", count: 1 },
  { type: RESERVATION_TYPE_IDS.CHECKUP, source: "COUNTER", count: 1 },
  { type: RESERVATION_TYPE_IDS.CHECKUP, source: "GOOGLE", count: 1 },
];

// Status pool for the 35 generated rows: COMPLETED10 / RESERVED14 / WAITING5
// / CHECKED_IN3 / IN_CONSULTATION1 / CANCELLED2 — combined with the 7 sample
// rows above, this makes WAITING total exactly 6 (dashboard "待機中" KPI).
const statusPool: ReservationStatus[] = [
  "RESERVED", "COMPLETED", "WAITING", "RESERVED", "CHECKED_IN",
  "COMPLETED", "RESERVED", "RESERVED", "COMPLETED", "WAITING",
  "RESERVED", "COMPLETED", "RESERVED", "CANCELLED", "COMPLETED",
  "RESERVED", "WAITING", "COMPLETED", "RESERVED", "CHECKED_IN",
  "RESERVED", "COMPLETED", "RESERVED", "WAITING", "COMPLETED",
  "RESERVED", "RESERVED", "COMPLETED", "CANCELLED", "RESERVED",
  "WAITING", "COMPLETED", "RESERVED", "IN_CONSULTATION", "CHECKED_IN",
];

let statusCursor = 0;
let slotCursor = 0;
let patientCursor = 0;

function nextFillerPatientId(): string {
  const p = fillerPatients[patientCursor % fillerPatients.length];
  patientCursor += 1;
  return p.id;
}

for (const cell of remainingCells) {
  for (let i = 0; i < cell.count; i += 1) {
    const status = statusPool[statusCursor % statusPool.length];
    statusCursor += 1;
    const isGeneral = cell.type === RESERVATION_TYPE_IDS.GENERAL;
    const startTime = isGeneral ? "" : EXAM_SLOTS[slotCursor % EXAM_SLOTS.length];
    if (!isGeneral) slotCursor += 1;
    reservationsToday.push(
      buildReservation({
        patientId: nextFillerPatientId(),
        reservationTypeId: cell.type,
        date: TODAY,
        startTime,
        endTime: startTime ? slotEnd(startTime) : "",
        source: cell.source,
        status,
      }),
    );
  }
}

// --- Additional reservations on other October dates, for the calendar, --
// --- week/month views and the analytics screen.                        --
const otherDateSpecs: { date: string; type: string; source: ReservationSource; status: ReservationStatus; time: string }[] = [
  { date: "2026-10-01", type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", status: "COMPLETED", time: "09:30" },
  { date: "2026-10-01", type: RESERVATION_TYPE_IDS.GENERAL, source: "COUNTER", status: "COMPLETED", time: "" },
  { date: "2026-10-02", type: RESERVATION_TYPE_IDS.COLON, source: "LINE", status: "COMPLETED", time: "10:30" },
  { date: "2026-10-02", type: RESERVATION_TYPE_IDS.CHECKUP, source: "EHR", status: "COMPLETED", time: "09:00" },
  { date: "2026-10-03", type: RESERVATION_TYPE_IDS.GENERAL, source: "LINE", status: "COMPLETED", time: "" },
  { date: "2026-10-03", type: RESERVATION_TYPE_IDS.GASTRO, source: "GOOGLE", status: "COMPLETED", time: "14:00" },
  { date: "2026-10-04", type: RESERVATION_TYPE_IDS.OTHER, source: "WEB", status: "COMPLETED", time: "11:00" },
  { date: "2026-10-04", type: RESERVATION_TYPE_IDS.GENERAL, source: "WEB", status: "COMPLETED", time: "" },
  { date: "2026-10-06", type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", status: "RESERVED", time: "09:30" },
  { date: "2026-10-06", type: RESERVATION_TYPE_IDS.COLON, source: "LINE", status: "RESERVED", time: "10:30" },
  { date: "2026-10-06", type: RESERVATION_TYPE_IDS.GENERAL, source: "COUNTER", status: "RESERVED", time: "" },
  { date: "2026-10-07", type: RESERVATION_TYPE_IDS.CHECKUP, source: "EHR", status: "RESERVED", time: "09:00" },
  { date: "2026-10-07", type: RESERVATION_TYPE_IDS.GASTRO, source: "LINE", status: "RESERVED", time: "13:30" },
  { date: "2026-10-08", type: RESERVATION_TYPE_IDS.GENERAL, source: "WEB", status: "RESERVED", time: "" },
  { date: "2026-10-08", type: RESERVATION_TYPE_IDS.COLON, source: "GOOGLE", status: "RESERVED", time: "11:00" },
  { date: "2026-10-09", type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", status: "RESERVED", time: "10:00" },
  { date: "2026-10-09", type: RESERVATION_TYPE_IDS.OTHER, source: "EHR", status: "RESERVED", time: "14:30" },
  { date: "2026-10-12", type: RESERVATION_TYPE_IDS.CHECKUP, source: "WEB", status: "RESERVED", time: "09:00" },
  { date: "2026-10-13", type: RESERVATION_TYPE_IDS.GASTRO, source: "LINE", status: "RESERVED", time: "09:30" },
  { date: "2026-10-14", type: RESERVATION_TYPE_IDS.GENERAL, source: "LINE", status: "RESERVED", time: "" },
  { date: "2026-10-15", type: RESERVATION_TYPE_IDS.COLON, source: "WEB", status: "RESERVED", time: "11:30" },
  { date: "2026-10-16", type: RESERVATION_TYPE_IDS.GASTRO, source: "GOOGLE", status: "RESERVED", time: "13:00" },
  { date: "2026-10-19", type: RESERVATION_TYPE_IDS.GENERAL, source: "WEB", status: "RESERVED", time: "" },
  { date: "2026-10-20", type: RESERVATION_TYPE_IDS.CHECKUP, source: "EHR", status: "RESERVED", time: "09:00" },
  { date: "2026-10-21", type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", status: "RESERVED", time: "10:00" },
  { date: "2026-10-21", type: RESERVATION_TYPE_IDS.GENERAL, source: "COUNTER", status: "RESERVED", time: "" },
  { date: "2026-10-23", type: RESERVATION_TYPE_IDS.COLON, source: "LINE", status: "RESERVED", time: "10:30" },
  { date: "2026-10-27", type: RESERVATION_TYPE_IDS.GASTRO, source: "WEB", status: "RESERVED", time: "13:30" },
  { date: "2026-10-28", type: RESERVATION_TYPE_IDS.GENERAL, source: "LINE", status: "RESERVED", time: "" },
  { date: "2026-10-30", type: RESERVATION_TYPE_IDS.CHECKUP, source: "WEB", status: "RESERVED", time: "14:00" },
];

const otherReservations: Reservation[] = otherDateSpecs.map((spec) =>
  buildReservation({
    patientId: nextFillerPatientId(),
    reservationTypeId: spec.type,
    date: spec.date,
    startTime: spec.time,
    endTime: spec.time ? slotEnd(spec.time) : "",
    source: spec.source,
    status: spec.status,
  }),
);

export const reservations: Reservation[] = [...reservationsToday, ...otherReservations];

export function getReservationById(id: string): Reservation | undefined {
  return reservations.find((r) => r.id === id);
}
