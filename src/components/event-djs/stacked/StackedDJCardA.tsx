import { Link } from "react-router-dom";
import {
  MapPin,
  Shield,
  CalendarX2,
  CheckCircle2,
  Star,
  Clock,
  Settings2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

const SETUP_LABEL: Record<string, string> = {
  small: "Intim · op til 60",
  medium: "Mellem · 60–150",
  large: "Stor · 150+",
};

/**
 * Variant A — Booking.com / Thumbtack-style comparison row.
 *
 * Optimised for shortlist-building: small photo, dense middle column with
 * the facts that matter for filtering (rating, experience, setup size,
 * event-type badges, base city), right rail with a hard-locked price-from
 * block + availability dot + dual CTAs.
 */
export function StackedDJCardA({
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
  const setupLabel = dj.setup_size ? SETUP_LABEL[dj.setup_size] : null;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        !isUnavailable && "hover:shadow-md",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO */}
        <Link
          to={isUnavailable ? "#" : href}
          className={cn(
            "relative block aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-auto md:h-auto md:w-72 md:shrink-0",
            isUnavailable && "pointer-events-none",
          )}
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={dj.stage_name}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500",
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
                <Badge
                  variant="destructive"
                  className="gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-md"
                >
                  <CalendarX2 className="h-3.5 w-3.5" /> Not available
                </Badge>
              </div>
            </>
          )}
          {!isUnavailable && dj.is_featured && (
            <Badge variant="accent" className="absolute left-3 top-3">
              Featured
            </Badge>
          )}
        </Link>

        {/* MIDDLE — facts */}
        <div className={cn("flex flex-1 flex-col gap-2 p-4 md:p-5", isUnavailable && "opacity-70")}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-lg font-semibold leading-tight">
                <Link to={href} className="hover:underline">
                  {dj.stage_name}
                </Link>
              </h3>
              {dj.tagline && (
                <p className="line-clamp-1 text-sm text-muted-foreground">{dj.tagline}</p>
              )}
            </div>
            <Badge variant="success" className="gap-1 shrink-0">
              <Shield className="h-3 w-3" /> Verified
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{dj.rating_average.toFixed(1)}</span>
              <span>({dj.rating_count})</span>
            </span>
            <span className="hidden md:inline">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {dj.years_experience} år
            </span>
            {setupLabel && (
              <>
                <span className="hidden md:inline">·</span>
                <span className="inline-flex items-center gap-1">
                  <Settings2 className="h-3.5 w-3.5" /> {setupLabel}
                </span>
              </>
            )}
            <span className="hidden md:inline">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {dj.event_types.slice(0, 4).map((et) => (
              <Badge key={et.id} variant="secondary" className="text-[11px]">
                {et.label}
              </Badge>
            ))}
            {dj.event_types.length > 4 && (
              <Badge variant="outline" className="text-[11px]">
                +{dj.event_types.length - 4}
              </Badge>
            )}
          </div>

          {isUnavailable && unavailable && (
            <div className="mt-1 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unavailable.reason}</span>
              {unavailable.subReason && (
                <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — price + CTA */}
        <div
          className={cn(
            "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-muted/30 p-4 md:w-56 md:border-l md:border-t-0 md:p-5",
            isUnavailable && "opacity-70",
          )}
        >
          <div>
            {!isUnavailable && (
              <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ledig
              </p>
            )}
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              Vejledende pris
            </p>
            <p
              className={cn(
                "text-xl font-semibold tracking-tight",
                isUnavailable && "text-muted-foreground line-through",
              )}
            >
              {priceLabel}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button asChild size="sm" disabled={isUnavailable}>
              <Link to={href}>
                <CheckCircle2 className="h-4 w-4" /> Få tilbud
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to={href} className="text-xs">
                Se profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
