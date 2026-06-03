import { Link } from "react-router-dom";
import { MapPin, Shield, CalendarX2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

export function DJCard({
  dj,
  eventTypeId,
  unavailable,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
}) {
  const heroImage = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url;
  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const isUnavailable = Boolean(unavailable);

  return (
    <Link to={href} className={cn("group", isUnavailable && "cursor-default")}>
      <Card
        className={cn(
          "overflow-hidden transition-all",
          !isUnavailable && "group-hover:shadow-lg",
          isUnavailable && "border-dashed bg-muted/30",
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {heroImage ? (
            <img
              src={heroImage}
              alt={dj.stage_name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500",
                !isUnavailable && "group-hover:scale-105",
                isUnavailable && "grayscale",
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Intet foto</div>
          )}
          {isUnavailable && (
            <>
              <div className="absolute inset-0 bg-white/55" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge
                  variant="destructive"
                  className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-md"
                >
                  <CalendarX2 className="h-3.5 w-3.5" />
                  Ikke ledig
                </Badge>
              </div>
            </>
          )}
          {!isUnavailable && dj.is_featured && (
            <Badge variant="accent" className="absolute left-3 top-3">
              Fremhævet
            </Badge>
          )}
          {!isUnavailable && (
            <Badge variant="success" className="absolute right-3 top-3 gap-1">
              <Shield className="h-3 w-3" />
              Verificeret
            </Badge>
          )}
        </div>
        <div className={cn("space-y-3 p-4", isUnavailable && "opacity-70")}>
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold">{dj.stage_name}</h3>
            {dj.tagline && <p className="line-clamp-1 text-sm text-muted-foreground">{dj.tagline}</p>}
          </div>
          {isUnavailable && unavailable ? (
            <div className="rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unavailable.reason}</span>
              {unavailable.subReason && (
                <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <StarRating value={dj.rating_average} size="sm" showValue reviewCount={dj.rating_count} />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {dj.event_types.slice(0, 3).map((et) => (
              <Badge key={et.id} variant="secondary">
                {et.label}
              </Badge>
            ))}
            {dj.event_types.length > 3 && <Badge variant="outline">+{dj.event_types.length - 3}</Badge>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {dj.base_location}
            </span>
            <span className={cn("font-semibold", isUnavailable && "text-muted-foreground line-through")}>
              {dj.price_on_request
                ? "Pris på forespørgsel"
                : dj.price_from_minor
                ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
                : "—"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
