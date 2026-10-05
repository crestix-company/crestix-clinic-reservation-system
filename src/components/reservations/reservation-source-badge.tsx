import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RESERVATION_SOURCE_BADGE_CLASS, RESERVATION_SOURCE_LABEL } from "@/lib/labels";
import type { ReservationSource } from "@/types/domain";

export function ReservationSourceBadge({ source, className }: { source: ReservationSource; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-normal", RESERVATION_SOURCE_BADGE_CLASS[source], className)}>
      {RESERVATION_SOURCE_LABEL[source]}
    </Badge>
  );
}
