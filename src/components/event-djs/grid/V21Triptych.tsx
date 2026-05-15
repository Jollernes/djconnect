import { Link } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  Star,
  Calendar,
  Music2,
  Heart,
  Play,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  genresFor,
  photoCountFor,
  priceFromLabel,
  thumbnailsFor,
} from "./shared";

/**
 * V21 — Triptych mosaic. 1 large hero on the left + 2 stacked smaller
 * photos on the right with thin gaps and rounded corners. Intro-video
 * play badge on the main photo, image counter on the bottom stacked
 * photo. B&W avatar overlapping the seam between the panes.
 */
export function GridCardV21Triptych({
  dj,
  eventTypeId,
  density = "3",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  density?: "3" | "4";
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = djHref(dj, eventTypeId);
  const photoCount = photoCountFor(dj);
  const thumbs = thumbnailsFor(dj, 4);
  const compact = density === "4";

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Triptych mosaic */}
      <div className={cn("relative w-full pb-0", compact ? "p-2" : "p-3")}>
        <div className={cn("grid grid-cols-[1.55fr_1fr]", compact ? "gap-1" : "gap-1.5")}>
          {/* Hero */}
          <Link
            to={href}
            className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100"
          >
            {hero && (
              <img
                src={hero}
                alt={dj.stage_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* Intro video play badge */}
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
              <Play className="h-2.5 w-2.5 fill-white text-white" />
              1:00
            </span>
          </Link>
          {/* Three stacked thumbnails — grid grid-rows-3 + min-h-0 so the
              column is locked to the hero's aspect-[3/4] height (which
              the outer grid row stretches us to) and each thumb gets
              exactly 1/3 of that height. Prevents the stack from
              spilling below the hero on any card position. */}
          <div className={cn("grid h-full grid-rows-3", compact ? "gap-1" : "gap-1.5")}>
            <Link
              to={href}
              className="relative block w-full min-h-0 overflow-hidden rounded-lg bg-slate-100"
            >
              {thumbs[1] && (
                <img
                  src={thumbs[1]}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </Link>
            <Link
              to={href}
              className="relative block w-full min-h-0 overflow-hidden rounded-lg bg-slate-100"
            >
              {thumbs[2] && (
                <img
                  src={thumbs[2]}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </Link>
            <Link
              to={href}
              className="relative block w-full min-h-0 overflow-hidden rounded-lg bg-slate-100"
            >
              {thumbs[3] && (
                <img
                  src={thumbs[3]}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[12px] font-semibold text-white">
                +{Math.max(photoCount - 4, 1)}
              </span>
            </Link>
          </div>
        </div>
        {/* Favorite */}
        <button
          type="button"
          aria-label="Tilføj til favoritter"
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
        {/* B&W avatar overlapping seam */}
        <span
          className={cn("absolute left-1/2 block -translate-x-1/2 overflow-hidden rounded-full ring-2 ring-[#fbf8f3]", compact ? "bottom-[-16px] h-10 w-10" : "bottom-[-18px] h-11 w-11")}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
        >
          {dj.profile.avatar_url ? (
            <img
              src={dj.profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.1)" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-[11px] font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col gap-2", compact ? "px-3 pb-4 pt-6" : "px-5 pb-5 pt-7")}>
        <div className="flex items-center justify-center gap-1.5">
          <h3 className={cn("truncate font-serif font-semibold leading-tight tracking-tight text-slate-900", compact ? "text-[18px]" : "text-[21px]")}>
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
        </div>
        {dj.tagline && (
          <p className="line-clamp-2 text-center text-[12px] italic leading-snug text-slate-500">
            {dj.tagline}
          </p>
        )}
        <dl className="mt-1 grid grid-cols-1 gap-y-1 text-[12px] text-slate-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{dj.base_location}, DK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{eventTypesLine(dj)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Music2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{genresFor(dj)}</span>
          </div>
        </dl>
        <div className="mt-1 flex items-center justify-between border-t border-amber-100 pt-2.5">
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">
            {priceFromLabel(dj)}
          </p>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-slate-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">
              {dj.rating_average.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-slate-500">({dj.rating_count})</span>
          </span>
        </div>
        <Button
          asChild
          className="mt-2 w-full rounded-full py-5 text-[13px] font-medium text-white shadow-sm"
          style={{ backgroundColor: "#ff6b46" }}
        >
          <Link to={href}>Se profil & forespørg</Link>
        </Button>
      </div>
    </Card>
  );
}
