import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Heart, MapPin, Star, CalendarX2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Variant C — Instagram-explore / SoundCloud-artist-style media reel.
 *
 * Photo-and-audio heavy. Three-photo strip on the left (one large + two
 * small) gives a sense of the DJ's catalog at a glance. The right column
 * adds a fake waveform "preview mix" play button to lean into the
 * creator-style framing. Heart icon for shortlisting, then price + CTA.
 */
export function StackedDJCardC({
  dj,
  eventTypeId,
  unavailable,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
}) {
  const photos = dj.equipment_photos
    .map((p) => p.url)
    .filter(Boolean)
    .slice(0, 3);
  // Pad with avatar if fewer than 3 photos.
  while (photos.length < 3 && dj.profile.avatar_url) {
    photos.push(dj.profile.avatar_url);
  }

  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const isUnavailable = Boolean(unavailable);
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  // Deterministic per-DJ pseudo-waveform — 36 bars of varying height.
  const bars = useMemo(() => {
    const seed = Array.from(dj.id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 36 }, (_, i) => {
      const v = Math.sin((seed + i * 7) * 0.7) * 0.5 + 0.5;
      return 18 + Math.round(v * 22); // 18..40 px tall
    });
  }, [dj.id]);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        !isUnavailable && "hover:shadow-md",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* PHOTO STRIP */}
        <Link
          to={isUnavailable ? "#" : href}
          className={cn(
            "relative grid w-full shrink-0 grid-cols-3 gap-1 bg-muted md:w-80",
            isUnavailable && "pointer-events-none",
          )}
        >
          {photos[0] && (
            <div className="col-span-2 row-span-2 aspect-[4/3] overflow-hidden">
              <img
                src={photos[0]}
                alt={dj.stage_name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500",
                  !isUnavailable && "hover:scale-105",
                  isUnavailable && "grayscale",
                )}
                loading="lazy"
              />
            </div>
          )}
          <div className="col-span-1 grid grid-rows-2 gap-1">
            {[photos[1], photos[2]].map((url, i) =>
              url ? (
                <div key={i} className="aspect-square overflow-hidden">
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
                </div>
              ) : (
                <div key={i} className="aspect-square bg-muted" />
              ),
            )}
          </div>
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
            <Badge variant="accent" className="absolute left-3 top-3">
              Featured
            </Badge>
          )}
        </Link>

        {/* CONTENT */}
        <div className={cn("flex flex-1 flex-col gap-3 p-5", isUnavailable && "opacity-75")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-lg font-semibold">
                <Link to={href} className="hover:underline">
                  {dj.stage_name}
                </Link>
              </h3>
              {dj.tagline && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{dj.tagline}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Save to shortlist"
              className="rounded-full border bg-background p-2 text-muted-foreground transition-colors hover:border-rose-300 hover:text-rose-600"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Waveform "preview mix" */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-gradient-to-br from-slate-50 to-white p-3",
              isUnavailable && "opacity-60",
            )}
          >
            <button
              type="button"
              aria-label={`Play ${dj.stage_name} preview mix`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              onClick={(e) => e.preventDefault()}
            >
              <Play className="h-4 w-4 translate-x-[1px] fill-current" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview mix · 0:20
              </p>
              <div className="mt-1 flex h-10 items-end gap-[2px]">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1 rounded-full",
                      i < 8 ? "bg-rose-500" : "bg-muted-foreground/30",
                    )}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{dj.rating_average.toFixed(1)}</span>
              <span>({dj.rating_count})</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {dj.base_location}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" /> Verified
            </span>
          </div>

          {isUnavailable && unavailable && (
            <div className="rounded-md border border-dashed bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{unavailable.reason}</span>
              {unavailable.subReason && (
                <span className="ml-1 text-muted-foreground">· {unavailable.subReason}</span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t pt-3">
            <span
              className={cn(
                "text-base font-semibold",
                isUnavailable && "text-muted-foreground line-through",
              )}
            >
              {priceLabel}
            </span>
            <Button asChild size="sm" disabled={isUnavailable} className="rounded-full">
              <Link to={href}>Få tilbud</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
