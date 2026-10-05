import type { AcquisitionSource, ReceptionStatus, ReservationSource, ReservationStatus } from "@/types/domain";

export const RESERVATION_SOURCE_LABEL: Record<ReservationSource, string> = {
  WEB: "WEB",
  LINE: "LINE",
  GOOGLE: "Google",
  EHR: "電子カルテ",
  COUNTER: "院内受付",
  PHONE: "電話",
};

export const ACQUISITION_SOURCE_LABEL: Record<AcquisitionSource, string> = {
  WEB: "WEB",
  LINE: "LINE",
  GOOGLE: "Google",
  EHR: "電子カルテ",
  COUNTER: "院内受付",
  PHONE: "電話",
  REFERRAL: "紹介",
  UNKNOWN: "不明",
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  RESERVED: "予約済",
  CHECKED_IN: "受付済",
  WAITING: "待機中",
  CALLED: "呼出中",
  IN_CONSULTATION: "診察中",
  COMPLETED: "完了",
  CANCELLED: "キャンセル",
};

export const RECEPTION_STATUS_LABEL: Record<ReceptionStatus, string> = {
  WAITING: "待機",
  CALLED: "呼出中",
  IN_CONSULTATION: "診察中",
  COMPLETED: "完了",
};

/** Tailwind color tokens per reservation source, used by ReservationSourceBadge. */
export const RESERVATION_SOURCE_BADGE_CLASS: Record<ReservationSource, string> = {
  WEB: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  LINE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  GOOGLE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  EHR: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  COUNTER: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  PHONE: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
};

/** Tailwind color tokens per reservation status, used by ReservationStatusBadge. */
export const RESERVATION_STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
  RESERVED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  CHECKED_IN: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  WAITING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  CALLED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  IN_CONSULTATION: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  CANCELLED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

export const RECEPTION_STATUS_BADGE_CLASS: Record<ReceptionStatus, string> = {
  WAITING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  CALLED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  IN_CONSULTATION: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  COMPLETED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};
