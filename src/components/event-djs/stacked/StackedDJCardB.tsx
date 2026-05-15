import { Link } from "react-router-dom";
import {
  MapPin,
  CalendarX2,
  Star,
  Sparkles,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Clock3,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

const EVENTS_TO_COUNT: Record<string, string> = {
  "0-10": "5+",
  "10-50": "30+",
  "51-100": "80+",
  "100+": "150+",
};

/**
 * Variant B — Boutique wedding (premium · trustworthy).
 *
 * Same tripartite layout as A, but the surface, type and right rail are
 * recomposed for wedding shoppers who buy on trust rather than spec depth:
 *   · Cream/sand card surface with a faint gold border
 *   · Serif headline + "Wedding specialist" eyebrow
 *   · Right rail is a vertical *trust strip*: Forsikret · Stripe-verified ·
 *     Refunderbart depositum · Svarer på <2t — each on its own line with
 *     a tiny icon — rather than just a price block.
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
  const photos = dj.equipment_photos.map((p) => p.url).filter(Boolean);
  while (photos.length < 3 && dj.profile.avatar_url) photos.push(dj.profile.avatar_url);
  const hero = photos[0];
  const thumbs = [photos[1], photos[2]];

  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const isUnavailable = Boolean(unavailable);
  const weddingsHosted = dj.events_performed ? EVENTS_TO_COUNT[dj.events_performed] ?? "+" : null;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card
      className={cn(
        "overflow-hidden border-amber-100/80 bg-[#fbf8f3] transition-shadow",
        !isUnavailable && "hover:shadow-lg",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN — hero + 2 thumbs */}
        <div className="relative w-full shrink-0 md:w-80">
          <Link
            to={isUnavailable ? "#" : href}
            className={cn(
              "relative block aspect-[16/10] w-full overflow-hidden bg-muted",
              isUnavailable && "pointer-events-none",
            )}
          >
            {hero ? (
              <img
                src={hero}
                alt={dj.stage_name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500",
                  !isUnavailable && "hover:scale-105",
                  isUnavailable && "grayscale",
                )}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No photo
              </div>
            )}
            {isUnavailable ? (
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
            ) : (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
                <Award className="h-3 w-3" /> Wedding specialist
              </span>
            )}
          </Link>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {thumbs.map((url, i) => (
              <Link
                key={i}
                to={isUnavailable ? "#" : href}
                className={cn(
                  "relative block aspect-[4/3] overflow-hidden bg-muted",
                  isUnavailable && "pointer-events-none",
                )}
              >
                {url ? (
                  <img
                    src={url}
                    alt=""
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-500",
                      !isUnavailable && "hover:scale-105",
                      isUnavailable && "grayscale",
                    )}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* MIDDLE — facts */}
        <div className={cn("flex flex-1 flex-col gap-3 p-5", isUnavailable && "opacity-70")}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
              Bryllups-DJ · {dj.base_location}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight tracking-tight">
              <Link to={href} className="hover:underline">
                {dj.stage_name}
              </Link>
            </h3>
            {dj.tagline && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{dj.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">
                {dj.rating_average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">({dj.rating_count} bryllupsanmeldelser)</span>
            </span>
            {weddingsHosted && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-semibold text-foreground">{weddingsHosted}</span> bryllupper
                  afholdt
                </span>
              </>
            )}
            <span className="text-muted-foreground/50">·</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" /> {dj.years_experience} år
            </span>
          </div>

          <div className="rounded-lg border border-amber-100 bg-white/70 px-3 py-2.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Dækker hele aftenen:</span> Ceremoni ·
            Velkomst · Middag · Førsteddansene · After-party
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Rejser op til {dj.travel_radius_km} km fra{" "}
              {dj.base_location}
            </span>
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

        {/* RIGHT — trust strip + price */}
        <div
          className={cn(
            "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-white/80 p-5 md:w-64 md:border-l md:border-t-0",
            isUnavailable && "opacity-70",
          )}
        >
          <div className="space-y-2 text-[11px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Trygt at booke
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Forsikret & verificeret
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Sikker betaling via Stripe
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Refunderbart depositum
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Svarer typisk på &lt; 2 timer
              </li>
            </ul>
          </div>

          <div className="border-t border-amber-100 pt-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Pakker fra
            </p>
            <p
              className={cn(
                "text-lg font-semibold tracking-tight",
                isUnavailable && "text-muted-foreground line-through",
              )}
            >
              {priceLabel}
            </p>
            <Button
              asChild
              size="sm"
              disabled={isUnavailable}
              className="mt-2 w-full rounded-full bg-amber-700 hover:bg-amber-800"
            >
              <Link to={href}>Se bryllupspakker</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
