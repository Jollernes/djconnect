import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { HostAvatar } from "../HostAvatar";
import {
  eventCountLabel,
  eventCountValue,
  reviewCountLabel,
} from "../eventCountLabel";

const SETUP_LABEL: Record<string, string> = {
  small: "Lille · op til 60 gæster",
  medium: "Mellem · 60–150 gæster",
  large: "Stor · 150–300 gæster",
  extra_large: "Festival · 300+ gæster",
};

/**
 * V5 — Pro-specs grid (Booking.com / Thumbtack).
 *
 * Narrower 180-px photo column. Middle column drops the bio paragraph
 * in favour of a 2-column structured specs grid: Erfaring · Setup ·
 * Rejseradius · Events · Rating · Svartid. Right rail uses an outline
 * "Anmod tilbud" button (no fill). Optimised for comparison shoppers.
 */
export function StackedDJCardB_V5Specs({
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

  const specs: Array<{ label: string; value: string }> = [
    { label: "Erfaring", value: `${dj.years_experience} år` },
    { label: "Setup", value: SETUP_LABEL[dj.setup_size] || dj.setup_size },
    { label: "Rejseradius", value: `${dj.travel_radius_km} km fra ${dj.base_location}` },
    {
      label: "Events",
      value: `${eventCountValue(dj.events_performed)} ${eventCountLabel(eventTypeId)}`,
    },
    {
      label: "Rating",
      value: `${dj.rating_average.toFixed(1)} (${dj.rating_count} ${reviewCountLabel(eventTypeId)})`,
    },
    { label: "Svartid", value: "< 2 timer" },
  ];

  return (
    <Card className="overflow-hidden border-amber-100/80 bg-[#fbf8f3] transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO — narrow */}
        <div className="relative w-full shrink-0 md:w-[180px]">
          <Link
            to={href}
            className="relative block w-full overflow-hidden bg-muted aspect-[4/3] md:aspect-auto md:h-full md:min-h-full"
          >
            {hero && (
              <img src={hero} alt={dj.stage_name} className="h-full w-full object-cover" loading="lazy" />
            )}
          </Link>
        </div>

        {/* MIDDLE — specs grid */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <HostAvatar
                src={dj.profile.avatar_url}
                alt={dj.profile.full_name || dj.stage_name}
                size="sm"
                tone="boutique"
                verified
              />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                  {dj.base_location}
                </p>
                <h3 className="font-serif text-[18px] font-semibold leading-tight tracking-tight text-slate-900">
                  <Link to={href} className="hover:underline">{dj.stage_name}</Link>
                </h3>
              </div>
            </div>
          </div>
          <dl className={cn(
            "grid grid-cols-1 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-2 md:grid-cols-3",
          )}>
            {specs.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {s.label}
                </dt>
                <dd className="truncate text-[13px] font-medium text-slate-800">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* RAIL — outline button */}
        <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 border-t bg-white/70 p-4 md:w-48 md:border-l md:border-t-0">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pakker fra</p>
            <p className="text-base font-semibold tracking-tight text-slate-900">{priceLabel}</p>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full rounded-md border-amber-700 bg-white text-amber-800 hover:bg-amber-50"
          >
            <Link to={href}>Anmod tilbud</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
