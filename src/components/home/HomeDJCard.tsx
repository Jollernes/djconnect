import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Speaker, Star } from "lucide-react";
import type { DJProfileWithRelations } from "@/types/domain";

/** Local photos supplied for the seeded demo DJs, keyed by username. */
const DJ_PHOTO_OVERRIDES: Record<string, string> = {
  "alex-holm": "/dj-photos/wedding-hero-2.png",
  "flashback-mobildiskotek": "/dj-photos/flashback/portrait.png",
  "kasper-lind": "/dj-photos/dj-ballroom.png",
  "mia-sorensen": "/hero-dj-830-poster.jpg",
  "sofia-klint": "/dj-photos/flashback/setup-1.png",
};

const CITY_DA: Record<string, string> = {
  Copenhagen: "København",
  Aarhus: "Aarhus",
  Odense: "Odense",
};

const EQUIPMENT_LABEL: Record<string, string> = {
  small: "Lille lyd- & lyspakke",
  medium: "Mellem lyd- & lyspakke",
  large: "Stor lyd- & lyspakke",
};

const priceFormatter = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });

export function djPhoto(dj: DJProfileWithRelations): string | undefined {
  return (
    DJ_PHOTO_OVERRIDES[dj.username] ??
    dj.equipment_photos[0]?.url ??
    dj.profile?.avatar_url ??
    undefined
  );
}

export function HomeDJCard({ dj }: { dj: DJProfileWithRelations }) {
  const photo = djPhoto(dj);
  const location = CITY_DA[dj.base_location] ?? dj.base_location;
  const verified = dj.verification_status === "approved";
  const price =
    dj.price_on_request || !dj.price_from_minor
      ? "Pris efter aftale"
      : `Fra ${priceFormatter.format(dj.price_from_minor / 100)} kr.`;

  return (
    <Link
      to={`/djs/${dj.username}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {photo && (
          <img
            src={photo}
            alt={dj.stage_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verificeret
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{dj.stage_name}</h3>
          {dj.rating_count > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-900">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {dj.rating_average.toLocaleString("da-DK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="font-normal text-slate-500">({dj.rating_count})</span>
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {location}
        </p>
        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          <Speaker className="h-3.5 w-3.5" />
          {EQUIPMENT_LABEL[dj.setup_size] ?? "Lyd & lys inkluderet"}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-base font-semibold text-slate-900">{price}</span>
          <span className="text-sm font-semibold text-accent group-hover:underline">Se profil</span>
        </div>
      </div>
    </Link>
  );
}

export function HomeDJCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-1/2 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
