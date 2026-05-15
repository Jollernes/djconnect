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
import type { Density } from "./density";
import { HostAvatar } from "./HostAvatar";

const EVENTS_TO_COUNT: Record<string, string> = {
  "0-10": "5+",
  "10-50": "30+",
  "51-100": "80+",
  "100+": "150+",
};

/**
 * Variant B — Boutique wedding (premium · trustworthy).
 *
 * Density-aware:
 *   · compact     → 96-px square photo, single inline trust+price line, one CTA
 *   · comfortable → 4:3 hero only, condensed trust strip (2 lines), no coverage
 *   · spacious    → hero + thumbs, full trust strip + coverage line + serif scale
 */
export function StackedDJCardB({
  dj,
  eventTypeId,
  unavailable,
  density = "comfortable",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
  density?: Density;
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

  const isCompact = density === "compact";
  const isComfortable = density === "comfortable";
  const showThumbs = density === "spacious";
  const showCoverage = density === "spacious";
  const showRail = !isCompact;
  const avatarSize = isCompact ? "sm" : isComfortable ? "md" : "lg";

  return (
    <Card
      className={cn(
        "overflow-hidden border-amber-100/80 bg-[#fbf8f3] transition-shadow",
        !isUnavailable && "hover:shadow-lg",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN */}
        <div
          className={cn(
            "relative w-full shrink-0",
            isCompact ? "md:w-28" : isComfortable ? "md:w-56" : "md:w-80",
          )}
        >
          <Link
            to={isUnavailable ? "#" : href}
            className={cn(
              "relative block w-full overflow-hidden bg-muted",
              isCompact
                ? "aspect-square"
                : isComfortable
                  ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-full"
                  : "aspect-[16/10]",
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
                    className="gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-md"
                  >
                    <CalendarX2 className="h-3 w-3" /> Optaget
                  </Badge>
                </div>
              </>
            ) : (
              !isCompact && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
                  <Award className="h-3 w-3" /> Wedding specialist
                </span>
              )
            )}
          </Link>
          {showThumbs && (
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
          )}
        </div>

        {/* MIDDLE */}
        <div
          className={cn(
            "flex flex-1 flex-col gap-2",
            isCompact ? "p-3" : isComfortable ? "p-4" : "p-5",
            isUnavailable && "opacity-70",
          )}
        >
          <div>
            <p
              className={cn(
                "font-semibold uppercase tracking-[0.22em] text-amber-700",
                isCompact ? "text-[9px]" : "text-[10px]",
              )}
            >
              Bryllups-DJ · {dj.base_location}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <HostAvatar
                src={dj.profile.avatar_url}
                alt={dj.profile.full_name || dj.stage_name}
                size={avatarSize}
                tone="boutique"
                verified
              />
              <h3
                className={cn(
                  "font-serif font-semibold leading-tight tracking-tight",
                  isCompact ? "text-base" : isComfortable ? "text-xl" : "text-2xl",
                )}
              >
                <Link to={href} className="hover:underline">
                  {dj.stage_name}
                </Link>
              </h3>
            </div>
            {dj.tagline && !isCompact && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{dj.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">
                {dj.rating_average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({dj.rating_count}{!isCompact && " bryllupsanmeldelser"})
              </span>
            </span>
            {weddingsHosted && !isCompact && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-semibold text-foreground">{weddingsHosted}</span> bryllupper
                </span>
              </>
            )}
            {!isCompact && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
                </span>
              </>
            )}
            {isCompact && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-semibold text-amber-800",
                    isUnavailable && "text-muted-foreground line-through",
                  )}
                >
                  {priceLabel}
                </span>
              </>
            )}
          </div>

          {showCoverage && (
            <div className="rounded-lg border border-amber-100 bg-white/70 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Dækker hele aftenen:</span> Ceremoni ·
              Velkomst · Middag · Førsteddansene · After-party
            </div>
          )}

          {isUnavailable && unavailable && !isCompact && (
            <div className="mt-1 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unavailable.reason}</span>
              {unavailable.subReason && (
                <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
              )}
            </div>
          )}

          {isCompact && (
            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Forsikret · Refunderbar
              </span>
              <Button
                asChild
                size="sm"
                disabled={isUnavailable}
                className="h-8 rounded-full bg-amber-700 px-3 text-xs hover:bg-amber-800"
              >
                <Link to={href}>Se pakker</Link>
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT RAIL */}
        {showRail && (
          <div
            className={cn(
              "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-white/80 md:border-l md:border-t-0",
              isComfortable ? "p-4 md:w-56" : "p-5 md:w-64",
              isUnavailable && "opacity-70",
            )}
          >
            <div className="space-y-2 text-[11px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Trygt at booke
              </p>
              <ul className={cn("space-y-1", isComfortable ? "space-y-1" : "space-y-1.5")}>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Forsikret & verificeret
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Sikker Stripe-betaling
                </li>
                {!isComfortable && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    Refunderbart depositum
                  </li>
                )}
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Svarer typisk &lt; 2 t
                </li>
              </ul>
            </div>

            <div className="border-t border-amber-100 pt-2.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Pakker fra
              </p>
              <p
                className={cn(
                  "font-semibold tracking-tight",
                  isComfortable ? "text-base" : "text-lg",
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
        )}
      </div>
    </Card>
  );
}
