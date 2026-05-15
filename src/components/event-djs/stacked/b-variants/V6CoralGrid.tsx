import { Link } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  Star,
  Play,
  Sliders,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * V6 — Coral grid (inspired by the international SaaS reference).
 *
 * Vertical grid card, ~4 columns per row on desktop. Hero photo top
 * with a diagonal coral corner accent + small dark circular initials
 * avatar overlapping bottom-left. Bold sans name + green verified
 * check. Big price + rating row, three outlined utility chips, and a
 * prominent coral full-width "Check availability →" CTA.
 */
export function StackedDJCardB_V6CoralGrid({
  dj,
  eventTypeId,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = eventTypeId ? `/djs/${dj.username}?eventType=${eventTypeId}` : `/djs/${dj.username}`;

  const initials = (dj.profile.full_name || dj.stage_name)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const priceLabel = dj.price_on_request
    ? "Pris på forespørgsel"
    : dj.price_from_minor
      ? formatCurrency(dj.price_from_minor, dj.currency)
      : "—";

  const role =
    eventTypeId === "wedding"
      ? "Wedding DJ"
      : eventTypeId === "birthday"
        ? "Party DJ"
        : eventTypeId === "corporate_event" || eventTypeId === "corporate_party"
          ? "Event DJ"
          : "DJ";

  return (
    <Card className="group flex flex-col overflow-hidden border bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* HERO */}
      <Link to={href} className="relative block aspect-[5/4] w-full overflow-hidden bg-muted">
        {hero && (
          <img
            src={hero}
            alt={dj.stage_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {/* Coral corner accent */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-px -top-px h-24 w-24"
          style={{
            background: "#ff7a59",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        {/* Initials badge — bottom-left overlap */}
        <span className="absolute -bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white shadow-md ring-2 ring-white">
          {initials || "DJ"}
        </span>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 pt-5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[16px] font-bold leading-tight text-slate-900">
            <Link to={href} className="hover:underline">{dj.stage_name}</Link>
          </h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
        </div>
        {dj.bio && (
          <p className="line-clamp-3 text-[12.5px] italic leading-snug text-slate-500">
            {dj.bio}
          </p>
        )}
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>{dj.base_location}</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-700">
            {role}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t pt-2.5">
          <div>
            <p className="text-[16px] font-bold leading-none text-slate-900">{priceLabel}</p>
            <p className="text-[10.5px] uppercase tracking-wider text-slate-400">starting at</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-slate-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">
              {dj.rating_average.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-slate-500">({dj.rating_count})</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[
            { icon: Play, label: "Video" },
            { icon: Sliders, label: "Setup" },
            { icon: Zap, label: "Fast quote" },
          ].map((c) => (
            <button
              key={c.label}
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-[10.5px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <c.icon className="h-3 w-3" />
              {c.label}
            </button>
          ))}
        </div>
        <Button
          asChild
          className={cn(
            "mt-2 w-full gap-1.5 rounded-md font-semibold tracking-tight text-white shadow-sm transition-colors",
          )}
          style={{ backgroundColor: "#ff6b46" }}
        >
          <Link to={href}>
            Check availability
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
