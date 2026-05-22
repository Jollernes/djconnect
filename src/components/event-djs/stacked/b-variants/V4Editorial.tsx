import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { HostAvatar } from "../HostAvatar";
import {
  eventCountLabel,
  eventCountValue,
  reviewCountLabel,
} from "../eventCountLabel";

/**
 * V4 — Editorial magazine (Kinfolk / Cereal).
 *
 * Big serif numeral in the top-right of the card. Lowercase italic serif
 * eyebrow, regular-weight serif name, italic serif bio. "—" separators
 * in the stats row. Right rail becomes just price + "Læs Mikkels historie →"
 * link — no boxy button.
 */
export function StackedDJCardB_V4Editorial({
  dj,
  eventTypeId,
  index,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  index?: number;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";
  const firstName = (dj.profile.full_name || dj.stage_name).split(/\s+/)[0];

  return (
    <Card className="relative overflow-hidden border-amber-100/70 bg-[#faf6ee] transition-shadow hover:shadow-md">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-4 top-2 select-none font-serif text-[64px] font-light leading-none text-amber-200/80",
        )}
      >
        {String(index ?? 0).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO */}
        <div className="relative w-full shrink-0 md:w-60">
          <Link
            to={href}
            className="relative block w-full overflow-hidden bg-muted aspect-[4/3] md:aspect-auto md:h-full md:min-h-full"
          >
            {hero && (
              <img src={hero} alt={dj.stage_name} className="h-full w-full object-cover" loading="lazy" />
            )}
          </Link>
        </div>

        {/* MIDDLE */}
        <div className="flex flex-1 flex-col gap-2.5 p-6 pr-16">
          <p className="font-serif text-[13px] italic lowercase text-amber-800/80">
            {dj.base_location.toLowerCase()} · bryllups-dj
          </p>
          <div className="flex items-center gap-3">
            <HostAvatar
              src={dj.profile.avatar_url}
              alt={dj.profile.full_name || dj.stage_name}
              size="md"
              tone="boutique"
              verified
            />
            <h3 className="font-serif text-[26px] font-normal leading-[1.1] tracking-tight text-slate-900">
              <Link to={href} className="hover:underline">{dj.stage_name}</Link>
            </h3>
          </div>
          {dj.bio && (
            <p className="line-clamp-3 font-serif text-[14px] italic leading-relaxed text-slate-700">
              {dj.bio}
            </p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tabular-nums text-slate-500">
            <span>
              <span className="font-medium text-slate-800">
                {dj.rating_average.toFixed(1)}
              </span>{" "}
              ({dj.rating_count} {reviewCountLabel(eventTypeId)})
            </span>
            <span aria-hidden>—</span>
            <span>
              <span className="font-medium text-slate-800">
                {eventCountValue(dj.events_performed)}
              </span>{" "}
              {eventCountLabel(eventTypeId)}
            </span>
            <span aria-hidden>—</span>
            <span>{dj.base_location}</span>
          </div>
        </div>

        {/* RAIL — magazine */}
        <div className="flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-amber-100 bg-transparent p-6 md:w-52 md:border-l md:border-t-0">
          <div>
            <p className="font-serif text-[11px] italic text-amber-800/80">Pakker fra</p>
            <p className="mt-1 font-serif text-2xl font-normal tracking-tight text-slate-900">
              {priceLabel}
            </p>
          </div>
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 self-start font-serif text-[14px] italic text-amber-800 underline-offset-4 hover:underline"
          >
            Læs {firstName}s historie
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
