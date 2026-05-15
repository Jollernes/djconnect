import { Link } from "react-router-dom";
import { BadgeCheck, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * V15 — Atelier tile (boutique stationery).
 *
 * 4 per row. Square card with centred composition. Large B&W avatar
 * centred at the top with thin amber ring. Serif name centred below +
 * verified ✓. Italic centred tagline. Thin amber divider. Centred
 * price + rating. Outline rust pill CTA centred. Feels like a
 * premium wedding-supplier business card.
 */
export function GridCardV15Atelier({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const href = eventTypeId
    ? `/djs/${dj.username}?eventType=${eventTypeId}`
    : `/djs/${dj.username}`;

  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card className="group flex flex-col items-center overflow-hidden rounded-xl border-amber-100/60 bg-[#fbf8f3] px-5 pb-5 pt-8 text-center shadow-sm transition-shadow hover:shadow-md">
      {/* Large centred B&W avatar */}
      <span
        className="block h-20 w-20 overflow-hidden rounded-full ring-[1.5px] ring-amber-200"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
      >
        {dj.profile.avatar_url ? (
          <img
            src={dj.profile.avatar_url}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(100%) contrast(1.1)" }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-slate-700 text-lg font-bold text-white">
            {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>

      {/* Name + verified */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        <h3 className="font-serif text-[22px] font-semibold tracking-tight text-slate-900">
          <Link to={href} className="hover:underline">{dj.stage_name}</Link>
        </h3>
        <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
      </div>

      {/* Tagline */}
      {dj.tagline && (
        <p className="mt-1.5 line-clamp-2 max-w-[220px] text-[12px] italic leading-snug text-slate-500">
          {dj.tagline}
        </p>
      )}

      {/* Location */}
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">
        {dj.base_location}, DK
      </p>

      {/* Divider */}
      <span className="mt-3 block h-px w-12 bg-amber-200" aria-hidden />

      {/* Price + rating */}
      <div className="mt-3 flex items-center gap-4 text-[13px]">
        <p className="font-semibold text-slate-900">{priceLabel}</p>
        <span className="inline-flex items-center gap-1 text-slate-600">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">
            {dj.rating_average.toFixed(1).replace(".", ",")}
          </span>
          <span className="text-slate-500">({dj.rating_count})</span>
        </span>
      </div>

      {/* CTA */}
      <Button
        asChild
        variant="outline"
        className="mt-4 w-full rounded-full border-amber-700/40 text-[13px] font-medium text-amber-800 transition-colors hover:border-amber-700 hover:bg-amber-50"
      >
        <Link to={href}>Se profil & forespørg</Link>
      </Button>
    </Card>
  );
}
