import type { Reservation, ReservationType } from "@/types/domain";

export type BookingSlot = { date: string; time: string; doctorId?: string; reservationTypeId: string };
export type BookingSchedule = {
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  closedDays: number[];
  exceptions?: { id: string; date: string; reservationTypeId: string; startTime?: string; endTime?: string; reason?: string }[];
};

export function checkBookingAvailability(slot: BookingSlot, reservations: Reservation[], types: ReservationType[], schedule: BookingSchedule, excludeId?: string) {
  const type = types.find((item) => item.id === slot.reservationTypeId);
  if (!type) return { available: false, reason: "診療メニューが見つかりません。", booked: 0, capacity: 0 };

  const weekday = new Date(`${slot.date}T00:00:00`).getDay();
  if (schedule.closedDays.includes(weekday)) return { available: false, reason: "休診日です。", booked: 0, capacity: type.maxConcurrent ?? type.capacity ?? 1 };

  const exception = schedule.exceptions?.find((item) =>
    item.date === slot.date &&
    item.reservationTypeId === slot.reservationTypeId &&
    (!item.startTime || !item.endTime || (slot.time >= item.startTime && slot.time < item.endTime)),
  );
  if (exception) return { available: false, reason: exception.reason ? `予約停止：${exception.reason}` : "この日時は予約受付を停止しています。", booked: 0, capacity: type.maxConcurrent ?? type.capacity ?? 1 };

  if (!slot.time) {
    return { available: true, reason: "時間指定なし予約", booked: dailyCount, capacity: type.dailyLimit ?? Number.MAX_SAFE_INTEGER };
  }
  if (!((slot.time >= schedule.morningStart && slot.time < schedule.morningEnd) || (slot.time >= schedule.afternoonStart && slot.time < schedule.afternoonEnd))) {
    return { available: false, reason: "診療時間外です。", booked: 0, capacity: type.maxConcurrent ?? type.capacity ?? 1 };
  }

  const active = reservations.filter((reservation) => reservation.id !== excludeId && reservation.status !== "CANCELLED");
  const dailyCount = active.filter((reservation) => reservation.reservationDate === slot.date && reservation.reservationTypeId === slot.reservationTypeId).length;
  if (type.dailyLimit && dailyCount >= type.dailyLimit) {
    return { available: false, reason: "この診療メニューは1日の受付上限に達しています。", booked: dailyCount, capacity: type.dailyLimit };
  }

  const booked = active.filter((reservation) =>
    reservation.reservationDate === slot.date &&
    reservation.startTime === slot.time &&
    reservation.doctorId === slot.doctorId &&
    reservation.reservationTypeId === slot.reservationTypeId
  ).length;
  const capacity = type.maxConcurrent ?? type.capacity ?? 1;
  return booked < capacity ? { available: true, reason: "空きあり", booked, capacity } : { available: false, reason: "この診療メニューの同時予約上限に達しています。", booked, capacity };
}
