import { Link } from "react-router-dom";
import { MapPin, Star, Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
 * V14 — Koncertplakat (concert poster).
 *
 * 3 per row. Hero photo fills the top with a strong dark gradient at
 * the bottom. Huge 28-px serif name printed over the photo's lower
 * edge. Gold-ring B&W avatar overlapping top-left of the photo as
 * a "headshot". Below: ticket-stub info bar (📍 · 🎵 · ⭐) then
 * rust pill "Reservér →" CTA.
 */
export function GridCardV14Poster({
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
    <Card className="group flex flex-col overflow-hidden rounded-xl border-0 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-lg">
      {/* Poster hero with gradient + name overlay */}
      <div className="relative w-full">
        <Link to={href} className="relative block aspect-[3/4] w-full overflow-hidden bg-slate-900">
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Name over the photo's lower edge */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-serif text-[28px] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-md">
              {dj.stage_name}
            </h3>
            {dj.tagline && (
              <p className="mt-1 line-clamp-1 text-[12px] italic text-white/70">
                {dj.tagline}
              </p>
            )}
          </div>
        </Link>
        {/* B&W avatar — headshot overlapping top-left */}
        <span
          className="absolute left-4 top-4 block h-14 w-14 overflow-hidden rounded-full"
          style={{
            boxShadow: "0 3px 10px rgba(0,0,0,0.25), inset 0 0 0 2px #c9a96a",
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
            <span className="flex h-full w-full items-center justify-center bg-slate-800 text-[13px] font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* Ticket-stub info bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-amber-200 bg-amber-50/50 px-4 py-2.5 text-[11.5px] text-slate-700">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 text-amber-700" />
          {dj.base_location}
        </span>
        <span className="text-amber-300">·</span>
        <span className="inline-flex items-center gap-1">
          <Music2 className="h-3 w-3 text-amber-700" />
          {genresFor(dj)}
        </span>
        <span className="text-amber-300">·</span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">
            {dj.rating_average.toFixed(1).replace(".", ",")}
          </span>
          ({dj.rating_count})
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-[16px] font-semibold tracking-tight text-slate-900">
          {priceLabel}
        </p>
        <Button
          asChild
          size="sm"
          className="rounded-full px-5 text-[12px] font-medium text-white"
          style={{ backgroundColor: "#b85a3a" }}
        >
          <Link to={href}>Reservér →</Link>
        </Button>
      </div>
    </Card>
  );
}
