import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
 * V2 — Airy / Type-first.
 *
 * Smaller scale across the board, more whitespace, no boutique pill on
 * the hero. Editorial-light. Thin "Anmod tilbud →" link instead of a
 * big rail button. Inspirations: Linear, Stripe.com.
 */
export function StackedDJCardB_V2Airy({
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
    <Card className="overflow-hidden border-amber-100/60 bg-[#fbf8f3] shadow-none transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO */}
        <div className="relative w-full shrink-0 md:w-56">
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
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
            {dj.base_location} · Bryllups-DJ
          </p>
          <div className="flex items-center gap-2.5">
            <HostAvatar
              src={dj.profile.avatar_url}
              alt={dj.profile.full_name || dj.stage_name}
              size="sm"
              tone="boutique"
              verified
            />
            <h3 className="font-serif text-[18px] font-normal leading-snug tracking-tight text-slate-900">
              <Link to={href} className="hover:underline">{dj.stage_name}</Link>
            </h3>
          </div>
          {dj.bio && (
            <p className="line-clamp-2 text-[13px] leading-[1.65] text-slate-600">
              {dj.bio}
            </p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] tabular-nums text-slate-500">
            <span>
              <span className="font-medium text-slate-800">
                {dj.rating_average.toFixed(1)}
              </span>{" "}
              ({dj.rating_count} {reviewCountLabel(eventTypeId)})
            </span>
            <span className="text-slate-300">—</span>
            <span>
              <span className="font-medium text-slate-800">
                {eventCountValue(dj.events_performed)}
              </span>{" "}
              {eventCountLabel(eventTypeId)}
            </span>
            <span className="text-slate-300">—</span>
            <span>{dj.base_location}</span>
          </div>
        </div>

        {/* RAIL — minimal */}
        <div className="flex shrink-0 flex-col items-stretch justify-between gap-2 border-t border-amber-100 bg-transparent p-5 md:w-48 md:border-l md:border-t-0">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Pakker fra
            </p>
            <p className="mt-1 font-serif text-lg tracking-tight text-slate-900">
              {priceLabel}
            </p>
          </div>
          <Link
            to={href}
            className={cn(
              "inline-flex items-center gap-1 text-[13px] font-medium text-amber-800 hover:text-amber-900",
            )}
          >
            Anmod tilbud
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
