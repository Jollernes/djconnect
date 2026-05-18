import { Link } from "react-router-dom";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { djHref, priceFromLabel } from "./shared";
import {
  WeddingRings,
  grayscaleFilter,
  regionFor,
  weddingsPlayedFor,
} from "./V23SoftWedding";

/**
 * V27 — Soft Wedding · Overlay. Image-heavy alternative where the
 * hero photo dominates and the content sits as a frosted-glass
 * "ticket" overlapping the bottom ~45 % of the hero. Hero uses a
 * taller 4:3 aspect. The content panel has rounded corners, a slight
 * negative top margin so it overlaps the photo, and a subtle
 * backdrop blur. Bio is preserved at three lines.
 */
export function GridCardV27SoftWeddingOverlay({
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

  const avatarSize = compact ? 48 : 56;

  const stats = [
    {
      icon: (
        <BadgeCheck
          className={cn(
            "fill-[#b8884a] text-white",
            compact ? "h-2.5 w-2.5" : "h-3 w-3",
          )}
          strokeWidth={2}
        />
      ),
      value: `${ratingCount}`,
      label: "anmeldelser",
    },
    {
      icon: (
        <WeddingRings
          className={compact ? "h-2 w-2" : "h-2.5 w-2.5"}
        />
      ),
      value: weddings !== null ? `${weddings}+` : "—",
      label: "brylluper",
    },
    {
      icon: (
        <Clock
          className={cn(
            compact ? "h-2 w-2" : "h-2.5 w-2.5",
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
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-100/70 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Hero — taller 4:3 aspect. Sits in its own block so the
          content panel can negative-margin into the bottom. */}
      <div className="relative">
        <Link
          to={href}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-amber-50"
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
          {/* Soft bottom gradient so the content panel reads on top
              of variable photos. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0.32) 100%)",
            }}
          />
        </Link>

        {/* BryllupsDJ badge — top-left of hero. */}
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

        {/* Small avatar — sits in the top-right of where the panel
            will land, floating just above the panel's top edge. */}
        <span
          className="absolute right-4 z-10 block overflow-hidden rounded-full bg-white ring-2 ring-white"
          style={{
            width: avatarSize,
            height: avatarSize,
            bottom: -avatarSize / 2,
            boxShadow: "0 4px 14px rgba(17,24,39,0.22)",
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
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-xs font-bold text-white">
              {(dj.profile.full_name || dj.stage_name)
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* Content panel — overlaps the bottom of the hero by ~32 px
          via negative top margin. Rounded top corners, ring + subtle
          shadow lift it visually off the photo. */}
      <div
        className={cn(
          "relative z-[1] -mt-8 flex flex-1 flex-col rounded-t-2xl bg-white/95 ring-1 ring-amber-100/80 backdrop-blur-sm",
          compact ? "px-4 pb-4 pt-5" : "px-5 pb-5 pt-6",
        )}
      >
        {/* Name — left-aligned, leaves space for the floating avatar
            on the right (negative right padding handled by the
            avatar's `right-4` absolute position). */}
        <h3
          className={cn(
            "truncate font-serif font-semibold leading-tight tracking-tight text-slate-900",
            compact
              ? "pr-12 text-[17px]"
              : "pr-16 text-[19px]",
          )}
        >
          <Link to={href} className="hover:underline">
            {dj.stage_name}
          </Link>
        </h3>

        {/* Bio — preserved at 3 lines. Left-aligned to match the
            ticket feel of the panel. */}
        {(dj.bio || dj.tagline) && (
          <p
            className={cn(
              "mt-1 line-clamp-3 leading-snug text-slate-500",
              compact ? "text-[11px]" : "text-[12px]",
            )}
          >
            {dj.bio || dj.tagline}
          </p>
        )}

        {/* Stats — compact pills row, single line. */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5",
            compact ? "mt-2.5" : "mt-3",
          )}
        >
          {stats.map((s) => (
            <span
              key={s.label}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-amber-100 bg-[#fdfaf3] text-slate-700",
                compact
                  ? "px-1.5 py-0.5 text-[9.5px]"
                  : "px-2 py-0.5 text-[10.5px]",
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

        {/* Utility row — region + price. */}
        <div
          className={cn(
            "flex items-center justify-between gap-2 border-t border-slate-100",
            compact ? "mt-3 pt-2.5" : "mt-3.5 pt-3",
          )}
        >
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1 text-slate-600",
              compact ? "text-[11.5px]" : "text-[12px]",
            )}
          >
            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">
              Kører i hele {regionFor(dj)}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap font-semibold text-slate-900",
              compact ? "text-[12.5px]" : "text-[13.5px]",
            )}
          >
            {priceFromLabel(dj)}
          </span>
        </div>

        {/* Price-includes fine print. */}
        <div className={cn("text-right", compact ? "mt-0.5" : "mt-1")}>
          <span
            className={cn(
              "block leading-tight text-slate-500",
              compact ? "text-[9.5px]" : "text-[10px]",
            )}
          >
            5 timer inkl. lyd & lys
          </span>
        </div>

        {/* CTA */}
        <Link
          to={href}
          className={cn(
            "mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50",
            compact ? "py-1.5 text-[11.5px]" : "py-2 text-[12.5px]",
          )}
        >
          Se profil <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  );
}
