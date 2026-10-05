import type { ServiceHealthReport, ServiceStatus } from "./types";

/**
 * Builds a health report for this running instance. In this demo it is
 * only consumed by /api/health and never sent anywhere; a future version
 * would push this to Crestix CRM / an observability backend on an
 * interval via src/integrations/crm.
 */
export function getCurrentHealthReport(input: { serviceId: string; clinicId: string; version: string }): ServiceHealthReport {
  const status: ServiceStatus = "HEALTHY";
  return {
    serviceId: input.serviceId,
    clinicId: input.clinicId,
    status,
    version: input.version,
    lastHeartbeatAt: new Date().toISOString(),
  };
}
