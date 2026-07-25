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
 * V20 — Corner. Asymmetric top-right corner cut creating a pentagon-
 * shaped image. "+N fotos" coral counter pill bottom-left. Compact
 * 3-square thumbnail row sits next to the info block (saves vertical
 * space). B&W avatar inline with the name.
 */
export function GridCardV20Corner({
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
    <Card className="group flex flex-col overflow-hidden rounded-2xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Pentagon image */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[5/4] w-full overflow-hidden bg-slate-100"
          style={{
            clipPath: "polygon(0 0, 82% 0, 100% 22%, 100% 100%, 0 100%)",
          }}
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
          {/* +N fotos counter */}
          <span
            className={cn("absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold uppercase tracking-[0.08em] text-white shadow-sm", compact ? "text-[9.5px]" : "text-[10.5px]")}
            style={{ backgroundColor: "#ff6b46" }}
          >
            <Camera className="h-3 w-3" />
            {compact ? `+${photoCount}` : `+${photoCount} fotos`}
          </span>
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

      {/* Content + thumbnails side by side (3-col only; thumbs hidden at 4-col) */}
      <div className={cn("grid gap-3", compact ? "grid-cols-1 px-3 pb-4 pt-3" : "grid-cols-[1fr_auto] px-5 pb-5 pt-4")}>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn("block shrink-0 overflow-hidden rounded-full ring-1 ring-amber-200", compact ? "h-8 w-8" : "h-9 w-9")}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
            >
              {dj.profile.avatar_url ? (
                <img
                  src={dj.profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: "grayscale(100%) contrast(1.1)" }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-slate-700 text-[10px] font-bold text-white">
                  {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className={cn("truncate font-serif font-semibold leading-tight tracking-tight text-slate-900", compact ? "text-[17px]" : "text-[20px]")}>
                <Link to={href} className="hover:underline">{dj.stage_name}</Link>
              </h3>
              <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
            </div>
          </div>
          {dj.tagline && (
            <p className="line-clamp-2 text-[12px] italic leading-snug text-slate-500">
              {dj.tagline}
            </p>
          )}
        </div>
        {/* Thumbnail column — 3-col only */}
        {!compact && (
          <div className="flex flex-col gap-1.5">
            {thumbs.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="block h-8 w-8 overflow-hidden rounded-md border border-amber-100"
              >
                <img src={t} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats + CTA */}
      <div className={cn("flex flex-col gap-2", compact ? "px-3 pb-4" : "px-5 pb-5")}>
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
