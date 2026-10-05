/**
 * Types shared with Crestix CRM.
 *
 * Crestix CRM is the system of record for "which customer (clinic) is
 * subscribed to which Crestix service" (MEO, survey system, reservation
 * system, etc). This reservation system is one such service. The CRM does
 * not manage patient data — it only needs to know whether *this service*
 * is healthy and whether it has had incidents, keyed by the identifiers
 * below.
 *
 * None of this is wired up to a real CRM in this demo. See
 * mock-crm-adapter.ts for the no-op implementation used by the UI.
 */

import type { ServiceHealthReport, ServiceIncident } from "@/monitoring/types";

export type { ServiceHealthReport, ServiceIncident };

/**
 * Identifiers that tie a running instance of this app back to a specific
 * CRM customer record.
 */
export type CrmServiceIdentity = {
  clinicId: string;
  serviceId: string;
  crmCustomerId: string;
};

export interface CrmServiceAdapter {
  reportHealth(input: ServiceHealthReport): Promise<void>;
  reportIncident(input: ServiceIncident): Promise<void>;
  resolveIncident(incidentId: string): Promise<void>;
}
