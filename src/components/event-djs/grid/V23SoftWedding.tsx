import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  priceFromLabel,
} from "./shared";

/**
 * V23 — Soft Wedding. Premium marketplace listing card with a soft,
 * warm-tinted hero photo (champagne / blush wash), an orange "Featured"
 * pill top-left and a green "Verified" pill top-right, and a circular
 * grayscale avatar carved into the lower-middle of the hero via a
 * radial mask so the hero's bottom edge appears to curve around the
 * avatar. Content below: name, single-line muted subtitle, orange
 * star rating, light-gray event-type pill tags, and a utility row
 * with location on the left and starting price on the right.
 */
export type SoftWeddingTint = "none" | "light" | "soft";

export function GridCardV23SoftWedding({
  dj,
  eventTypeId,
  density = "3",
  tint = "soft",
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  density?: "3" | "4";
  /** How much warm-wedding wash to apply on top of the hero. `none`
   * shows the raw photo, `light` is a very subtle blush, `soft` is
   * the original champagne/blush wedding wash. */
  tint?: SoftWeddingTint;
}) {
  const hero = dj.equipment_photos[0]?.url || dj.profile.avatar_url || "";
  const href = djHref(dj, eventTypeId);
  const compact = density === "4";

  // Avatar / notch geometry. The radial-gradient mask carves a half-
  // circle out of the bottom-center of the hero so the avatar drops
  // into a real cutout (not just a circle pasted on top). Notch radius
  // is slightly larger than the avatar so a clean ivory gap surrounds
  // it.
  const avatarSize = compact ? 60 : 72;
  const notchRadius = avatarSize / 2 + 8;

  const heroMask = `radial-gradient(circle ${notchRadius}px at 50% 100%, transparent ${notchRadius}px, black ${
    notchRadius + 1
  }px)`;

  // Event-type pill tags. Mirror the reference's "Wedding · Birthday
  // Party · Corporate Event · +2" shape but localized to Danish.
  const tagList = eventTypesLine(dj, 3).split(", ").filter(Boolean);
  const totalEventTypes = dj.event_types.length;
  const extraTagCount = Math.max(totalEventTypes - tagList.length, 0);

  const ratingValue = dj.rating_average.toFixed(1).replace(".", ",");
  const ratingCount = dj.rating_count;

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-amber-100/70 bg-white shadow-sm transition-shadow hover:shadow-md",
      )}
    >
      {/* Hero with soft tint + carved notch for the avatar */}
      <div className="relative">
        <Link
          to={href}
          className={cn(
            "relative block w-full overflow-hidden bg-amber-50",
            compact ? "aspect-[4/3]" : "aspect-[5/4]",
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
              style={{
                filter:
                  tint === "soft"
                    ? "saturate(0.78) brightness(1.04) contrast(0.96) sepia(0.06)"
                    : tint === "light"
                      ? "saturate(0.92) brightness(1.02)"
                      : undefined,
              }}
              loading="lazy"
            />
          )}
          {/* Warm wedding-tone wash. A blush/champagne gradient on top
              softens nightclub saturation and gives every hero a
              consistent, romantic colour temperature. Suppressed when
              tint === "none"; toned down when tint === "light". */}
          {tint === "soft" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,231,214,0.18) 0%, rgba(255,209,200,0.10) 45%, rgba(245,224,210,0.22) 100%)",
              }}
            />
          )}
          {tint === "light" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,231,214,0.07) 0%, rgba(245,224,210,0.08) 100%)",
              }}
            />
          )}
          {tint !== "none" && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
          )}
        </Link>

        {/* Trust badges */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full font-semibold text-white shadow-sm",
            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
          )}
          style={{ backgroundColor: "#ff6b46" }}
        >
          <Sparkles
            className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
            strokeWidth={2.5}
          />
          Featured
        </span>
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 font-semibold text-white shadow-sm",
            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
          )}
        >
          <BadgeCheck
            className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
            strokeWidth={2.5}
          />
          Verified
        </span>

        {/* Carved-in avatar. Positioned so its centre sits exactly on
            the hero's bottom edge — the upper half drops into the
            notched cutout and the lower half spills into the content
            area below. */}
        <span
          className="absolute left-1/2 block overflow-hidden rounded-full bg-white ring-[3px] ring-white"
          style={{
            width: avatarSize,
            height: avatarSize,
            bottom: -avatarSize / 2,
            transform: "translateX(-50%)",
            boxShadow: "0 4px 14px rgba(17,24,39,0.18)",
          }}
        >
          {dj.profile.avatar_url ? (
            <img
              src={dj.profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.05)" }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-sm font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col bg-white",
          compact ? "px-4 pb-4" : "px-5 pb-5",
        )}
        style={{ paddingTop: avatarSize / 2 + (compact ? 10 : 14) }}
      >
        {/* Name + subtitle */}
        <h3
          className={cn(
            "truncate text-center font-serif font-semibold leading-tight tracking-tight text-slate-900",
            compact ? "text-[19px]" : "text-[22px]",
          )}
        >
          <Link to={href} className="hover:underline">
            {dj.stage_name}
          </Link>
        </h3>
        {dj.tagline && (
          <p
            className={cn(
              "mt-1 truncate text-center leading-snug text-slate-500",
              compact ? "text-[11.5px]" : "text-[12.5px]",
            )}
          >
            {dj.tagline}
          </p>
        )}

        {/* Rating */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="inline-flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={cn(
                  compact ? "h-3.5 w-3.5" : "h-4 w-4",
                  "fill-[#ff8a3d] text-[#ff8a3d]",
                )}
                strokeWidth={1.5}
              />
            ))}
          </span>
          <span
            className={cn(
              "font-semibold text-slate-900",
              compact ? "text-[12px]" : "text-[13px]",
            )}
          >
            {ratingValue}
          </span>
          <span
            className={cn(
              "text-slate-500",
              compact ? "text-[11.5px]" : "text-[12.5px]",
            )}
          >
            ({ratingCount})
          </span>
        </div>

        {/* Event-type pill tags */}
        {tagList.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-1.5",
              compact ? "mt-3" : "mt-4",
            )}
          >
            {tagList.map((t) => (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center rounded-full bg-slate-100 font-medium text-slate-700",
                  compact ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]",
                )}
              >
                {t}
              </span>
            ))}
            {extraTagCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full bg-slate-100 font-medium text-slate-700",
                  compact ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]",
                )}
              >
                +{extraTagCount}
              </span>
            )}
          </div>
        )}

        {/* Utility row */}
        <div
          className={cn(
            "flex items-center justify-between border-t border-slate-100",
            compact ? "mt-4 pt-3" : "mt-5 pt-4",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-slate-600",
              compact ? "text-[12px]" : "text-[12.5px]",
            )}
          >
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{dj.base_location}</span>
          </span>
          <span
            className={cn(
              "font-semibold text-slate-900",
              compact ? "text-[13px]" : "text-[14px]",
            )}
          >
            {priceFromLabel(dj)}
          </span>
        </div>
      </div>
    </Card>
  );
}
