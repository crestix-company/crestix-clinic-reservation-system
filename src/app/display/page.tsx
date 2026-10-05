"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { listTodayReceptionQueue } from "@/lib/services/reception-service";

export default function DisplayPage() {
  const queue = useMemo(() => listTodayReceptionQueue(), []);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const inConsultation = queue.find((q) => q.status === "IN_CONSULTATION");
  const upcoming = queue.filter((q) => q.status === "WAITING" || q.status === "CALLED").slice(0, 2);
  const waitingCount = queue.filter((q) => q.status === "WAITING" || q.status === "CALLED").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 px-10 py-8 text-slate-50">
      <div className="flex items-center justify-between">
        <div className="text-xl font-medium text-slate-300">瓦谷クリニック</div>
        <div className="text-3xl font-semibold tabular-nums">{format(now, "HH:mm:ss")}</div>
      </div>
      <div className="text-sm text-slate-400">{format(now, "yyyy年M月d日(E)", { locale: ja })}</div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-12">
        <div className="text-center">
          <div className="text-2xl font-medium text-slate-300">現在診察中</div>
          <div className="mt-4 text-[11rem] font-bold leading-none tabular-nums text-sky-400">
            {inConsultation ? inConsultation.receptionNumber : "—"}
          </div>
        </div>

        <div className="w-full max-w-3xl text-center">
          <div className="text-2xl font-medium text-slate-300">まもなくお呼びします</div>
          <div className="mt-6 flex justify-center gap-8">
            {upcoming.length === 0 ? (
              <span className="text-4xl text-slate-500">—</span>
            ) : (
              upcoming.map((q) => (
                <span key={q.id} className="text-7xl font-bold tabular-nums text-amber-300">
                  {q.receptionNumber}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl font-medium text-slate-300">現在の待ち人数</div>
          <div className="mt-2 text-5xl font-bold tabular-nums text-slate-100">{waitingCount}人</div>
        </div>
      </div>
    </div>
  );
}
