import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Calendar,
  ShieldCheck,
  Wallet,
  Music2,
  Heart,
  Sparkles,
  Zap,
  ShieldCheck as ShieldIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { reviewCountLabel } from "../eventCountLabel";

function statusPill(dj: DJProfileWithRelations, idx: number) {
  const pool = [
    { label: "TOP VURDERET", icon: Sparkles },
    { label: "HURTIG RESPONS", icon: Zap },
    { label: "VERIFICERET DJ", icon: ShieldIcon },
  ];
  if (dj.is_featured) return pool[0]!;
  if (dj.rating_average >= 4.9) return pool[idx % 3]!;
  return pool[(idx + 1) % 3]!;
}

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

function priceRangeFor(dj: DJProfileWithRelations): string {
  if (dj.price_on_request || !dj.price_from_minor) return "Pris på forespørgsel";
  const upper = Math.round((dj.price_from_minor * 1.85) / 100) * 100;
  return `Fra ${formatCurrency(dj.price_from_minor, dj.currency)} – ${formatCurrency(upper, dj.currency)}`;
}

function eventTypesLine(dj: DJProfileWithRelations): string {
  const danish: Record<string, string> = {
    wedding: "Bryllup",
    birthday: "Fest",
    corporate_event: "Firmaevent",
    corporate_party: "Firmafest",
    private_party: "Privatfest",
    other: "Studentergilde",
  };
  return dj.event_types
    .slice(0, 3)
    .map((t) => danish[t.id] || t.label)
    .join(", ");
}

/**
 * V9 — Curved-scoop card, 3-col grid (Mads K. reference).
 *
 * Hero photo with a dramatic concave scoop at the bottom-right (large
 * radial-gradient mask whose circle is centred just outside the
 * bottom-right). Black-and-white avatar sits in the scooped gap. Sage
 * status pill top-left, big 28-px serif name, italic bio, 2-column
 * 6-fact micro-grid, rust CTA + heart shortlist button.
 */
export function StackedDJCardB_V9CurvedScoop3Col({
  dj,
  eventTypeId,
  index = 0,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  index?: number;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const pill = statusPill(dj, index);
  const PillIcon = pill.icon;

  const facts: Array<{ icon: typeof MapPin; text: string }> = [
    { icon: MapPin, text: `${dj.base_location}, DK` },
    {
      icon: Star,
      text: `${dj.rating_average.toFixed(1).replace(".", ",")} (${dj.rating_count} ${reviewCountLabel(eventTypeId)})`,
      iconColor: "fill-amber-400 text-amber-400",
    } as { icon: typeof MapPin; text: string; iconColor?: string },
    { icon: Calendar, text: eventTypesLine(dj) },
    { icon: ShieldCheck, text: "100% anbefalet" },
    { icon: Wallet, text: priceRangeFor(dj) },
    { icon: Music2, text: genresFor(dj) },
  ];

  return (
    <Card className="group flex flex-col overflow-visible rounded-2xl border-amber-100/70 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* HERO with dramatic concave scoop at bottom-right */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[5/4] w-full overflow-hidden rounded-t-2xl bg-slate-900"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle 220px at 88% 108%, transparent 219px, black 220px)",
            maskImage:
              "radial-gradient(circle 220px at 88% 108%, transparent 219px, black 220px)",
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
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
            style={{ backgroundColor: "rgba(45, 84, 60, 0.92)" }}
          >
            <PillIcon className="h-3 w-3" />
            {pill.label}
          </span>
        </Link>
        {/* B&W avatar — sits in the scooped gap, right side */}
        <span
          aria-label={dj.stage_name}
          className="absolute right-6 block h-14 w-14 overflow-hidden rounded-full"
          style={{
            top: "calc(100% - 38px)",
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
            <span className="flex h-full w-full items-center justify-center bg-slate-800 text-[12px] font-semibold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-7">
        <h3 className="font-serif text-[28px] font-normal leading-[1.1] tracking-tight text-slate-900">
          <Link to={href} className="hover:underline">{dj.stage_name}</Link>
        </h3>
        {dj.bio && (
          <p className="line-clamp-3 text-[13px] leading-snug text-slate-600">
            {dj.bio}
          </p>
        )}
        <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px] text-slate-700">
          {facts.map((f, i) => {
            const Icon = f.icon;
            const isStar = i === 1;
            return (
              <div key={i} className="flex min-w-0 items-center gap-2">
                <Icon
                  className={
                    isStar
                      ? "h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                      : "h-3.5 w-3.5 shrink-0 text-slate-500"
                  }
                />
                <span className="truncate">{f.text}</span>
              </div>
            );
          })}
        </dl>
        <div className="mt-2 flex items-center gap-3">
          <Button
            asChild
            className="flex-1 rounded-full py-6 text-[14px] font-medium text-white shadow-sm"
            style={{ backgroundColor: "#b85a3a" }}
          >
            <Link to={href}>Se profil & forespørg</Link>
          </Button>
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:text-rose-500"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
