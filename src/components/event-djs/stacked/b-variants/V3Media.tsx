import { Link } from "react-router-dom";
import { PlayCircle, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { HostAvatar } from "../HostAvatar";
import { StatsRow } from "../StatsRow";

/**
 * V3 — Media-rich (Airbnb / Vimeo).
 *
 * Wider 320-px photo column, large hero with centre play-icon overlay
 * and "▶ 1:00 introvideo" pill, plus a 3-thumbnail strip directly under
 * the hero. Right rail adds a secondary "▶ Se introvideo" button above
 * the primary CTA. Maximises visual proof.
 */
export function StackedDJCardB_V3Media({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const photos = dj.equipment_photos.map((p) => p.url).filter(Boolean);
  while (photos.length < 4 && dj.profile.avatar_url) photos.push(dj.profile.avatar_url);
  const hero = photos[0];
  const thumbs = [photos[1], photos[2], photos[3]];

  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;
  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`
      : "—";

  return (
    <Card className="overflow-hidden border-amber-100/80 bg-[#fbf8f3] transition-shadow hover:shadow-lg">
      <div className="flex flex-col gap-0 md:flex-row">
        {/* PHOTO COLUMN — wider */}
        <div className="relative w-full shrink-0 md:w-[320px]">
          <Link to={href} className="group relative block aspect-[4/3] w-full overflow-hidden bg-muted">
            {hero && (
              <img
                src={hero}
                alt={dj.stage_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-amber-700 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play className="h-6 w-6 translate-x-[1px] fill-current" />
              </span>
            </div>
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <PlayCircle className="h-3 w-3" /> 1:00 introvideo
            </span>
          </Link>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {thumbs.map((url, i) => (
              <Link
                key={i}
                to={href}
                className="relative block aspect-[4/3] overflow-hidden bg-muted"
              >
                {url && <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />}
              </Link>
            ))}
          </div>
        </div>

        {/* MIDDLE */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
            {dj.base_location.toUpperCase()}
          </p>
          <div className="flex items-center gap-3">
            <HostAvatar
              src={dj.profile.avatar_url}
              alt={dj.profile.full_name || dj.stage_name}
              size="md"
              tone="boutique"
              verified
            />
            <h3 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-slate-900">
              <Link to={href} className="hover:underline">{dj.stage_name}</Link>
            </h3>
          </div>
          {dj.bio && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
              {dj.bio}
            </p>
          )}
          <StatsRow dj={dj} eventTypeId={eventTypeId} />
        </div>

        {/* RAIL */}
        <div className="flex shrink-0 flex-col items-stretch justify-between gap-3 border-t bg-white/80 p-4 md:w-56 md:border-l md:border-t-0">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pakker fra</p>
            <p className="text-base font-semibold tracking-tight text-slate-900">{priceLabel}</p>
          </div>
          <div className="space-y-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "w-full gap-1.5 rounded-full border-amber-300 bg-white text-amber-800 hover:bg-amber-50",
              )}
            >
              <Link to={href}>
                <PlayCircle className="h-3.5 w-3.5" /> Se introvideo
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="w-full rounded-full bg-amber-700 hover:bg-amber-800"
            >
              <Link to={href}>Se bryllupspakker</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
