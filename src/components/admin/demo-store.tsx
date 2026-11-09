"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { doctors as initialDoctors } from "@/data/mock/doctors";
import { reservationTypes as initialTypes } from "@/data/mock/reservation-types";
import { listEnrichedReservations } from "@/lib/services/reservation-service";
import type { EnrichedReservation } from "@/lib/services/types";
import type { Doctor, ReservationStatus, ReservationType } from "@/types/domain";

type ClinicSchedule = { morningStart: string; morningEnd: string; afternoonStart: string; afternoonEnd: string; closedDays: number[]; bookingDays: number };
type DemoStore = {
  reservations: EnrichedReservation[];
  doctors: Doctor[];
  types: ReservationType[];
  schedule: ClinicSchedule;
  addReservation: (reservation: EnrichedReservation) => void;
  updateReservation: (id: string, changes: Partial<EnrichedReservation>) => void;
  updateStatus: (id: string, status: ReservationStatus) => void;
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setTypes: React.Dispatch<React.SetStateAction<ReservationType[]>>;
  setSchedule: React.Dispatch<React.SetStateAction<ClinicSchedule>>;
};

const Context = createContext<DemoStore | null>(null);
const STORAGE_KEY = "crestix-reserve-demo-v2";

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<EnrichedReservation[]>(() => listEnrichedReservations());
  const [doctors, setDoctors] = useState<Doctor[]>(() => initialDoctors.map((doctor) => ({ ...doctor })));
  const [types, setTypes] = useState<ReservationType[]>(() => initialTypes.map((type) => ({ ...type })));
  const [schedule, setSchedule] = useState<ClinicSchedule>({ morningStart: "09:00", morningEnd: "12:00", afternoonStart: "13:00", afternoonEnd: "16:00", closedDays: [0, 6], bookingDays: 30 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved) as { reservations?: EnrichedReservation[]; doctors?: Doctor[]; types?: ReservationType[]; schedule?: ClinicSchedule };
          if (Array.isArray(data.reservations)) setReservations(data.reservations);
          if (Array.isArray(data.doctors)) setDoctors(data.doctors);
          if (Array.isArray(data.types)) setTypes(data.types);
          if (data.schedule && Array.isArray(data.schedule.closedDays)) setSchedule(data.schedule);
        }
      } catch { sessionStorage.removeItem(STORAGE_KEY); }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ reservations, doctors, types, schedule }));
  }, [hydrated, reservations, doctors, types, schedule]);

  const value = useMemo<DemoStore>(() => ({
    reservations: reservations.map((reservation) => ({ ...reservation, reservationType: types.find((type) => type.id === reservation.reservationTypeId) ?? reservation.reservationType })),
    doctors,
    types,
    schedule,
    addReservation: (reservation) => setReservations((current) => [reservation, ...current]),
    updateReservation: (id, changes) => setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, ...changes, updatedAt: new Date().toISOString() } : reservation)),
    updateStatus: (id, status) => setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status, updatedAt: new Date().toISOString() } : reservation)),
    setDoctors,
    setTypes,
    setSchedule,
  }), [reservations, doctors, types, schedule]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemoStore() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoStoreProvider is required");
  return context;
}
