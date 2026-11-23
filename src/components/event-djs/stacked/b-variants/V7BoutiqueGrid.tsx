import { Link } from "react-router-dom";
import {
  BadgeCheck,
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
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { reviewCountLabel } from "../eventCountLabel";

/**
 * Boutique status pills assigned deterministically per DJ — featured →
 * TOP VURDERET, top-rated → HURTIG RESPONS, otherwise VERIFICERET DJ.
 */
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

/**
 * Deterministic genre line per DJ (mock data has no genres field — we
 * generate something realistic and stable based on the DJ id so cards
 * read like real profiles).
 */
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
 * V7 — Boutique amber grid (inspired by the Danish reference).
 *
 * Vertical card on cream surface. Hero photo with a CSS-mask radial
 * cutout at the bottom-right where a thin-gold-ringed avatar sits
 * embedded. Sage-green status pill top-left. Big serif name + verified
 * dot, italic bio, then a 2-column 6-fact micro-grid (location, rating,
 * event types, 100% anbefalet, price range, genres). Wide rust CTA
 * "Se profil & forespørg" + small heart shortlist button.
 */
export function StackedDJCardB_V7BoutiqueGrid({
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
    { icon: Star, text: `${dj.rating_average.toFixed(1).replace(".", ",")} (${dj.rating_count} ${reviewCountLabel(eventTypeId)})` },
    { icon: Calendar, text: eventTypesLine(dj) },
    { icon: ShieldCheck, text: "100% anbefalet" },
    { icon: Wallet, text: priceRangeFor(dj) },
    { icon: Music2, text: genresFor(dj) },
  ];

  return (
    <Card className="group flex flex-col overflow-hidden border-amber-100/70 bg-[#fbf8f3] shadow-sm transition-shadow hover:shadow-md">
      {/* HERO with bottom-right circular cutout for the avatar */}
      <div className="relative w-full">
        <Link
          to={href}
          className="relative block aspect-[5/4] w-full overflow-hidden bg-slate-900"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle 36px at calc(100% - 44px) calc(100% - 32px), transparent 35px, black 36px)",
            maskImage:
              "radial-gradient(circle 36px at calc(100% - 44px) calc(100% - 32px), transparent 35px, black 36px)",
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          {/* Sage status pill */}
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur",
            )}
            style={{ backgroundColor: "rgba(45, 84, 60, 0.85)" }}
          >
            <PillIcon className="h-3 w-3" />
            {pill.label}
          </span>
        </Link>
        {/* Avatar — embedded in the cutout */}
        <span
          aria-label={dj.stage_name}
          className="absolute right-7 top-[calc(100%-60px)] block h-14 w-14 overflow-hidden rounded-full"
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 0 0 2px #c9a96a",
          }}
        >
          {dj.profile.avatar_url ? (
            <img src={dj.profile.avatar_url} alt={dj.stage_name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-800 text-[12px] font-semibold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-3">
        <div className="flex items-center gap-1.5">
          <h3 className="font-serif text-[24px] font-semibold leading-tight tracking-tight text-slate-900">
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
          <BadgeCheck className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
        </div>
        {dj.bio && (
          <p className="line-clamp-2 text-[12.5px] italic leading-snug text-slate-600">
            {dj.bio}
          </p>
        )}
        <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] text-slate-700">
          {facts.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex min-w-0 items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                <span className="truncate">{f.text}</span>
              </div>
            );
          })}
        </dl>
        <div className="mt-2 flex items-center gap-2">
          <Button
            asChild
            className={cn(
              "flex-1 rounded-md font-medium text-white shadow-sm",
            )}
            style={{ backgroundColor: "#b85a3a" }}
          >
            <Link to={href}>Se profil & forespørg</Link>
          </Button>
          <button
            type="button"
            aria-label="Tilføj til favoritter"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-200 hover:text-rose-500"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
