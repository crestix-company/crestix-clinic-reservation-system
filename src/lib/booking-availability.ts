import type { Reservation, ReservationType } from "@/types/domain";

export type BookingSlot = { date: string; time: string; doctorId?: string; reservationTypeId: string };
export type BookingSchedule = { morningStart: string; morningEnd: string; afternoonStart: string; afternoonEnd: string; closedDays: number[] };

/** Demo rule boundary. Doctor and room resource checks can be added here later. */
export function checkBookingAvailability(slot: BookingSlot, reservations: Reservation[], types: ReservationType[], schedule: BookingSchedule, excludeId?: string) {
  const type = types.find((item) => item.id === slot.reservationTypeId);
  if (!type) return { available: false, reason: "診療メニューが見つかりません。", booked: 0, capacity: 0 };
  const weekday = new Date(`${slot.date}T00:00:00`).getDay();
  if (schedule.closedDays.includes(weekday)) return { available: false, reason: "休診日です。", booked: 0, capacity: type.capacity ?? 1 };
  if (slot.time && !((slot.time >= schedule.morningStart && slot.time < schedule.morningEnd) || (slot.time >= schedule.afternoonStart && slot.time < schedule.afternoonEnd))) return { available: false, reason: "診療時間外です。", booked: 0, capacity: type.capacity ?? 1 };
  const booked = reservations.filter((reservation) => reservation.id !== excludeId && reservation.status !== "CANCELLED" && reservation.reservationDate === slot.date && reservation.startTime === slot.time && reservation.doctorId === slot.doctorId && reservation.reservationTypeId === slot.reservationTypeId).length;
  const capacity = type.capacity ?? 1;
  return booked < capacity ? { available: true, reason: "空きあり", booked, capacity } : { available: false, reason: "この診療メニューの予約枠は満席です。", booked, capacity };
}
