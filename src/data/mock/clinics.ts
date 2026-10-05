import type { Clinic, ServiceIdentity } from "@/types/domain";

export const CLINIC_ID = "clinic-kawaratani";

export const clinics: Clinic[] = [
  {
    id: CLINIC_ID,
    name: "瓦谷クリニック",
  },
];

/**
 * Mock service identity used to demonstrate the future link between this
 * reservation system and Crestix CRM / monitoring. Not used for any real
 * network call in this demo.
 */
export const serviceIdentity: ServiceIdentity = {
  clinicId: CLINIC_ID,
  serviceId: "service-reservation-kawaratani",
  crmCustomerId: "crm-kawaratani",
};

export function getClinicById(id: string): Clinic | undefined {
  return clinics.find((c) => c.id === id);
}
