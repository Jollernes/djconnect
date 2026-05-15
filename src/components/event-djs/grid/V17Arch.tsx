import { Link } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  Star,
  Calendar,
  Music2,
  Heart,
  Camera,
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
 * V17 — Arch. Chapel-arch image mask (full curve at top, straight
 * sides and bottom). Image counter pill top-right, B&W avatar bottom-
 * left of image, compact thumbnail strip beneath image.
 */
export function GridCardV17Arch({
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
  const thumbs = thumbnailsFor(dj);
  const compact = density === "4";

  return (
    <Card className={cn("group flex flex-col rounded-2xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md", compact ? "px-3 pb-3 pt-3" : "px-4 pb-4 pt-4")}>
      {/* Arched image */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-slate-100"
          style={{ borderRadius: "50% 50% 12px 12px / 38% 38% 12px 12px" }}
        >
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 shadow-sm backdrop-blur">
            <Camera className="h-3 w-3" />
            1 / {photoCount}
          </span>
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="absolute right-3 top-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </Link>
        {/* B&W avatar — bottom-left over image edge */}
        <span
          className={cn("absolute -bottom-4 left-3 block overflow-hidden rounded-full ring-2 ring-[#fbf8f3]", compact ? "h-10 w-10" : "h-12 w-12")}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
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

      {/* Thumbnail strip */}
      <div className={cn("flex justify-end gap-1.5", compact ? "mt-4" : "mt-5")}>
        {thumbs.map((t, i) => (
          <span
            key={i}
            className={cn("block overflow-hidden rounded-md border border-amber-100", compact ? "h-7 w-7" : "h-9 w-9")}
          >
            <img src={t} alt="" className="h-full w-full object-cover" loading="lazy" />
          </span>
        ))}
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col", compact ? "mt-2 gap-1.5" : "mt-3 gap-2")}>
        <div className="flex items-center gap-1.5">
          <h3 className={cn("truncate font-serif font-semibold leading-tight tracking-tight text-slate-900", compact ? "text-[18px]" : "text-[22px]")}>
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
