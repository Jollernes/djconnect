import { Link } from "react-router-dom";
import { BadgeCheck, Clock, MapPin, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { djHref, priceFromLabel } from "./shared";
import {
  WeddingRings,
  grayscaleFilter,
  regionFor,
  responseHoursFor,
  weddingsPlayedFor,
} from "./V23SoftWedding";

/**
 * V25 — Soft Wedding · Left. Vertical layout sibling of the Clean
 * card with everything left-aligned. The avatar moves out of the
 * hero's bottom-center notch and instead sits as a small inline
 * thumbnail to the LEFT of the name+bio block (a tight mini-header
 * row: avatar | name + bio stacked beside it). Hero is a plain
 * rectangle without any masking. Stats grid, region/price utility
 * row, "Se profil" CTA and response-time line all stay left-aligned.
 * Bio is preserved at three lines.
 */
export function GridCardV25SoftWeddingLeft({
  dj,
  eventTypeId,
  density = "3",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  density?: "3" | "4";
}) {
  const hero =
    dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = djHref(dj, eventTypeId);
  const compact = density === "4";

  const ratingCount = dj.rating_count;
  const weddings = weddingsPlayedFor(dj);
  const years = dj.years_experience;
  const responseHours = responseHoursFor(dj);

  const avatarSize = compact ? 52 : 60;

  const stats = [
    {
      icon: (
        <BadgeCheck
          className={cn(
            "fill-[#b8884a] text-white",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
          )}
          strokeWidth={2}
        />
      ),
      value: `${ratingCount}`,
      label: "anmeldelser",
    },
    {
      icon: (
        <WeddingRings className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      ),
      value: weddings !== null ? `${weddings}+` : "—",
      label: "brylluper",
    },
    {
      icon: (
        <Clock
          className={cn(
            compact ? "h-2.5 w-2.5" : "h-3 w-3",
            "text-[#b8884a]",
          )}
          strokeWidth={1.75}
        />
      ),
      value: years || "—",
      label: "års erfaring",
    },
  ];

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-amber-100/70 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Hero — plain rectangle, no notch. Avatar lives in the
          content area instead. */}
      <div className="relative">
        <Link
          to={href}
          className={cn(
            "relative block w-full overflow-hidden bg-amber-50",
            compact ? "aspect-[4/3]" : "aspect-[5/4]",
          )}
        >
          {hero && (
            <img
              src={hero}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ filter: grayscaleFilter(60) || undefined }}
              loading="lazy"
            />
          )}
        </Link>

        {/* BryllupsDJ badge, top-left. */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 font-sans font-medium uppercase text-slate-900 shadow-sm ring-1 ring-amber-200/80 backdrop-blur-sm",
            compact
              ? "gap-1 px-2.5 py-1 text-[9.5px] tracking-[0.12em]"
              : "gap-1.5 px-3 py-1 text-[10.5px] tracking-[0.14em]",
          )}
        >
          <WeddingRings
            className={compact ? "h-3 w-[20px]" : "h-3.5 w-[22px]"}
          />
          BryllupsDJ
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col bg-white",
          compact ? "px-4 py-4" : "px-5 py-5",
        )}
      >
        {/* Mini-header: avatar (left) + name+bio stacked (right). */}
        <div className="flex items-start gap-3">
          <span
            className="block shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white"
            style={{
              width: avatarSize,
              height: avatarSize,
              boxShadow: "0 4px 14px rgba(17,24,39,0.18)",
            }}
          >
            {dj.profile.avatar_url ? (
              <img
                src={dj.profile.avatar_url}
                alt=""
                width={avatarSize}
                height={avatarSize}
                decoding="async"
                className="block h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-700 text-base font-bold text-white">
                {(dj.profile.full_name || dj.stage_name)
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "truncate font-serif font-semibold leading-tight tracking-tight text-slate-900",
                compact ? "text-[18px]" : "text-[20px]",
              )}
            >
              <Link to={href} className="hover:underline">
                {dj.stage_name}
              </Link>
            </h3>
            {(dj.bio || dj.tagline) && (
              <p
                className={cn(
                  "mt-1 line-clamp-3 leading-snug text-slate-500",
                  compact ? "text-[11.5px]" : "text-[12.5px]",
                )}
              >
                {dj.bio || dj.tagline}
              </p>
            )}
          </div>
        </div>

        {/* 3-stat row — left-aligned inline. */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1.5",
            compact ? "mt-3.5" : "mt-4",
          )}
        >
          {stats.map((s, i) => (
            <span
              key={s.label}
              className={cn(
                "inline-flex items-center gap-1.5",
                compact ? "text-[11px]" : "text-[12px]",
                i > 0 && "border-l border-slate-200 pl-3",
              )}
            >
              <span className="inline-flex items-center text-[#b8884a]">
                {s.icon}
              </span>
              <span className="font-semibold text-slate-900">
                {s.value}
              </span>
              <span className="text-slate-500">{s.label}</span>
            </span>
          ))}
        </div>

        {/* Utility row — region (left) + price (right). */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t border-slate-100",
            compact ? "mt-4 pt-3" : "mt-5 pt-4",
          )}
        >
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1.5 text-slate-600",
              compact ? "text-[12px]" : "text-[12.5px]",
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              Kører i hele {regionFor(dj)}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap font-semibold text-slate-900",
              compact ? "text-[13px]" : "text-[14px]",
            )}
          >
            {priceFromLabel(dj)}
          </span>
        </div>

        {/* Price-includes fine print — left-aligned to match the rest
            of the card. */}
        <div className={cn("text-left", compact ? "mt-1" : "mt-1.5")}>
          <span
            className={cn(
              "block leading-tight text-slate-500",
              compact ? "text-[10px]" : "text-[10.5px]",
            )}
          >
            5 timer inkl. mobildiskotek
          </span>
        </div>

        {/* CTA */}
        <Link
          to={href}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50",
            compact ? "py-2 text-[12.5px]" : "py-2.5 text-[13px]",
          )}
        >
          Se profil <span aria-hidden="true">→</span>
        </Link>

        {/* Response-time line — left-aligned. */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 self-start text-slate-500",
            compact ? "mt-1.5 text-[11px]" : "mt-2 text-[11.5px]",
          )}
        >
          <MessageCircle
            className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
            style={{ color: "#b8884a" }}
            strokeWidth={1.75}
          />
          <span>
            Svarer typisk inden for{" "}
            <span className="font-medium text-slate-700">
              {responseHours} timer
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
