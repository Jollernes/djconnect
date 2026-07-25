import type { ComponentType } from "react";
import { Briefcase, Cake, Disc3, PartyPopper } from "lucide-react";
import type { DJProfileWithRelations } from "@/types/domain";

/** Hallmark colour applied to the hallmark-badge glyph regardless of
 * event. Keeps the rose-gold / champagne family the Soft Wedding card
 * is built around so the cards still read as a single coherent
 * marketplace surface even when the event-specific glyph changes. */
const HALLMARK_COLOUR = "#b8884a";

/** Two slightly-overlapping outline rings drawn as inline SVG —
 * couldn't reuse a lucide glyph because the library doesn't include
 * a wedding-rings symbol. Stroke defaults to the rose-gold hallmark
 * colour but can be overridden so the same glyph picks up alternate
 * `colourway` accent palettes when used inside the stat row. */
export function WeddingRings({
  className,
  stroke = HALLMARK_COLOUR,
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      viewBox="0 0 26 16"
      fill="none"
      stroke={stroke}
      strokeWidth={1.5}
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="5.25" />
      <circle cx="17" cy="9" r="5.25" />
    </svg>
  );
}

/** Lucide-backed glyph wrapper that gives every event-specific icon
 * a uniform `{ className, stroke }` surface (same shape as
 * `WeddingRings` above). The `stroke` prop drives the icon colour
 * via `currentColor` so the same component can render in the
 * hallmark badge (rose-gold) or in the stat row (active
 * colourway accent). */
function makeLucideHallmarkIcon(Icon: ComponentType<{ className?: string; strokeWidth?: number }>) {
  return function HallmarkIcon({
    className,
    stroke = HALLMARK_COLOUR,
  }: {
    className?: string;
    stroke?: string;
  }) {
    return (
      <span
        className={className}
        style={{ color: stroke, display: "inline-flex", alignItems: "center" }}
        aria-hidden="true"
      >
        <Icon className="h-full w-full" strokeWidth={1.75} />
      </span>
    );
  };
}

/** Cross-event theme pack used by `GridCardV23SoftWedding` to swap
 * out the wedding-specific copy and glyphs while keeping the card
 * layout, colourway tokens, and editorial hero treatment identical
 * across event types.
 *
 * Each theme controls:
 *   · The hallmark badge that sits top-left on the hero photo
 *     (label + glyph). On the wedding card this is `BryllupsDJ`
 *     with two overlapping rings; other events use `FødselsdagsDJ`
 *     / `FirmaDJ` / `EventDJ` with a cake / briefcase / popper.
 *   · The "events played" stat in the inline stat row (label +
 *     glyph + heuristic count). On the wedding card this is
 *     "X+ brylluper"; other events relabel to "fødselsdage" /
 *     "firmaevents" / "events" and re-scale the count seed so
 *     it remains believable for that event type (a busy birthday
 *     DJ plays far more parties/year than a wedding-only DJ).
 *   · The default `priceIncludes` line so the typical slot length
 *     stays sensible per event (weddings tend to run 5+ hours,
 *     birthdays / corporate / generic events tend to be ~4). */
export type EventTheme = {
  /** Stable id for debugging + analytics (no UI surface). */
  id: "wedding" | "birthday" | "corporate" | "other";
  /** Text shown inside the hallmark pill on the hero photo. */
  hallmarkLabel: string;
  /** Component rendered to the left of the hallmark label. Receives
   * `{ className, stroke? }` so the parent can size + recolour it. */
  HallmarkIcon: ComponentType<{ className?: string; stroke?: string }>;
  /** Singular noun used for the second stat in the inline stat
   * row (e.g. "brylluper", "fødselsdage", "firmaevents", "events"). */
  playedLabel: string;
  /** Glyph rendered next to the played count. Same shape as
   * `HallmarkIcon` so the existing stat row can keep calling it
   * with `stroke={palette.accent}`. */
  PlayedIcon: ComponentType<{ className?: string; stroke?: string }>;
  /** Heuristic count of how many events of this kind the DJ has
   * played, driven by `dj.years_experience` and `dj.rating_count`.
   * Returns `null` when we don't have enough signal so the UI can
   * render an em-dash. */
  playedCount(dj: DJProfileWithRelations): number | null;
  /** Default `priceIncludes` line shown under the price (e.g.
   * "5 timer inkl. lyd & lys" for weddings). The parent page can
   * override this per-listing if needed. */
  defaultPriceIncludes: string[];
  /** Optional override for the filled "Se profil & kontakt DJen"
   * CTA's colour tokens. When omitted the CTA inherits the active
   * Soft Wedding `colourway` palette (rose-gold default). Non-
   * wedding event types use this to swap to a dark navy fill so
   * the CTA reads as the visual end-anchor without leaning on the
   * wedding-magazine palette. */
  ctaTokens?: {
    /** Tailwind bg class for the resting state. */
    bg: string;
    /** Tailwind border class. Slightly darker than `bg` so the
     * button has a defined edge. */
    border: string;
    /** Tailwind hover class (typically `hover:bg-…`). */
    hover: string;
    /** Optional text-colour class. Defaults to inherit when not
     * provided — set this when the bg is dark enough to need
     * white/light text. */
    text?: string;
  };
};

