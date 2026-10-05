"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RECEPTION_STATUS_BADGE_CLASS, RECEPTION_STATUS_LABEL } from "@/lib/labels";
import type { EnrichedReception } from "@/lib/services/reception-service";
import type { ReceptionStatus } from "@/types/domain";

type Props = {
  queue: EnrichedReception[];
  onAdvance: (id: string, nextStatus: ReceptionStatus) => void;
};

const NEXT_STATUS: Record<ReceptionStatus, ReceptionStatus | null> = {
  WAITING: "CALLED",
  CALLED: "IN_CONSULTATION",
  IN_CONSULTATION: "COMPLETED",
  COMPLETED: null,
};

function actionLabel(status: ReceptionStatus): string | null {
  if (status === "WAITING") return "呼出";
  if (status === "CALLED") return "診察開始";
  if (status === "IN_CONSULTATION") return "完了";
  return null;
}

export function ReceptionQueue({ queue, onAdvance }: Props) {
  return (
    <div className="divide-y rounded-lg border">
      {queue.map((item) => {
        const next = NEXT_STATUS[item.status];
        const label = actionLabel(item.status);
        return (
          <div key={item.id} className="flex items-center gap-4 px-4 py-3">
            <div className="w-16 shrink-0 text-center text-2xl font-bold tabular-nums text-foreground">{item.receptionNumber}</div>
            <div className="flex-1">
              <div className="font-medium">{item.patientName}</div>
            </div>
            <Badge variant="outline" className={cn("font-normal", RECEPTION_STATUS_BADGE_CLASS[item.status])}>
              {RECEPTION_STATUS_LABEL[item.status]}
            </Badge>
            {next && label ? (
              <Button size="sm" variant={item.status === "IN_CONSULTATION" ? "default" : "outline"} onClick={() => onAdvance(item.id, next)}>
                {label}
              </Button>
            ) : (
              <span className="w-[72px] text-center text-xs text-muted-foreground">完了済み</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
