import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * V16 — Postkort (postage-stamp postcard).
 *
 * 4 per row. Hero photo gets a dashed perforation border evoking a
 * postage stamp plus a slight warm desaturation tint. Oval "postmark"
 * badge with "CITY · DK" stamped diagonally over the photo. Small B&W
 * avatar bottom-right corner of the photo as a "stamp". Below: serif
 * name + minimal info + amber underline "Se profil →" link.
 */
export function GridCardV16Stamp({
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
    <Card className="group flex flex-col overflow-hidden rounded-xl border-amber-100/60 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* Stamp frame around photo */}
      <div className="relative mx-4 mt-4 rounded-sm border-2 border-dashed border-amber-300/70 p-1">
        <Link
          to={href}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100"
        >
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              style={{ filter: "saturate(0.75) contrast(1.05)" }}
            />
          )}
          {/* Postmark oval badge */}
          <span
            className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-amber-800/50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-900/80"
            style={{ transform: "rotate(-12deg)" }}
          >
            {dj.base_location} · DK
          </span>
        </Link>
        {/* B&W avatar as a small stamp in bottom-right */}
        <span
          className="absolute bottom-2 right-2 block h-10 w-10 overflow-hidden rounded-sm border border-amber-200 bg-white p-0.5"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
        >
          {dj.profile.avatar_url ? (
            <img
              src={dj.profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.15) sepia(0.15)" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-[9px] font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 px-5 pb-4 pt-3">
        <h3 className="truncate font-serif text-[20px] font-semibold tracking-tight text-slate-900">
          <Link to={href} className="hover:underline">{dj.stage_name}</Link>
        </h3>
        {dj.tagline && (
          <p className="line-clamp-1 text-[11.5px] italic text-slate-500">
            {dj.tagline}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-amber-100 pt-2.5">
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <span className="inline-flex items-center gap-1 text-[12px] text-slate-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">
              {dj.rating_average.toFixed(1).replace(".", ",")}
            </span>
            <span>({dj.rating_count})</span>
          </span>
        </div>
        <Link
          to={href}
          className="mt-1 text-center text-[12.5px] font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-900"
        >
          Se profil →
        </Link>
      </div>
    </Card>
  );
}
