import type { CrmServiceAdapter, ServiceHealthReport, ServiceIncident } from "./types";

/**
 * No-op CRM adapter used for this UI demo. It only logs to the console —
 * it never makes a network call to Crestix CRM. UI components must never
 * import this directly; it exists so the data layer / future server
 * actions have something that satisfies CrmServiceAdapter today, and can
 * be swapped for a real HTTP-backed adapter later without changing call
 * sites.
 */
export class MockCrmAdapter implements CrmServiceAdapter {
  async reportHealth(input: ServiceHealthReport): Promise<void> {
    console.log("[mock-crm] reportHealth", input);
  }

  async reportIncident(input: ServiceIncident): Promise<void> {
    console.log("[mock-crm] reportIncident", input);
  }

  async resolveIncident(incidentId: string): Promise<void> {
    console.log("[mock-crm] resolveIncident", incidentId);
  }
}

export const mockCrmAdapter = new MockCrmAdapter();
