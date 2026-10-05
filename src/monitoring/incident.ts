import type { IncidentSeverity, ServiceIncident } from "./types";

/**
 * Helper for constructing a ServiceIncident. Not wired up to any real
 * detection logic in this demo — provided so future code that *does*
 * detect a failure (see KNOWN_INCIDENT_TYPES in types.ts) has a
 * consistent shape to report through src/integrations/crm.
 */
export function createIncident(input: {
  id: string;
  serviceId: string;
  clinicId: string;
  type: string;
  severity: IncidentSeverity;
  message: string;
}): ServiceIncident {
  return {
    ...input,
    occurredAt: new Date().toISOString(),
    resolvedAt: null,
  };
}
