import { Link } from "react-router-dom";
import { Star, Sparkles, Clock3, MapPin, CalendarX2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

const EVENTS_LABEL: Record<string, string> = {
  "0-10": "0–10 events",
  "10-50": "10–50 events",
  "51-100": "50+ events",
  "100+": "100+ events",
};

/**
 * Variant B — Airbnb / Patreon-style editorial showcase.
 *
 * Vibe-first. A tall 16:9 hero photo fills the left half. The right side
 * leads with an eyebrow, a serif headline name, the tagline rendered as a
 * quote, a 3-icon stat strip (rating · events · years), then price + CTA.
 * Designed for couples shopping on personality fit, not specs.
 */
export function StackedDJCardB({
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
  const eventsLabel = dj.events_performed ? EVENTS_LABEL[dj.events_performed] ?? dj.events_performed : null;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";
  const eyebrow =
    (dj.event_types[0]?.label ? `${dj.event_types[0].label} DJ` : "DJ") +
    (dj.base_location ? ` · ${dj.base_location}` : "");

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        !isUnavailable && "hover:shadow-lg",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row md:items-stretch">
        {/* PHOTO — big 16:9 hero */}
        <Link
          to={isUnavailable ? "#" : href}
          className={cn(
            "relative block aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-auto md:h-auto md:w-[55%] md:shrink-0",
            isUnavailable && "pointer-events-none",
          )}
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={dj.stage_name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-700",
                !isUnavailable && "hover:scale-105",
                isUnavailable && "grayscale",
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>
          )}
          {isUnavailable && (
            <>
              <div className="absolute inset-0 bg-white/55" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="destructive" className="gap-1.5 rounded-full px-3 py-1.5 shadow-md">
                  <CalendarX2 className="h-3.5 w-3.5" /> Not available
                </Badge>
              </div>
            </>
          )}
          {!isUnavailable && dj.is_featured && (
            <Badge variant="accent" className="absolute left-4 top-4 gap-1">
              <Sparkles className="h-3 w-3" /> Featured
            </Badge>
          )}
          {!isUnavailable && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
          )}
        </Link>

        {/* CONTENT */}
        <div className={cn("flex flex-1 flex-col justify-between p-6 md:p-8", isUnavailable && "opacity-75")}>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-600">
              {eyebrow}
            </p>
            <h3 className="text-balance font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              <Link to={href} className="hover:underline">
                {dj.stage_name}
              </Link>
            </h3>
            {dj.tagline && (
              <blockquote className="border-l-2 border-rose-200 pl-3 text-sm italic text-muted-foreground sm:text-base">
                "{dj.tagline}"
              </blockquote>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{dj.rating_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({dj.rating_count})</span>
              </span>
              {eventsLabel && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="h-4 w-4" /> {eventsLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock3 className="h-4 w-4" /> {dj.years_experience} år
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {dj.base_location}
              </span>
            </div>

            {isUnavailable && unavailable && (
              <div className="mt-2 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{unavailable.reason}</span>
                {unavailable.subReason && (
                  <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Pakker fra
              </p>
              <p
                className={cn(
                  "text-2xl font-semibold tracking-tight",
                  isUnavailable && "text-muted-foreground line-through",
                )}
              >
                {priceLabel}
              </p>
            </div>
            <Button asChild size="lg" disabled={isUnavailable} className="rounded-full">
              <Link to={href}>Se profil & reservér</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
