import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX2,
  Star,
  Play,
  PlayCircle,
  ShieldCheck,
  MapPin,
  PhoneCall,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import type { Density } from "./density";
import { storSizeTokens, type StorSize } from "./StorScale";
import { HostAvatar } from "./HostAvatar";
import { StatsRow } from "./StatsRow";
import { genresFor } from "@/components/event-djs/grid/shared";

/**
 * Variant C — Concierge / luxury wedding.
 *
 * Density-aware:
 *   · compact     → 96-px square photo with rating chip, inline package teaser
 *   · comfortable → 4:3 hero with video overlay, *no* testimonial, single package teaser on rail
 *   · spacious    → hero+thumbs + video overlay + testimonial + 2-tier package mini-list
 */
export function StackedDJCardC({
  dj,
  eventTypeId,
  unavailable,
  density = "comfortable",
  storSize = "stor",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
  density?: Density;
  storSize?: StorSize;
}) {
  const photos = dj.equipment_photos.map((p) => p.url).filter(Boolean);
  while (photos.length < 4 && dj.profile.avatar_url) photos.push(dj.profile.avatar_url);
  const hero = photos[0];
  // Variant C's spacious branch is a 1-large + 3-stacked triptych (matches
  // the curved-sweep V21 Triptych mosaic); compact + comfortable still use
  // hero alone, so the first 2 thumbs cover the legacy layout too.
  const thumbs = [photos[1], photos[2], photos[3]];
  const photoCount =
    dj.equipment_photos.length >= 6
      ? dj.equipment_photos.length
      : 6 + (dj.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 7);

  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const isUnavailable = Boolean(unavailable);

  const packages = useMemo(() => {
    if (dj.price_on_request || !dj.price_from_minor) return null;
    const essentials = dj.price_from_minor;
    const complete = Math.round((dj.price_from_minor * 1.35) / 100) * 100;
    return {
      essentials: formatCurrency(essentials, dj.currency),
      complete: formatCurrency(complete, dj.currency),
    };
  }, [dj.price_from_minor, dj.price_on_request, dj.currency]);

  const isCompact = density === "compact";
  const isComfortable = density === "comfortable";
  const isSpacious = density === "spacious";
  const showRail = !isCompact;
  const tokens = storSizeTokens(storSize);
  const avatarSize = isCompact
    ? "sm"
    : isComfortable
      ? "md"
      : tokens.avatarSize;
  const description = dj.bio || dj.tagline;

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 bg-[#fcfaf6] transition-shadow",
        !isUnavailable && "hover:shadow-xl",
        isUnavailable && "border-dashed bg-muted/30",
        isSpacious && tokens.cardWrapper,
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN */}
        <div
          className={cn(
            "relative w-full shrink-0",
            isCompact ? "md:w-44" : isComfortable ? "md:w-64" : tokens.photoColWidth,
          )}
        >
          {isCompact ? (
            // Mini-triptych at row height: hero (square) + 3 stacked thumbs.
            // Echoes the Stor variant's mosaic so Kompakt still reads as the
            // media-reel / creator variant at a glance.
            <div className="h-full p-2">
              <div className="grid h-full grid-cols-[1.55fr_1fr] gap-1">
                {/* Hero */}
                <Link
                  to={isUnavailable ? "#" : href}
                  className={cn(
                    "group relative block aspect-square w-full overflow-hidden rounded-md bg-muted",
                    isUnavailable && "pointer-events-none",
                  )}
                >
                  {hero ? (
                    <img
                      src={hero}
                      alt={dj.stage_name}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-500",
                        !isUnavailable && "group-hover:scale-105",
                        isUnavailable && "grayscale",
                      )}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                      Intet foto
                    </div>
                  )}
                  {isUnavailable ? (
                    <>
                      <div className="absolute inset-0 bg-white/55" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge
                          variant="destructive"
                          className="gap-1 rounded-full px-1.5 py-0.5 text-[9px] shadow-md"
                        >
                          <CalendarX2 className="h-2.5 w-2.5" /> Optaget
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
                      <span
                        className="pointer-events-none absolute bottom-1 left-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur"
                        title="Introvideo"
                      >
                        <Play className="h-2.5 w-2.5 fill-slate-900 text-slate-900" />
                      </span>
                      <span className="pointer-events-none absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1 py-0.5 text-[9px] font-semibold text-amber-700 shadow-sm backdrop-blur">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        {dj.rating_average.toFixed(1)}
                      </span>
                    </>
                  )}
                </Link>
                {/* 3 stacked thumbs to the right of the hero */}
                <div className="relative">
                  <div className="absolute inset-0 grid grid-rows-3 gap-1">
                    {thumbs.map((url, i) => {
                      const isLast = i === thumbs.length - 1;
                      return (
                        <Link
                          key={i}
                          to={isUnavailable ? "#" : href}
                          className={cn(
                            "relative block w-full overflow-hidden rounded-md bg-muted",
                            isUnavailable && "pointer-events-none",
                          )}
                        >
                          {url ? (
                            <img
                              src={url}
                              alt=""
                              className={cn(
                                "h-full w-full object-cover transition-transform duration-300",
                                !isUnavailable && "hover:scale-105",
                                isUnavailable && "grayscale",
                              )}
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                          {isLast && !isUnavailable && photoCount > 4 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-semibold text-white">
                              +{photoCount - 4}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : isSpacious ? (
            // Triptych mosaic: 1 large hero (left) + 3 stacked thumbs (right).
            // The right column uses an absolute-positioned grid so the thumbs
            // don't inflate the row taller than the hero's aspect lock.
            <div className="p-2 md:p-3">
              <div className="grid grid-cols-[1.55fr_1fr] gap-1.5">
                {/* Hero */}
                <Link
                  to={isUnavailable ? "#" : href}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-lg bg-muted",
                    tokens.heroAspect,
                    isUnavailable && "pointer-events-none",
                  )}
                >
                  {hero ? (
                    <img
                      src={hero}
                      alt={dj.stage_name}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-700",
                        !isUnavailable && "group-hover:scale-105",
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
                          className="gap-1.5 rounded-full px-2 py-1 text-[10px] shadow-md"
                        >
                          <CalendarX2 className="h-3 w-3" /> Optaget
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                        Concierge
                      </span>
                      <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-105">
                        <PlayCircle className="h-3.5 w-3.5 fill-slate-900 text-white" />
                        Introvideo
                      </span>
                      <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {dj.rating_average.toFixed(1)}
                      </span>
                    </>
                  )}
                </Link>
                {/* 3 stacked thumbs in the right column */}
                <div className="relative">
                  <div className="absolute inset-0 grid grid-rows-3 gap-1.5">
                    {thumbs.map((url, i) => {
                      const isLast = i === thumbs.length - 1;
                      return (
                        <Link
                          key={i}
                          to={isUnavailable ? "#" : href}
                          className={cn(
                            "relative block w-full overflow-hidden rounded-lg bg-muted",
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
                          {isLast && !isUnavailable && photoCount > 4 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[12px] font-semibold text-white">
                              +{photoCount - 4}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Comfortable: single hero column with the original badges.
            <Link
              to={isUnavailable ? "#" : href}
              className={cn(
                "group relative block w-full overflow-hidden bg-muted",
                "aspect-[4/3] md:aspect-auto md:h-full md:min-h-full",
                isUnavailable && "pointer-events-none",
              )}
            >
              {hero ? (
                <img
                  src={hero}
                  alt={dj.stage_name}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-700",
                    !isUnavailable && "group-hover:scale-105",
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
                    <Badge variant="destructive" className="gap-1.5 rounded-full px-2 py-1 text-[10px] shadow-md">
                      <CalendarX2 className="h-3 w-3" /> Optaget
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    Concierge
                  </span>
                  <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-105">
                    <PlayCircle className="h-3.5 w-3.5 fill-slate-900 text-white" />
                    Introvideo
                  </span>
                  <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {dj.rating_average.toFixed(1)}
                  </span>
                </>
              )}
            </Link>
          )}
        </div>

        {/* MIDDLE */}
        <div
          className={cn(
            "flex flex-1 flex-col",
            isSpacious ? tokens.contentGap : "gap-2.5",
            isCompact ? "p-3" : isComfortable ? "p-4" : tokens.contentPad,
            isUnavailable && "opacity-75",
          )}
        >
          {isCompact ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <HostAvatar
                  src={dj.profile.avatar_url}
                  alt={dj.profile.full_name || dj.stage_name}
                  size={avatarSize}
                  tone="concierge"
                  verified
                />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 font-serif text-base font-semibold leading-tight text-slate-900">
                    <Link to={href} className="hover:underline">{dj.stage_name}</Link>
                  </h3>
                  {dj.tagline && (
                    <p className="line-clamp-1 text-sm text-slate-700">{dj.tagline}</p>
                  )}
                  {/* Genre pills — micro-row that says "what they spin" in
                      one glance. Reinforces the media-reel / creator framing
                      that's the point of Variant C. */}
                  {(() => {
                    const genres = genresFor(dj)
                      .split(",")
                      .map((g) => g.trim())
                      .filter(Boolean)
                      .slice(0, 3);
                    if (genres.length === 0) return null;
                    return (
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {genres.map((g) => (
                          <span
                            key={g}
                            className="inline-flex items-center rounded-full border border-amber-200 bg-[#fbf3df] px-1.5 py-px text-[10px] font-medium text-amber-800"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-x-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{dj.rating_average.toFixed(1)}</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
                </span>
                {packages && (
                  <>
                    <span>·</span>
                    <span className={cn(
                      "font-semibold text-slate-900",
                      isUnavailable && "text-muted-foreground line-through",
                    )}>
                      {packages.essentials}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Forsikret
                </span>
                <Button asChild size="sm" disabled={isUnavailable} className="h-8 rounded-full bg-amber-400 px-3 text-xs text-slate-900 hover:bg-amber-300">
                  <Link to={href}>Reservér dato</Link>
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
                  tone="concierge"
                  verified
                />
                <h3 className={cn(
                  "font-serif font-semibold leading-tight tracking-tight text-slate-900",
                  isComfortable ? "text-2xl" : tokens.nameSize,
                )}>
                  <Link to={href} className="hover:underline">{dj.stage_name}</Link>
                </h3>
              </div>
              {description && (
                <p className={cn(
                  "text-sm leading-relaxed text-slate-700",
                  isComfortable ? "line-clamp-2" : tokens.bioClamp,
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
              "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-slate-900 text-white md:border-l md:border-t-0",
              isComfortable ? "p-4 md:w-56" : cn(tokens.railPad, tokens.railWidth),
              isUnavailable && "opacity-70",
            )}
          >
            <div className="space-y-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Bryllupspakker
              </p>
              {packages ? (
                isSpacious ? (
                  <ul className={cn("text-xs", tokens.packageGap)}>
                    <li className="flex items-baseline justify-between gap-2 border-b border-white/10 pb-2">
                      <span className="text-slate-200">
                        <span className="block font-medium text-white">Reception · 5t</span>
                        <span className="text-slate-400">DJ · lyd · grundlys</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {packages.essentials}
                      </span>
                    </li>
                    <li className="flex items-baseline justify-between gap-2">
                      <span className="text-slate-200">
                        <span className="block font-medium text-white">Hele aftenen · 8t</span>
                        <span className="text-slate-400">+ ceremoni & after-party</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {packages.complete}
                      </span>
                    </li>
                  </ul>
                ) : (
                  <div className="space-y-0.5 text-xs">
                    <p className="text-slate-400">Reception · 5t fra</p>
                    <p className="text-lg font-semibold tabular-nums text-white">
                      {packages.essentials}
                    </p>
                    <p className="pt-1 text-[10px] text-slate-400">
                      Hele aftenen 8t · {packages.complete}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-sm font-semibold">Pris på forespørgsel</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Button
                asChild
                size="sm"
                disabled={isUnavailable}
                className="rounded-full bg-amber-400 text-slate-900 hover:bg-amber-300"
              >
                <Link to={href}>Reservér dato</Link>
              </Button>
              {isSpacious && (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  disabled={isUnavailable}
                  className="rounded-full text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  <Link to={href} className="text-xs">
                    <PhoneCall className="h-3.5 w-3.5" /> Book gratis 15-min samtale
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
