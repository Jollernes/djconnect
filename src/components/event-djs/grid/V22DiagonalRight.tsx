import { Link } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  Star,
  Calendar,
  Music2,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  genresFor,
  priceFromLabel,
  thumbnailsFor,
} from "./shared";

/**
 * V22 — Diagonal · Thumbs-Right. Same diagonal slash mask as V18 but
 * the coral intro-video pill is removed and the stacked mini-gallery
 * sits in the open diagonal corner on the bottom-right (where the cut
 * carves into the photo), reading right-to-left.
 */
export function GridCardV22DiagonalRight({
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
  const thumbs = thumbnailsFor(dj);
  const compact = density === "4";

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Diagonal-cut image */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 78%, 0 100%)" }}
        >
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          {/* Favorite */}
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </Link>
        {/* Stacked mini-gallery sitting in the open diagonal corner on
            the bottom-right. The diagonal slash cuts the photo from
            (100%, 78%) → (0, 100%) so the carved-away triangle is on
            the bottom-right of the image block — perfect home for the
            thumbnail stack. flex-row-reverse so the cascade reads
            naturally right-to-left into the cut. */}
        <div className="absolute -bottom-2 right-4 flex flex-row-reverse">
          {thumbs.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className={cn(
                "block overflow-hidden rounded-md border-2 border-[#fbf8f3] bg-slate-100",
                compact ? "h-8 w-8" : "h-10 w-10",
              )}
              style={{
                marginRight: i === 0 ? 0 : "-12px",
                transform: `rotate(${(1 - i) * 4}deg)`,
                zIndex: 10 - i,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <img src={t} alt="" className="h-full w-full object-cover" loading="lazy" />
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col gap-2", compact ? "px-3 pb-4 pt-4" : "px-5 pb-5 pt-5")}>
        <div className={cn("flex items-center", compact ? "gap-2" : "gap-2.5")}>
          {/* B&W avatar inline */}
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
