"use client";

import { ExternalLink, Grip, Monitor, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listTodayReceptionQueue } from "@/lib/services/reception-service";

const STORAGE_KEY = "crestix-call-monitor-position";
const DEFAULT_POSITION = { x: 24, y: 24 };

export function CallNumberMonitorPopover() {
  const router = useRouter();
  const queue = useMemo(() => listTodayReceptionQueue(), []);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { x?: number; y?: number };
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        setPosition({
          x: Math.max(8, Math.min(parsed.x, window.innerWidth - 80)),
          y: Math.max(8, Math.min(parsed.y, window.innerHeight - 56)),
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    function handleMove(event: PointerEvent) {
      if (!dragging) return;

      const nextX = Math.max(8, Math.min(event.clientX - dragOffset.current.x, window.innerWidth - 80));
      const nextY = Math.max(8, Math.min(event.clientY - dragOffset.current.y, window.innerHeight - 56));
      setPosition({ x: nextX, y: nextY });
    }

    function handleUp() {
      if (!dragging) return;
      setDragging(false);
      setPosition((current) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return current;
      });
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging]);

  const current =
    queue.find((item) => item.status === "CALLED") ??
    queue.find((item) => item.status === "IN_CONSULTATION") ??
    null;
  const next = queue.find((item) => item.status === "WAITING") ?? null;
  const waitingCount = queue.filter((item) => item.status === "WAITING" || item.status === "CALLED").length;

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const rect = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (!rect) return;

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setDragging(true);
    setOpen(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  return (
    <div
      className="fixed z-40"
      style={{ left: position.x, top: position.y }}
      onMouseEnter={() => !dragging && setOpen(true)}
      onMouseLeave={() => !dragging && setOpen(false)}
    >
      <div className="relative">
        <div className="flex items-center rounded-full border bg-background shadow-lg">
          <button
            type="button"
            aria-label="院内モニターを移動"
            title="ドラッグして移動"
            onPointerDown={startDrag}
            className={`flex size-9 touch-none cursor-grab items-center justify-center rounded-l-full border-r text-muted-foreground transition hover:bg-muted hover:text-foreground ${dragging ? "cursor-grabbing bg-muted" : ""}`}
          >
            <Grip className="size-4" />
          </button>

          <button
            type="button"
            aria-label="院内モニターの呼び出し状況"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            onFocus={() => setOpen(true)}
            className="flex items-center gap-2 rounded-r-full px-3 py-2 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-white">
              <Monitor className="size-4" />
            </span>
            <span className="hidden sm:inline">院内モニター</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
              {current?.receptionNumber ?? "—"}
            </span>
          </button>
        </div>

        <div
          className={`absolute left-0 top-full mt-2 w-[310px] origin-top-left rounded-xl border bg-background p-4 shadow-xl transition-all max-sm:w-[calc(100vw-24px)] ${
            open && !dragging ? "visible scale-100 opacity-100" : "pointer-events-none invisible scale-95 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">院内モニター</div>
              <div className="text-xs text-muted-foreground">患者呼び出し状況</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/display");
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              モニターを開く
              <ExternalLink className="size-3" />
            </button>
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
            左のハンドルをドラッグすると、院内モニターの位置を自由に移動できます。位置はこのブラウザーに保存されます。
          </p>
        </div>
      </div>
    </div>
  );
}
