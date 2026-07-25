import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Star, Music2, Heart } from "lucide-react";
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
 * V10 — Curved-scoop card, 4-col grid (Luna Skye reference).
 *
 * Narrower 4-col card with the same curved-scoop hero (smaller scale).
 * Sage "KUNDEFAVORIT" pill with a heart icon top-left, B&W avatar in
 * the scooped gap on the right side. Compact: 20 px serif name +
 * verified dot, italic 3-line bio, two facts (location + genres),
 * price row with rating, full-width rust CTA + heart button.
 */
export function StackedDJCardB_V10CurvedScoop4Col({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;

  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card className="group flex flex-col overflow-visible rounded-2xl border-amber-100/70 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* HERO with curved scoop */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[5/4] w-full overflow-hidden rounded-t-2xl bg-slate-900"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle 160px at 86% 106%, transparent 159px, black 160px)",
            maskImage:
              "radial-gradient(circle 160px at 86% 106%, transparent 159px, black 160px)",
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
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm"
            style={{ backgroundColor: "rgba(45, 84, 60, 0.92)" }}
          >
            <Heart className="h-3 w-3 fill-white text-white" />
            KUNDEFAVORIT
          </span>
        </Link>
        {/* B&W avatar — sits in the scooped gap */}
        <span
          aria-label={dj.stage_name}
          className="absolute right-5 block h-12 w-12 overflow-hidden rounded-full"
          style={{
            top: "calc(100% - 32px)",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.18), inset 0 0 0 2px rgba(15, 23, 42, 0.85)",
          }}
        >
          {dj.profile.avatar_url ? (
            <img
              src={dj.profile.avatar_url}
              alt={dj.stage_name}
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.05)" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-800 text-[11px] font-semibold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-6">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-serif text-[20px] font-semibold leading-tight tracking-tight text-slate-900">
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
        </div>
        {dj.bio && (
          <p className="line-clamp-3 text-[12.5px] leading-snug text-slate-600">
            {dj.bio}
          </p>
        )}
        <dl className="mt-0.5 flex flex-col gap-1 text-[12px] text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{dj.base_location}, DK</span>
          </div>
          <div className="flex items-center gap-2">
            <Music2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{genresFor(dj)}</span>
          </div>
        </dl>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-amber-100 pt-2.5">
          <p className="text-[15px] font-semibold tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-slate-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">
              {dj.rating_average.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-slate-500">({dj.rating_count})</span>
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Button
            asChild
            className="flex-1 rounded-full py-5 text-[13px] font-medium text-white shadow-sm"
            style={{ backgroundColor: "#b85a3a" }}
          >
            <Link to={href}>Se profil & forespørg</Link>
          </Button>
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
