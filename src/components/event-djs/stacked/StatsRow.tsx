import { Star, Users, MapPin } from "lucide-react";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  eventCountLabel,
  eventCountValue,
  reviewCountLabel,
} from "./eventCountLabel";

/**
 * Inline single-line stats row used in the middle column of all three
 * stacked card variants: rating · event count · location. Icons in amber
 * to match the reference layout.
 */
export function StatsRow({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-foreground">
          {dj.rating_average.toFixed(1)}
        </span>
        <span>
          ({dj.rating_count} {reviewCountLabel(eventTypeId)})
        </span>
      </span>
      <span className="text-muted-foreground/50">·</span>
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-4 w-4 text-amber-700" />
        <span className="font-semibold text-foreground">
          {eventCountValue(dj.events_performed)}
        </span>
        <span>{eventCountLabel(eventTypeId)}</span>
      </span>
      <span className="text-muted-foreground/50">·</span>
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-amber-700" />
        <span>{dj.base_location}</span>
      </span>
    </div>
  );
}
