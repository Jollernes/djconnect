import { Link } from "react-router-dom";
import {
  MapPin,
  CalendarX2,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import type { Density } from "./density";
import { stackedASizeTokens, type StackedASize } from "./StackedASize";
import { HostAvatar } from "./HostAvatar";
import { StatsRow } from "./StatsRow";

/**
 * Variant A — Clean comparison row (baseline refresh).
 *
 * Tripartite layout (photo column · facts middle · price rail right) with
 * density-aware photo block:
 *   · compact     → small 96-px square thumbnail, single info line, no rail
 *   · comfortable → 4:3 hero only (no thumbnails), full middle, slim rail
 *   · spacious    → hero + 2 thumbnails below + full middle + full rail
 */
export function StackedDJCardA({
  dj,
  eventTypeId,
  unavailable,
  density = "comfortable",
  aSize = "default",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
  density?: Density;
  /** Standard-density size variant. `"default"` is the reference
   * proportions; `"small"` recalibrates the photo / paddings / fonts
   * to ~80 % so the card collapses cleanly without overflowing. Only
   * applied when density === "comfortable". */
  aSize?: StackedASize;
}) {
  const photos = dj.equipment_photos.map((p) => p.url).filter(Boolean);
  while (photos.length < 3 && dj.profile.avatar_url) photos.push(dj.profile.avatar_url);
  const hero = photos[0];
  const thumbs = [photos[1], photos[2]];

  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const isUnavailable = Boolean(unavailable);
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  const isCompact = density === "compact";
  const showThumbs = density === "spacious";
  const showRail = density !== "compact";
  const tokens = stackedASizeTokens(density, aSize);
  const useSmall = !isCompact && aSize === "small";
  const avatarSize = isCompact ? "sm" : tokens.avatarSize;
  const description = dj.bio || dj.tagline;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        !isUnavailable && "hover:shadow-md",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN */}
        <div
          className={cn(
            "relative w-full shrink-0",
            isCompact ? "md:w-28" : tokens.photoColWidth,
          )}
        >
          <Link
            to={isUnavailable ? "#" : href}
            className={cn(
              "relative block w-full overflow-hidden bg-muted",
              isCompact
                ? "aspect-square"
                : density === "comfortable"
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
            {isUnavailable && (
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
            )}
            {!isUnavailable && dj.is_featured && !isCompact && (
              <Badge variant="accent" className="absolute left-2 top-2">
                Featured
              </Badge>
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
            "flex flex-1 flex-col gap-1.5",
            isCompact ? "p-3" : tokens.contentPad,
            isUnavailable && "opacity-70",
          )}
        >
          {isCompact ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <HostAvatar
                  src={dj.profile.avatar_url}
                  alt={dj.profile.full_name || dj.stage_name}
                  size={avatarSize}
                  tone="neutral"
                />
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-base font-semibold leading-tight">
                    <Link to={href} className="hover:underline">{dj.stage_name}</Link>
                  </h3>
                  {dj.tagline && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">{dj.tagline}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{dj.rating_average.toFixed(1)}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
                </span>
                <span>·</span>
                <span className={cn(
                  "font-semibold text-foreground",
                  isUnavailable && "text-muted-foreground line-through",
                )}>
                  {priceLabel}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-end pt-1">
                <Button asChild size="sm" disabled={isUnavailable} className="h-8 rounded-full px-3 text-xs">
                  <Link to={href}>Få tilbud</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                {dj.base_location.toUpperCase()}
              </p>
              <div className="flex items-center gap-3">
                <HostAvatar
                  src={dj.profile.avatar_url}
                  alt={dj.profile.full_name || dj.stage_name}
                  size={avatarSize}
                  tone="neutral"
                  verified
                />
                <h3
                  className={cn(
                    "font-serif font-semibold leading-tight tracking-tight text-slate-900",
                    useSmall ? tokens.nameSize : "text-2xl",
                  )}
                >
                  <Link to={href} className="hover:underline">{dj.stage_name}</Link>
                </h3>
              </div>
              {description && (
                <p className={cn(
                  "text-sm leading-relaxed text-slate-700",
                  density === "spacious" ? "line-clamp-3" : "line-clamp-2",
                )}>
                  {description}
                </p>
              )}
              <StatsRow dj={dj} eventTypeId={eventTypeId} />
              {isUnavailable && unavailable && (
                <div className="mt-1 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{unavailable.reason}</span>
                  {unavailable.subReason && (
                    <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT RAIL */}
        {showRail && (
          <div
            className={cn(
              "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-muted/30 md:border-l md:border-t-0",
              tokens.railPad,
              tokens.railWidth,
              isUnavailable && "opacity-70",
            )}
          >
            <div>
              {!isUnavailable && (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ledig
                </p>
              )}
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Vejledende pris
              </p>
              <p
                className={cn(
                  "font-semibold tracking-tight",
                  useSmall ? tokens.railPriceSize : "text-xl",
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
              {density === "spacious" && (
                <Button asChild size="sm" variant="ghost">
                  <Link to={href} className="text-xs">
                    Se profil
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