/** Build a per-event "played count" heuristic from the same
 * `years_experience` bucket + `rating_count` modulation the wedding
 * card already uses. Different event types just scale the base
 * differently (a touring birthday DJ plays many more parties/year
 * than a wedding-only one). Result is rounded down to the nearest 10
 * for a marketing-friendly "X+" read. */
function makePlayedCount(
  base: Record<string, number>,
  reviewWeight: number,
  minFloor: number,
) {
  return function playedCount(dj: DJProfileWithRelations): number | null {
    const seed = base[dj.years_experience];
    if (seed === undefined) return null;
    const bumped = seed + Math.floor((dj.rating_count ?? 0) * reviewWeight);
    return Math.max(minFloor, Math.round(bumped / 10) * 10);
  };
}

export const WEDDING_THEME: EventTheme = {
  id: "wedding",
  hallmarkLabel: "BryllupsDJ",
  HallmarkIcon: WeddingRings,
  playedLabel: "brylluper",
  PlayedIcon: WeddingRings,
  playedCount: makePlayedCount(
    { "10+": 200, "5-10": 95, "3-5": 45, "1-3": 18 },
    1.4,
    20,
  ),
  defaultPriceIncludes: ["5 timer inkl. lyd & lys"],
};

/** Shared dark-navy CTA tokens for non-wedding event browse pages.
 * Reads as professional / energetic without leaning on the warm
 * wedding-magazine palette. Stays on the slate family so it sits
 * comfortably next to the existing slate-text typography. */
const NAVY_CTA_TOKENS = {
  bg: "bg-[#1e2a44]",
  border: "border-[#172238]",
  hover: "hover:bg-[#172238]",
  text: "text-white",
};

export const BIRTHDAY_THEME: EventTheme = {
  id: "birthday",
  hallmarkLabel: "FødselsdagsDJ",
  HallmarkIcon: makeLucideHallmarkIcon(Cake),
  playedLabel: "fødselsdage",
  PlayedIcon: makeLucideHallmarkIcon(Cake),
  // A working birthday DJ plays ~2-3 × the parties a wedding-only
  // DJ does (more frequent, often shorter, often weeknights too).
  playedCount: makePlayedCount(
    { "10+": 480, "5-10": 230, "3-5": 110, "1-3": 45 },
    1.6,
    40,
  ),
  defaultPriceIncludes: ["4 timer inkl. lyd & lys"],
  ctaTokens: NAVY_CTA_TOKENS,
};

export const CORPORATE_THEME: EventTheme = {
  id: "corporate",
  hallmarkLabel: "FirmaDJ",
  HallmarkIcon: makeLucideHallmarkIcon(Briefcase),
  playedLabel: "firmaevents",
  PlayedIcon: makeLucideHallmarkIcon(Briefcase),
  // Corporate gigs concentrate in Q4 (julefrokost) + summer
  // (sommerfest) so even an experienced corporate-focused DJ plays
  // fewer events/year than a birthday DJ — but more than a strict
  // wedding-only DJ because of week-night company gigs.
  playedCount: makePlayedCount(
    { "10+": 260, "5-10": 130, "3-5": 60, "1-3": 22 },
    1.5,
    25,
  ),
  defaultPriceIncludes: ["4 timer inkl. lyd & lys"],
  ctaTokens: NAVY_CTA_TOKENS,
};

export const OTHER_THEME: EventTheme = {
  id: "other",
  hallmarkLabel: "EventDJ",
  HallmarkIcon: makeLucideHallmarkIcon(PartyPopper),
  playedLabel: "events",
  PlayedIcon: makeLucideHallmarkIcon(PartyPopper),
  // Generic catch-all — most-active DJs across multiple categories.
  playedCount: makePlayedCount(
    { "10+": 350, "5-10": 165, "3-5": 80, "1-3": 32 },
    1.5,
    30,
  ),
  defaultPriceIncludes: ["4 timer inkl. lyd & lys"],
  ctaTokens: NAVY_CTA_TOKENS,
};

/** Filled-CTA tokens built from the DJConnect brand accent (orange)
 * so the neutral homepage card leans on the platform's own palette
 * rather than the warm wedding-magazine rose-gold. White text keeps
 * the label legible on the saturated accent fill. */
const DJ_CTA_TOKENS = {
  bg: "bg-accent",
  border: "border-accent",
  hover: "hover:bg-accent/90",
  text: "text-accent-foreground",
};

/** Event-neutral theme for the homepage listings. Reuses the Soft
 * Wedding card layout but drops any event-specific framing: the
 * hallmark badge is expected to be hidden by the caller
 * (`hideHallmark`), the CTA uses the brand-accent fill, and the
 * copy stays generic ("events"). Keeps the same shape as the other
 * themes so it slots into `GridCardV23SoftWedding` unchanged. */
export const NEUTRAL_THEME: EventTheme = {
  id: "other",
  hallmarkLabel: "DJ",
  HallmarkIcon: makeLucideHallmarkIcon(Disc3),
  playedLabel: "events",
  PlayedIcon: makeLucideHallmarkIcon(Disc3),
  playedCount: makePlayedCount(
    { "10+": 350, "5-10": 165, "3-5": 80, "1-3": 32 },
    1.5,
    30,
  ),
  defaultPriceIncludes: ["4 timer inkl. lyd & lys"],
  ctaTokens: DJ_CTA_TOKENS,
};
