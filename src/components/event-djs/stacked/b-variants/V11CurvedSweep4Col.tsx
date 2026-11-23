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
 * V11 — Curved-sweep 4-col card matching the Luna Skye reference.
 *
 * Key geometry: the hero photo is masked with a large radial-gradient
 * circle whose centre sits *inside* the photo (around 78% / 95%) — this
 * carves a substantial sweeping curve out of the lower-right area
 * (rather than a tiny corner nibble like prior attempts). The carved
 * area shows the card's cream `#fbf8f3` background through, so the
 * black-and-white avatar — positioned to straddle the photo's bottom
 * edge — reads as embedded into the card shape rather than placed
 * underneath the photo.
 */
export function StackedDJCardB_V11CurvedSweep4Col({
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

  // Mask: a large radial-gradient circle centred inside the photo at
  // (78%, 95%) carves the sweeping curve out of the lower-right. The
  // radius is sized so the curve is a substantial sweep, not a small
  // corner nibble.
  const sweepMask =
    "radial-gradient(circle 110px at 78% 95%, transparent 109px, black 110px)";

  return (
    <Card className="group flex flex-col overflow-visible rounded-2xl border-amber-100/70 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* HERO with the curved sweep cutout */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-900"
          style={{
            WebkitMaskImage: sweepMask,
            maskImage: sweepMask,
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm"
            style={{ backgroundColor: "rgba(45, 84, 60, 0.92)" }}
          >
            <Heart className="h-3 w-3 fill-white text-white" />
            KUNDEFAVORIT
          </span>
        </Link>
        {/* B&W avatar — straddles the bottom edge of the photo, sitting
            in the cream sweep so it feels embedded into the card shape. */}
        <span
          aria-label={dj.stage_name}
          className="absolute block h-[52px] w-[52px] overflow-hidden rounded-full"
          style={{
            right: "16px",
            top: "calc(100% - 28px)",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.16), inset 0 0 0 2px rgba(15, 23, 42, 0.85)",
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
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-7">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-serif text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
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
          <p className="text-[16px] font-semibold tracking-tight text-slate-900">
            {priceLabel}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12.5px] text-slate-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">
                {dj.rating_average.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-slate-500">({dj.rating_count})</span>
            </span>
            <button
              type="button"
              aria-label="Tilføj til favoritter"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:text-rose-500"
            >
              <Heart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <Button
          asChild
          className="mt-2 w-full rounded-full py-5 text-[13px] font-medium text-white shadow-sm"
          style={{ backgroundColor: "#b85a3a" }}
        >
          <Link to={href}>Se profil & forespørg</Link>
        </Button>
      </div>
    </Card>
  );
}
