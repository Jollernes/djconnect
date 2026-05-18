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
 * V24 — Soft Wedding · Side. Horizontal sibling of the Soft Wedding
 * Clean card. Hero photo + carved-edge avatar sit on the LEFT, all
 * text content (name, full 3-line bio, 3-stat row, region/price,
 * "Se profil" CTA, response time) flows on the RIGHT. Bio length is
 * preserved — it just has more horizontal room to breathe, which is
 * the point of this layout.
 *
 * Mobile: stacks back to vertical (hero on top, content below) so the
 * card still works on phones.
 */
export function GridCardV24SoftWeddingSide({
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

  // Carved-edge avatar. In side layout the notch runs down the right
  // edge of the hero (instead of the bottom), so the avatar appears
  // to drop into a circular cutout in the hero's right side.
  const avatarSize = compact ? 76 : 92;
  const notchRadius = avatarSize / 2 + 2;
  const heroMask = `radial-gradient(circle ${notchRadius}px at 100% 50%, transparent ${notchRadius}px, black ${
    notchRadius + 1
  }px)`;

  const ratingCount = dj.rating_count;
  const weddings = weddingsPlayedFor(dj);
  const years = dj.years_experience;
  const responseHours = responseHoursFor(dj);

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
        <WeddingRings className={compact ? "h-2 w-2" : "h-2.5 w-2.5"} />
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
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-amber-100/70 bg-white shadow-sm transition-shadow hover:shadow-md",
        // Horizontal at sm+, stacked on phones.
        "sm:flex-row",
      )}
    >
      {/* Hero column — left in horizontal layout, top on mobile. */}
      <div
        className={cn(
          "relative shrink-0",
          // Width tuned per density so the bio gets enough horizontal
          // room on the right but the hero still reads as the visual
          // anchor.
          compact
            ? "sm:w-[44%] lg:w-[42%]"
            : "sm:w-[45%] lg:w-[44%]",
        )}
      >
        <Link
          to={href}
          className={cn(
            "relative block w-full overflow-hidden bg-amber-50",
            // Mobile keeps the original 5/4 ratio. From sm up the hero
            // stretches the full card height (handled below).
            "aspect-[5/4] sm:aspect-auto sm:h-full",
          )}
          style={{
            WebkitMaskImage: heroMask,
            maskImage: heroMask,
          }}
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

        {/* BryllupsDJ badge, top-left of hero. */}
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

        {/* Carved-in avatar on the right edge of the hero. Drops into
            the right-side notch so the upper half overlaps the photo
            and the right half spills into the content column. */}
        <span
          className="absolute top-1/2 hidden -translate-y-1/2 overflow-hidden rounded-full bg-white ring-2 ring-white sm:block"
          style={{
            width: avatarSize,
            height: avatarSize,
            right: -avatarSize / 2,
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

        {/* Mobile-only avatar — centered notch at bottom of hero (the
            mask above is right-edge only, so on mobile we render a
            simple overlapping avatar instead). */}
        <span
          className="absolute left-1/2 block -translate-x-1/2 overflow-hidden rounded-full bg-white ring-2 ring-white sm:hidden"
          style={{
            width: avatarSize,
            height: avatarSize,
            bottom: -avatarSize / 2,
            boxShadow: "0 4px 14px rgba(17,24,39,0.18)",
          }}
        >
          {dj.profile.avatar_url && (
            <img
              src={dj.profile.avatar_url}
              alt=""
              width={avatarSize}
              height={avatarSize}
              decoding="async"
              className="block h-full w-full object-cover"
            />
          )}
        </span>
      </div>

      {/* Content column. Left padding bumps up at sm+ to clear the
          avatar that overlaps from the hero side. */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col bg-white",
          compact
            ? "px-4 pb-4 pt-12 sm:pl-12 sm:pt-4"
            : "px-5 pb-5 pt-14 sm:pl-14 sm:pt-5",
        )}
      >
        {/* Name */}
        <h3
          className={cn(
            "font-serif font-semibold leading-tight tracking-tight text-slate-900",
            compact ? "text-[19px]" : "text-[22px]",
            // Center on mobile (matches Clean look), left-align on desktop.
            "text-center sm:text-left",
          )}
        >
          <Link to={href} className="hover:underline">
            {dj.stage_name}
          </Link>
        </h3>

        {/* Bio — full 3 lines, kept verbatim per user requirement. */}
        {(dj.bio || dj.tagline) && (
          <p
            className={cn(
              "mt-1 line-clamp-3 leading-snug text-slate-500",
              compact ? "text-[11.5px]" : "text-[12.5px]",
              "text-center sm:text-left",
            )}
          >
            {dj.bio || dj.tagline}
          </p>
        )}

        {/* 3-stat row. Same data as Clean but a tighter inline row
            since the horizontal layout already gives information
            more breathing room — no need for icon-badge columns. */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1.5",
            compact ? "mt-3" : "mt-3.5",
            "justify-center sm:justify-start",
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

        {/* Utility row: region (left) + price (right). */}
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

        {/* Price-includes fine print. */}
        <div className={cn("text-right", compact ? "mt-1" : "mt-1.5")}>
          <span
            className={cn(
              "block leading-tight text-slate-500",
              compact ? "text-[10px]" : "text-[10.5px]",
            )}
          >
            5 timer inkl. mobildiskotek
          </span>
        </div>

        {/* CTA — pushed to the bottom of the content column at sm+ so
            cards in a row have aligned buttons. */}
        <Link
          to={href}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 sm:mt-auto",
            compact ? "py-2 text-[12.5px]" : "py-2.5 text-[13px]",
          )}
        >
          Se profil <span aria-hidden="true">→</span>
        </Link>

        {/* Response-time reassurance line. */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 self-center text-slate-500 sm:self-start",
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
