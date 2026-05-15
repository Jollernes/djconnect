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
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  genresFor,
  priceFromLabel,
  thumbnailsFor,
} from "./shared";

/**
 * V18 — Diagonal slash mask + intro-video pill + stacked mini-gallery.
 *
 * Image bottom edge cut diagonally from upper-right down to lower-
 * left. Coral "▶ 1:00 introvideo" pill anchored to the image. Three
 * small thumbnails cascade in the open diagonal corner below.
 */
export function GridCardV18Diagonal({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = djHref(dj, eventTypeId);
  const thumbs = thumbnailsFor(dj);

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
          {/* Intro video pill */}
          <span
            className="absolute bottom-6 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm"
            style={{ backgroundColor: "#ff6b46" }}
          >
            <Play className="h-3 w-3 fill-white text-white" />
            1:00 introvideo
          </span>
          {/* Favorite */}
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </Link>
        {/* Stacked mini-gallery cascading in the open diagonal corner */}
        <div className="absolute -bottom-2 left-4 flex">
          {thumbs.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className="block h-10 w-10 overflow-hidden rounded-md border-2 border-[#fbf8f3] bg-slate-100"
              style={{
                marginLeft: i === 0 ? 0 : "-12px",
                transform: `rotate(${(i - 1) * 4}deg)`,
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
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-5">
        <div className="flex items-center gap-2.5">
          {/* B&W avatar inline */}
          <span
            className="block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-amber-200"
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
            <h3 className="truncate font-serif text-[20px] font-semibold leading-tight tracking-tight text-slate-900">
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
