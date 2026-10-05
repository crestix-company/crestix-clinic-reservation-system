/**
 * Domain model for the clinic reservation system.
 *
 * This is the single source of truth for shapes used across the demo.
 * Today these are backed by in-memory mock data (src/data/mock), but the
 * shapes are designed so a future Supabase/Postgres schema or external API
 * can be swapped in behind src/lib/services without touching UI code.
 */

export type Clinic = {
  id: string;
  name: string;
};

export type Patient = {
  id: string;
  clinicId: string;
  name: string;
  kana: string;
  phone: string;
  birthDate: string; // ISO date, e.g. "1985-04-12"
};

export type ReservationType = {
  id: string;
  clinicId: string;
  code: string;
  name: string;
  active: boolean;
};

/**
 * Where the reservation was actually *made* (the booking channel).
 */
export type ReservationSource = "WEB" | "LINE" | "GOOGLE" | "EHR" | "COUNTER" | "PHONE";

/**
 * How the patient first *learned about* the clinic/service.
 * Kept distinct from ReservationSource so future marketing analysis can
 * answer questions like "Google 認知 → LINE 予約" funnels.
 */
export type AcquisitionSource = "WEB" | "LINE" | "GOOGLE" | "EHR" | "COUNTER" | "PHONE" | "REFERRAL" | "UNKNOWN";

export type ReservationStatus =
  | "RESERVED"
  | "CHECKED_IN"
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED";

export type Reservation = {
  id: string;
  clinicId: string;
  patientId: string;
  reservationTypeId: string;
  reservationDate: string; // ISO date, e.g. "2026-10-05"
  startTime: string; // "09:30"
  endTime: string; // "10:00"
  reservationSource: ReservationSource;
  acquisitionSource: AcquisitionSource;
  status: ReservationStatus;
  notes: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

export type ReceptionStatus = "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED";

export type Reception = {
  id: string;
  clinicId: string;
  patientId: string;
  reservationId: string;
  receptionDate: string; // ISO date
  receptionNumber: string; // "018"
  status: ReceptionStatus;
  checkedInAt: string | null;
  calledAt: string | null;
  consultationStartedAt: string | null;
  completedAt: string | null;
};

/**
 * Identifiers used to tie this service instance back to Crestix CRM and
 * the monitoring layer. Values are mocked today; see
 * src/integrations/crm and src/monitoring.
 */
export type ServiceIdentity = {
  clinicId: string;
  serviceId: string;
  crmCustomerId: string;
};
