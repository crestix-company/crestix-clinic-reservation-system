"use client";

import Link from "next/link";
import { ExternalLink, Monitor, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { listTodayReceptionQueue } from "@/lib/services/reception-service";

export function CallNumberMonitorPopover() {
  const queue = useMemo(() => listTodayReceptionQueue(), []);
  const [open, setOpen] = useState(false);

  const current =
    queue.find((item) => item.status === "CALLED") ??
    queue.find((item) => item.status === "IN_CONSULTATION") ??
    null;
  const next = queue.find((item) => item.status === "WAITING") ?? null;
  const waitingCount = queue.filter((item) => item.status === "WAITING" || item.status === "CALLED").length;

  return (
    <div
      className="fixed bottom-5 right-5 z-40 max-sm:bottom-3 max-sm:right-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="院内モニターの呼び出し状況"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onFocus={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium shadow-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-white">
            <Monitor className="size-4" />
          </span>
          <span className="hidden sm:inline">院内モニター</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
            {current?.receptionNumber ?? "—"}
          </span>
        </button>

        <div
          className={`absolute bottom-full right-0 mb-2 w-[310px] origin-bottom-right rounded-xl border bg-background p-4 shadow-xl transition-all max-sm:w-[calc(100vw-24px)] ${
            open ? "visible scale-100 opacity-100" : "pointer-events-none invisible scale-95 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">院内モニター</div>
              <div className="text-xs text-muted-foreground">患者呼び出し状況</div>
            </div>
            <Link
              href="/display"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              モニターを開く
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
            <div className="bg-slate-950 px-3 py-4 text-center text-white">
              <div className="text-[11px] font-medium text-slate-400">現在の呼出番号</div>
              <div className="mt-1 text-4xl font-bold tabular-nums text-sky-400">
                {current?.receptionNumber ?? "—"}
              </div>
            </div>
            <div className="border-l bg-muted/30 px-3 py-4 text-center">
              <div className="text-[11px] font-medium text-muted-foreground">次の呼出番号</div>
              <div className="mt-1 text-4xl font-bold tabular-nums text-amber-600">
                {next?.receptionNumber ?? "—"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UsersRound className="size-3.5" />
              現在の待ち人数
            </span>
            <span className="font-semibold tabular-nums">{waitingCount}人</span>
          </div>

          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            受付番号のみを表示し、患者氏名は院内モニターには表示しない想定です。
          </p>
        </div>
      </div>
    </div>
  );
}
