import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDateJp(isoDate: string): string {
  return format(parseISO(isoDate), "M月d日(E)", { locale: ja });
}

export function formatDateTimeLabel(reservationDate: string, startTime: string, today: string): string {
  if (!startTime) return reservationDate === today ? "当日" : formatDateJp(reservationDate);
  if (reservationDate === today) return startTime;
  return `${formatDateJp(reservationDate)} ${startTime}`;
}

export function formatDateTimeFull(isoDateTime: string): string {
  return format(parseISO(isoDateTime), "yyyy/MM/dd HH:mm", { locale: ja });
}
