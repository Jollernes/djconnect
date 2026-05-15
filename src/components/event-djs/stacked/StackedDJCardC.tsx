import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX2,
  Star,
  PlayCircle,
  ShieldCheck,
  PhoneCall,
  Quote,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import type { Density } from "./density";
import { HostAvatar } from "./HostAvatar";

const COUPLE_QUOTES: { quote: string; couple: string }[] = [
  { quote: "Han læste rummet og holdt dansegulvet fyldt hele aftenen.", couple: "Mette & Frederik" },
  { quote: "Den bedste investering i hele brylluppet.", couple: "Sara & Anders" },
  { quote: "Alle vores gæster spurgte hvor vi havde fundet ham.", couple: "Camilla & Jonas" },
  { quote: "Smooth fra førsteddansene til de sidste 30 minutter.", couple: "Line & Mathias" },
  { quote: "Personlig samtale før dagen — det betød alt.", couple: "Ida & Magnus" },
];

function pickQuote(djId: string): { quote: string; couple: string } {
  const seed = Array.from(djId).reduce((a, c) => a + c.charCodeAt(0), 0);
  return COUPLE_QUOTES[seed % COUPLE_QUOTES.length];
}

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
  const testimonial = useMemo(() => pickQuote(dj.id), [dj.id]);

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
  const showThumbs = isSpacious;
  const showTestimonial = isSpacious;
  const showRail = !isCompact;
  const avatarSize = isCompact ? "sm" : isComfortable ? "md" : "lg";
  const showBio = !isCompact && !isUnavailable && Boolean(dj.bio);

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 bg-[#fcfaf6] transition-shadow",
        !isUnavailable && "hover:shadow-xl",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN */}
        <div
          className={cn(
            "relative w-full shrink-0",
            isCompact ? "md:w-28" : isComfortable ? "md:w-64" : "md:w-96",
          )}
        >
          <Link
            to={isUnavailable ? "#" : href}
            className={cn(
              "group relative block w-full overflow-hidden bg-muted",
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
                {!isCompact && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    Concierge
                  </span>
                )}
                {!isCompact && (
                  <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-105">
                    <PlayCircle className="h-3.5 w-3.5 fill-slate-900 text-white" />
                    Introvideo
                  </span>
                )}
                <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {dj.rating_average.toFixed(1)}
                </span>
              </>
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
            "flex flex-1 flex-col gap-2.5",
            isCompact ? "p-3" : isComfortable ? "p-4" : "p-5 md:p-6",
            isUnavailable && "opacity-75",
          )}
        >
          <div>
            <p
              className={cn(
                "font-semibold uppercase tracking-[0.22em] text-slate-700",
                isCompact ? "text-[9px]" : "text-[10px]",
              )}
            >
              Bryllups-DJ · Personlig service · {dj.base_location}
            </p>
            <div
              className={cn(
                "flex items-center gap-3",
                isCompact ? "" : isComfortable ? "mt-1" : "mt-1.5",
              )}
            >
              <HostAvatar
                src={dj.profile.avatar_url}
                alt={dj.profile.full_name || dj.stage_name}
                size={avatarSize}
                tone="concierge"
                verified
              />
              <h3
                className={cn(
                  "font-serif font-semibold leading-tight tracking-tight text-slate-900",
                  isCompact ? "text-base" : isComfortable ? "text-xl" : "text-2xl sm:text-3xl",
                )}
              >
                <Link to={href} className="hover:underline">
                  {dj.stage_name}
                </Link>
              </h3>
            </div>
            {dj.tagline && !isCompact && (
              <p className="mt-1.5 line-clamp-2 font-serif text-[15px] italic leading-snug text-slate-800">
                {dj.tagline}
              </p>
            )}
            {showBio && (
              <p
                className={cn(
                  "mt-1.5 leading-relaxed text-slate-600",
                  isComfortable ? "line-clamp-3 text-sm" : "line-clamp-4 text-[15px]",
                )}
              >
                {dj.bio}
              </p>
            )}
          </div>

          {showTestimonial && !isUnavailable && (
            <figure className="rounded-lg border border-slate-200 bg-white/70 px-4 py-3">
              <Quote className="h-3.5 w-3.5 text-slate-400" />
              <blockquote className="mt-1 text-sm italic text-slate-700">
                "{testimonial.quote}"
              </blockquote>
              <figcaption className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                — {testimonial.couple}, bryllup i {dj.base_location}
              </figcaption>
            </figure>
          )}

          {!isCompact && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Forsikret & verificeret
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-slate-600" />
                Gratis forsamtale
              </span>
              {!isComfortable && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Op til {dj.travel_radius_km} km
                  </span>
                </>
              )}
            </div>
          )}

          {isCompact && packages && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-slate-900">{packages.essentials}</span>
              <span className="ml-1">· 5t reception</span>
              <span className="mx-1.5 text-muted-foreground/50">·</span>
              <ShieldCheck className="mr-1 inline h-3 w-3 align-middle text-emerald-600" />
              Forsikret
            </p>
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
            <div className="mt-auto flex items-center justify-end pt-1">
              <Button
                asChild
                size="sm"
                disabled={isUnavailable}
                className="h-8 rounded-full bg-amber-400 px-3 text-xs text-slate-900 hover:bg-amber-300"
              >
                <Link to={href}>Reservér dato</Link>
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT RAIL */}
        {showRail && (
          <div
            className={cn(
              "flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-slate-900 text-white md:border-l md:border-t-0",
              isComfortable ? "p-4 md:w-56" : "p-5 md:w-72 md:p-6",
              isUnavailable && "opacity-70",
            )}
          >
            <div className="space-y-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Bryllupspakker
              </p>
              {packages ? (
                isSpacious ? (
                  <ul className="space-y-2 text-xs">
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
