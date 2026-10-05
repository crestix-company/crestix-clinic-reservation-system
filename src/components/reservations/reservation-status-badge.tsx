import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RESERVATION_STATUS_BADGE_CLASS, RESERVATION_STATUS_LABEL } from "@/lib/labels";
import type { ReservationStatus } from "@/types/domain";

export function ReservationStatusBadge({ status, className }: { status: ReservationStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", RESERVATION_STATUS_BADGE_CLASS[status], className)}>
      {RESERVATION_STATUS_LABEL[status]}
    </Badge>
  );
}
