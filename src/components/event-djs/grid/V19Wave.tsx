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
} from "./shared";

/**
 * V19 — Wave. SVG-clipped wave-cut image bottom. Circular B&W avatar
 * itself functions as the intro video, with a coral play-icon overlay.
 * Compact media tabs (Foto · Video · Setlist) below.
 */
export function GridCardV19Wave({
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
  const compact = density === "4";
  // Unique clip-path ID per card so multiple instances don't collide
  const clipId = `wave-${dj.id}`;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Wave-clipped image (uses inline SVG clipPath, scaled to box) */}
      <div className="relative w-full">
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M 0,0 L 1,0 L 1,0.86 C 0.78,0.94 0.62,0.74 0.5,0.84 C 0.34,0.97 0.22,0.78 0,0.88 L 0,0 Z" />
            </clipPath>
          </defs>
        </svg>
        <Link
          to={href}
          className="relative block aspect-[5/4] w-full overflow-hidden bg-slate-100"
          style={{ clipPath: `url(#${clipId})` }}
        >
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </Link>
        {/* B&W avatar as intro video — coral play overlay */}
        <button
          type="button"
          aria-label="Afspil introvideo"
          className={cn("absolute right-5 block overflow-hidden rounded-full", compact ? "h-12 w-12" : "h-14 w-14")}
          style={{
            top: compact ? "calc(100% - 30px)" : "calc(100% - 36px)",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.2), inset 0 0 0 2px #ff6b46",
          }}
        >
          {dj.profile.avatar_url ? (
            <img
              src={dj.profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.1)" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-[12px] font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <span
              className={cn("inline-flex items-center justify-center rounded-full text-white shadow-sm", compact ? "h-5 w-5" : "h-6 w-6")}
              style={{ backgroundColor: "#ff6b46" }}
            >
              <Play className="h-3 w-3 fill-white text-white translate-x-px" />
            </span>
          </span>
        </button>
      </div>

      {/* Media tabs */}
      <div className={cn("flex divide-x divide-amber-100 overflow-hidden rounded-md border border-amber-100 bg-white/60", compact ? "mx-3 mt-6 text-[10px]" : "mx-4 mt-7 text-[11px]")}>
        <span className="flex flex-1 items-center justify-center gap-1 px-2 py-1.5 font-medium text-slate-700">
          Foto <span className="text-slate-400">{photoCount}</span>
        </span>
        <span className="flex flex-1 items-center justify-center gap-1 px-2 py-1.5 font-medium text-slate-700">
          Video <span className="text-slate-400">2</span>
        </span>
        <span className="flex flex-1 items-center justify-center gap-1 px-2 py-1.5 font-medium text-slate-700">
          Setlist
        </span>
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col gap-2", compact ? "px-3 pb-4 pt-3" : "px-5 pb-5 pt-3")}>
        <div className="flex items-center gap-1.5">
          <h3 className={cn("truncate font-serif font-semibold leading-tight tracking-tight text-slate-900", compact ? "text-[17px]" : "text-[20px]")}>
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
        </div>
        {dj.tagline && (
          <p className="line-clamp-2 text-[12.5px] italic leading-snug text-slate-500">
            {dj.tagline}
          </p>
        )}
        <dl className="grid grid-cols-1 gap-y-1 text-[12px] text-slate-700">
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
