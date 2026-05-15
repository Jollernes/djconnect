import { Link } from "react-router-dom";
import {
  MapPin,
  Shield,
  CalendarX2,
  CheckCircle2,
  Star,
  Clock,
  Settings2,
  Sparkles,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import type { Density } from "./density";
import { HostAvatar } from "./HostAvatar";
import { deriveHighlights } from "./highlights";

const SETUP_LABEL: Record<string, string> = {
  small: "Intim · op til 60",
  medium: "Mellem · 60–150",
  large: "Stor · 150+",
};

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
  const setupLabel = dj.setup_size ? SETUP_LABEL[dj.setup_size] : null;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  const isCompact = density === "compact";
  const showThumbs = density === "spacious";
  const showBadgesRow = density !== "compact";
  const showRail = density !== "compact";
  const avatarSize = isCompact ? "sm" : density === "spacious" ? "lg" : "md";
  const highlights = !isCompact && !isUnavailable ? deriveHighlights(dj) : [];
  const HIGHLIGHT_ICONS = [Sparkles, Award, Settings2] as const;

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
            isCompact ? "md:w-28" : density === "comfortable" ? "md:w-56" : "md:w-80",
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
            isCompact ? "p-3" : density === "comfortable" ? "p-4" : "p-5",
            isUnavailable && "opacity-70",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <HostAvatar
                src={dj.profile.avatar_url}
                alt={dj.profile.full_name || dj.stage_name}
                size={avatarSize}
                tone="neutral"
              />
              <div className="min-w-0">
              <h3 className="line-clamp-1 text-base font-semibold leading-tight sm:text-lg">
                <Link to={href} className="hover:underline">
                  {dj.stage_name}
                </Link>
              </h3>
              {dj.tagline && (
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    isCompact ? "line-clamp-1" : "line-clamp-2",
                  )}
                >
                  {dj.tagline}
                </p>
              )}
              </div>
            </div>
            {!isCompact && (
              <Badge variant="success" className="shrink-0 gap-1">
                <Shield className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{dj.rating_average.toFixed(1)}</span>
              <span>({dj.rating_count})</span>
            </span>
            {!isCompact && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {dj.years_experience} år
                </span>
                {setupLabel && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Settings2 className="h-3.5 w-3.5" /> {setupLabel}
                    </span>
                  </>
                )}
              </>
            )}
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
            </span>
            {isCompact && (
              <>
                <span>·</span>
                <span
                  className={cn(
                    "font-semibold text-foreground",
                    isUnavailable && "text-muted-foreground line-through",
                  )}
                >
                  {priceLabel}
                </span>
              </>
            )}
          </div>

          {highlights.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {highlights.map((line, i) => {
                const Icon = HIGHLIGHT_ICONS[i] ?? Sparkles;
                return (
                  <li key={i} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span className="line-clamp-1">{line}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {showBadgesRow && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
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
          )}

          {isUnavailable && unavailable && !isCompact && (
            <div className="mt-1 rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unavailable.reason}</span>
              {unavailable.subReason && (
                <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
              )}
            </div>
          )}

          {/* Inline CTA when no right rail (compact) */}
          {isCompact && (
            <div className="mt-auto flex items-center justify-end pt-1">
              <Button asChild size="sm" disabled={isUnavailable} className="h-8 rounded-full px-3 text-xs">
                <Link to={href}>
                  Få tilbud
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT RAIL */}
        {showRail && (
          <div
            className={cn(
              "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-muted/30 md:border-l md:border-t-0",
              density === "comfortable" ? "p-4 md:w-48" : "p-5 md:w-56",
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
