import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

function genresFor(dj: DJProfileWithRelations): string {
  const pools = [
    "Pop, House, R&B",
    "House, Disco, Pop",
    "Open Format, Top 40",
    "80s, 90s, Disco",
    "Afro House, Tech, Pop",
    "Latin, Pop, Reggaeton",
  ];
  const seed = dj.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return pools[seed % pools.length]!;
}

/**
 * V12 — Bryllup-album (polaroid / wedding-album).
 *
 * 3 per row. Hero photo inside a thick cream border like a polaroid
 * frame. B&W avatar tucked top-right of the frame as a small "host
 * stamp" with thin amber ring. Serif name below the frame, single
 * info line, thin amber "Læs mere →" link CTA.
 */
export function GridCardV12Polaroid({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = eventTypeId
    ? `/djs/${dj.username}?eventType=${eventTypeId}`
    : `/djs/${dj.username}`;

  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card className="group flex flex-col rounded-xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Polaroid frame */}
      <div className="relative mx-4 mt-4 overflow-hidden rounded-sm bg-white p-2 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <Link to={href} className="relative block aspect-[4/5] w-full overflow-hidden bg-slate-100">
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </Link>
        {/* B&W avatar — host stamp top-right of frame */}
        <span
          className="absolute right-4 top-4 block h-10 w-10 overflow-hidden rounded-full ring-[1.5px] ring-amber-300"
          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
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
        {/* Polaroid caption */}
        <p className="mt-2 truncate pb-1 text-center font-serif text-[11px] italic text-slate-400">
          {dj.base_location} · {genresFor(dj)}
        </p>
      </div>

      {/* Content below frame */}
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <h3 className="font-serif text-[24px] font-semibold leading-tight tracking-tight text-slate-900">
          <Link to={href} className="hover:underline">{dj.stage_name}</Link>
        </h3>
        {dj.tagline && (
          <p className="line-clamp-2 text-[12.5px] italic leading-snug text-slate-500">
            {dj.tagline}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-amber-100 pt-3">
          <div className="flex items-center gap-3 text-[12px] text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">
                {dj.rating_average.toFixed(1).replace(".", ",")}
              </span>
              <span>({dj.rating_count})</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {dj.base_location}
            </span>
          </div>
          <p className="text-[14px] font-semibold text-slate-900">{priceLabel}</p>
        </div>
        <Link
          to={href}
          className="mt-1 text-center text-[13px] font-medium text-amber-700 transition-colors hover:text-amber-900 hover:underline"
        >
          Læs mere →
        </Link>
      </div>
    </Card>
  );
}
