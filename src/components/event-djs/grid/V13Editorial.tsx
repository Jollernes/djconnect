import { Link } from "react-router-dom";
import { Star } from "lucide-react";
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
 * V13 — Editorial spread (magazine feature).
 *
 * 4 per row. Two-column lockup at top: small B&W avatar left, italic-
 * serif eyebrow + 22 px regular-weight serif name right. Hero photo
 * (square) full-width below. Italic-serif bio, em-dash stats row,
 * underlined italic "Læs profil →" link CTA.
 */
export function GridCardV13Editorial({
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
      ? formatCurrency(dj.price_from_minor, dj.currency)
      : "—";

  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Editorial lockup: avatar + name */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <span
          className="block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-amber-200"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
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
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber-700">
            {dj.base_location} · Bryllups-DJ
          </p>
          <h3 className="truncate font-serif text-[22px] font-normal leading-tight tracking-tight text-slate-900">
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
        </div>
      </div>

      {/* Hero photo */}
      <Link to={href} className="relative mt-3 block aspect-[5/4] w-full overflow-hidden bg-slate-100">
        {hero && (
          <img
            src={hero}
            alt={dj.stage_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        {dj.bio && (
          <p className="line-clamp-2 font-serif text-[12px] italic leading-snug text-slate-600">
            "{dj.bio}"
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">
              {dj.rating_average.toFixed(1).replace(".", ",")}
            </span>
          </span>
          <span className="text-slate-300">—</span>
          <span>{dj.rating_count} anmeldelser</span>
          <span className="text-slate-300">—</span>
          <span>{genresFor(dj)}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-amber-100 pt-2.5">
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <Link
            to={href}
            className="font-serif text-[12px] italic text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-900"
          >
            Læs profil →
          </Link>
        </div>
      </div>
    </Card>
  );
}
