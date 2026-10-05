/**
 * Monitoring types for this service. These describe the shape of data
 * this app would emit to an external monitoring/observability pipeline
 * (and, downstream, to Crestix CRM's service health view) once wired up.
 * Nothing here performs real network I/O in this demo.
 */

export type ServiceStatus = "HEALTHY" | "DEGRADED" | "DOWN";

export type ServiceHealthReport = {
  serviceId: string;
  clinicId: string;
  status: ServiceStatus;
  version: string;
  lastHeartbeatAt: string; // ISO datetime
};

export type IncidentSeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";

export type ServiceIncident = {
  id: string;
  serviceId: string;
  clinicId: string;
  type: string;
  severity: IncidentSeverity;
  message: string;
  occurredAt: string; // ISO datetime
  resolvedAt: string | null;
};

/**
 * Failure modes this service should eventually detect and report once a
 * real monitoring pipeline is wired up. Not implemented in this demo —
 * listed here so the shape of ServiceIncident.type has a known vocabulary
 * to converge on.
 *
 * - RESERVATION_API_ERROR: reservation create/update/cancel API failures
 * - DB_CONNECTION_ERROR: database connectivity loss
 * - LINE_INTEGRATION_ERROR: LINE Messaging API webhook/push failures
 * - EHR_INTEGRATION_ERROR: electronic health record sync failures
 * - DISPLAY_UPDATE_FAILURE: /display monitor failing to refresh
 * - REPEATED_RESERVATION_CREATION_FAILURE: a patient/channel retrying and failing repeatedly
 * - AUTHENTICATION_FAILURE_SPIKE: abnormal spike in failed staff logins
 */
export const KNOWN_INCIDENT_TYPES = [
  "RESERVATION_API_ERROR",
  "DB_CONNECTION_ERROR",
  "LINE_INTEGRATION_ERROR",
  "EHR_INTEGRATION_ERROR",
  "DISPLAY_UPDATE_FAILURE",
  "REPEATED_RESERVATION_CREATION_FAILURE",
  "AUTHENTICATION_FAILURE_SPIKE",
] as const;
