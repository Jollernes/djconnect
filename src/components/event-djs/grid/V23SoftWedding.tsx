import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CalendarX2,
  Clock,
  Disc3,
  Heart,
  Images,
  MapPin,
  MessageCircle,
  Play,
  Star,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  photoCountFor,
  priceFromLabel,
  thumbnailsFor,
} from "./shared";

// `WeddingRings` is now defined in `./eventThemes` (as the
// wedding-theme hallmark glyph). Re-export it here so older imports
// from this module keep working.
export { WeddingRings, WEDDING_THEME, BIRTHDAY_THEME, CORPORATE_THEME, OTHER_THEME } from "./eventThemes";
export type { EventTheme } from "./eventThemes";
import { WEDDING_THEME, type EventTheme } from "./eventThemes";

/** A subtle colour wash applied on top of the (otherwise neutral)
 * Soft Wedding card. Used to retint the stat-row icons and the CTA
 * button — and, for `champagne`, the card body itself — without
 * touching the BryllupsDJ hallmark or the editorial grayscale hero.
 * Each entry maps to a complete set of tokens so colourway selection
 * stays a single prop on the parent component. */
export type SoftWeddingColourway =
  | "default"
  | "blush"
  | "sage"
  | "champagne"
  | "dj";

interface SoftWeddingColourwayTokens {
  /** Hex used on icon strokes/fills inside the stat row. */
  accent: string;
  /** Tailwind class for the card and inner content background. */
  cardBg: string;
  /** Border class for the resting state of the ghost "Se profil"
   * CTA (white bg, faint border). */
  ctaBorder: string;
  /** Combined Tailwind hover class for the ghost CTA
   * (border + bg). */
  ctaHover: string;
  /** Background class for the resting state of the filled
   * "Se profil" CTA (visible warm colour fill). */
  ctaFilledBg: string;
  /** Border class for the filled CTA's resting state. Slightly
   * darker than `ctaBorder` so the fill has a defined edge. */
  ctaFilledBorder: string;
  /** Hover bg class for the filled CTA (border stays put). */
  ctaFilledHover: string;
}

export const SOFT_WEDDING_COLOURWAYS: Record<
  SoftWeddingColourway,
  SoftWeddingColourwayTokens
> = {
  // Existing rose-gold / amber accent. Identity colourway — nothing
  // shifts when this is selected, so the prop is fully opt-in.
  default: {
    accent: "#b8884a",
    cardBg: "bg-white",
    ctaBorder: "border-amber-200",
    ctaHover: "hover:border-amber-300 hover:bg-amber-50",
    ctaFilledBg: "bg-[#f7e6c2]",
    ctaFilledBorder: "border-amber-300",
    ctaFilledHover: "hover:bg-[#f3dca6]",
  },
  // Dusty rose. Reads romantic / floral — peony bouquets, blush
  // tablescapes. Keeps the card bg neutral so the hero photo still
  // anchors the composition.
  blush: {
    accent: "#c08487",
    cardBg: "bg-white",
    ctaBorder: "border-[#f0d6d6]",
    ctaHover: "hover:border-[#e6c2c2] hover:bg-[#fbf2f2]",
    ctaFilledBg: "bg-[#e6c2c2]",
    ctaFilledBorder: "border-[#d9a8a8]",
    ctaFilledHover: "hover:bg-[#dbb3b3]",
  },
  // Botanical sage / greenery. A widely-coded modern-wedding
  // palette (eucalyptus runners, olive). Cool, calm, slightly more
  // editorial than the warm default.
  sage: {
    accent: "#7d8b6e",
    cardBg: "bg-white",
    ctaBorder: "border-[#d6dccc]",
    ctaHover: "hover:border-[#c5ceb6] hover:bg-[#f3f5ee]",
    ctaFilledBg: "bg-[#c5ceb6]",
    ctaFilledBorder: "border-[#a8b596]",
    ctaFilledHover: "hover:bg-[#b9c4a8]",
  },
  // Warmer luxe champagne. Same family as the default rose-gold but
  // more saturated and lifted, with the card body itself tinted to
  // a pale champagne so the whole card reads "warm".
  champagne: {
    accent: "#c9a16b",
    cardBg: "bg-[#fcfaf6]",
    ctaBorder: "border-[#e8d09e]",
    ctaHover: "hover:border-[#dfc185] hover:bg-[#f9f1de]",
    ctaFilledBg: "bg-[#e8d09e]",
    ctaFilledBorder: "border-[#dfc185]",
    ctaFilledHover: "hover:bg-[#dfc185]",
  },
  // DJConnect brand palette. Swaps the warm wedding rose-gold for the
  // platform's orange accent so the neutral homepage card reads as
  // "DJ" rather than "wedding-magazine". The filled CTA is normally
  // driven by the theme's `ctaTokens` (brand accent) — these fill
  // tokens are the fallback if a caller uses this colourway without a
  // theme override.
  dj: {
    accent: "#f5761f",
    cardBg: "bg-white",
    ctaBorder: "border-orange-200",
    ctaHover: "hover:border-orange-300 hover:bg-orange-50",
    ctaFilledBg: "bg-accent",
    ctaFilledBorder: "border-accent",
    ctaFilledHover: "hover:bg-accent/90",
  },
};

/**
 * V23 — Soft Wedding. Premium marketplace listing card with a soft,
 * warm-tinted hero photo (champagne / blush wash), an orange "Featured"
 * pill top-left and a green "Verified" pill top-right, and a
 * circular avatar carved into the lower-middle of the hero via a
 * radial mask so the hero's bottom edge appears to curve around the
 * avatar. Content below: name, single-line muted subtitle, orange
 * star rating, light-gray event-type pill tags, and a utility row
 * with location on the left and starting price on the right.
 */
export type SoftWeddingTint =
  | "none"
  | "light"
  | "soft"
  | "wedding"
  | "wedding-airy"
  | "wedding-warm"
  | "wedding-fineart"
  | "wedding-grade-film"
  | "wedding-grade-warmbias"
  | "wedding-grade-matte";

/** CSS filter applied directly to the photo for each tint mode. */
function tintFilter(tint: SoftWeddingTint): string | undefined {
  switch (tint) {
    case "soft":
      return "saturate(0.78) brightness(1.04) contrast(0.96) sepia(0.06)";
    case "light":
      return "saturate(0.92) brightness(1.02)";
    case "wedding":
      return "saturate(0.80) brightness(1.03) contrast(0.95)";
    case "wedding-airy":
      // Light & Airy — bright highlights, low contrast, low saturation.
      return "saturate(0.82) brightness(1.10) contrast(0.86)";
    case "wedding-warm":
      // Warm Romantic — slight sepia tilt, softer contrast, richer sat.
      return "saturate(0.95) brightness(1.04) contrast(0.95) sepia(0.10)";
    case "wedding-fineart":
      // Fine-Art Film — muted, low contrast, no sepia (warmth in shadows
      // comes from overlays so highlights stay clean).
      return "saturate(0.78) brightness(1.02) contrast(0.92)";
    case "wedding-grade-film":
      // Heavy desaturation strips colour casts hard, then warm overlays
      // rebuild a unified wedding palette on top.
      return "saturate(0.55) brightness(1.05) contrast(0.90)";
    case "wedding-grade-warmbias":
      // Hue-rotate -8deg pulls blues toward warm, sepia + moderate desat
      // bias the whole frame toward gold-champagne.
      return "saturate(0.70) brightness(1.06) contrast(0.92) hue-rotate(-8deg) sepia(0.15)";
    case "wedding-grade-matte":
      // Heavy contrast drop creates a matte film look that flattens
      // colour-cast variance between very different source photos.
      return "saturate(0.65) brightness(1.04) contrast(0.85)";
    default:
      return undefined;
  }
}

/** Layered overlay JSX for each tint mode. Returns null when there's
 * no overlay to apply. The overlays are stacked inside an
 * `overflow-hidden` parent so they're clipped to whatever shape the
 * parent has (rectangle for the hero, circle for the avatar). */
function TintOverlay({ tint }: { tint: SoftWeddingTint }) {
  if (tint === "soft") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,231,214,0.18) 0%, rgba(255,209,200,0.10) 45%, rgba(245,224,210,0.22) 100%)",
        }}
      />
    );
  }
  if (tint === "light") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,231,214,0.07) 0%, rgba(245,224,210,0.08) 100%)",
        }}
      />
    );
  }
  if (tint === "wedding") {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,238,220,0.55) 0%, rgba(255,238,220,0.00) 42%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(228,188,178,0.00) 28%, rgba(228,188,178,0.45) 55%, rgba(228,188,178,0.00) 82%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,148,128,0.00) 60%, rgba(168,148,128,0.45) 100%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 25%, rgba(255,247,232,0.16) 0%, rgba(255,247,232,0.00) 60%)",
          }}
        />
      </>
    );
  }
  if (tint === "wedding-airy") {
    // High-key, bright, soft. Cream haze + very gentle blush midtones,
    // shadows lifted with cream rather than warmed with taupe so the
    // image keeps the "Pinterest-wedding" brightness throughout.
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,247,235,0.30) 0%, rgba(255,247,235,0.00) 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,225,215,0.00) 30%, rgba(255,225,215,0.30) 55%, rgba(255,225,215,0.00) 82%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,247,235,0.00) 55%, rgba(255,247,235,0.22) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(255,247,240,0.06)",
          }}
        />
      </>
    );
  }
  if (tint === "wedding-warm") {
    // Golden-hour intimacy. Gold-peach highlights, rich blush
    // midtones, warm amber shadows, and an amber radial glow biased
    // toward the upper-right (suggesting late-afternoon sun).
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,210,160,0.55) 0%, rgba(255,210,160,0.00) 45%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(235,170,140,0.00) 28%, rgba(235,170,140,0.50) 55%, rgba(235,170,140,0.00) 82%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(150,95,65,0.00) 58%, rgba(150,95,65,0.50) 100%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 80% at 72% 22%, rgba(255,200,150,0.22) 0%, rgba(255,200,150,0.00) 60%)",
          }}
        />
      </>
    );
  }
  if (tint === "wedding-fineart") {
    // Diagonal peach → blush → lavender wash. Single normal-blend
    // overlay with calibrated alphas — sits visibly on top of the
    // photo and gives every hero a soft, dreamy, colour-graded feel.
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,220,200,0.55) 0%, rgba(240,210,225,0.35) 50%, rgba(220,210,240,0.45) 100%)",
        }}
      />
    );
  }
  if (tint === "wedding-grade-film") {
    // Grade A. Heavy desaturation in the filter strips the source
    // colour casts; here we rebuild a unified warm wedding palette:
    // full-frame champagne base + 3 soft-light tonal bands + luminous
    // upper-centre haze.
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(255,235,215,0.18)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,245,230,0.50) 0%, rgba(255,245,230,0.00) 42%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(230,180,155,0.00) 28%, rgba(230,180,155,0.40) 55%, rgba(230,180,155,0.00) 82%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(150,125,105,0.00) 60%, rgba(150,125,105,0.45) 100%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 22%, rgba(255,250,240,0.16) 0%, rgba(255,250,240,0.00) 60%)",
          }}
        />
      </>
    );
  }
  if (tint === "wedding-grade-warmbias") {
    // Grade B. Hue-rotate + sepia in the filter pre-warm every photo;
    // here a single unified diagonal gradient (champagne → peach →
    // taupe) plus a soft luminous haze finishes the look.
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(252,230,210,0.18)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, rgba(255,238,220,0.40) 0%, rgba(235,195,180,0.30) 50%, rgba(170,140,120,0.35) 100%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 70% at 50% 18%, rgba(255,247,235,0.20) 0%, rgba(255,247,235,0.00) 65%)",
          }}
        />
      </>
    );
  }
  if (tint === "wedding-grade-matte") {
    // Grade C. Filter already flattened the photo's contrast; here a
    // soft champagne base raises black levels further, then the
    // standard 3-band ivory/peach/taupe soft-light stack adds warmth.
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(255,240,225,0.14)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,240,220,0.45) 0%, rgba(255,240,220,0.00) 42%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(225,185,170,0.00) 28%, rgba(225,185,170,0.42) 55%, rgba(225,185,170,0.00) 82%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(155,130,110,0.00) 60%, rgba(155,130,110,0.42) 100%)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 85% at 50% 22%, rgba(255,247,232,0.18) 0%, rgba(255,247,232,0.00) 62%)",
          }}
        />
      </>
    );
  }
  return null;
}

/** Resolve a `boolean | number` grayscale prop into a CSS filter
 * fragment (e.g. `grayscale(60%)`) or `null` if the photo should be
 * left in colour. */
export function grayscaleFilter(g: boolean | number): string | null {
  const pct = typeof g === "number" ? g : g ? 100 : 0;
  return pct > 0 ? `grayscale(${pct}%)` : null;
}

/** Coarse city → Danish region map for the "Tilgængelig i …"
 * line on the Clean variant. Falls back to the raw city string when
 * unmapped so we never render an empty location. */
const REGION_BY_CITY: Record<string, string> = {
  Copenhagen: "Sjælland",
  København: "Sjælland",
  Roskilde: "Sjælland",
  Helsingør: "Sjælland",
  Aarhus: "Midtjylland",
  Århus: "Midtjylland",
  Aalborg: "Nordjylland",
  Ålborg: "Nordjylland",
  Esbjerg: "Sydjylland",
  Odense: "Fyn",
};

export function regionFor(dj: DJProfileWithRelations): string {
  return REGION_BY_CITY[dj.base_location] ?? dj.base_location;
}

/** Heuristic typical-response-time in whole hours. Driven by review
 * count as a proxy for how active the DJ is on the platform. Used
 * by the Clean variant's "Svarer typisk inden for X timer" stat. */
export function responseHoursFor(dj: DJProfileWithRelations): number {
  const rc = dj.rating_count ?? 0;
  if (rc >= 100) return 2;
  if (rc >= 50) return 4;
  if (rc >= 20) return 12;
  return 24;
}

/** Heuristic "weddings played" count keyed off years of experience
 * and modulated by review count so adjacent DJs in the same
 * experience bracket still show different numbers. Result is
 * rounded down to the nearest 10 for a marketing-friendly "X+"
 * read. Returns `null` when we don't have enough signal.
 *
 * Thin wrapper around `WEDDING_THEME.playedCount` kept for older
 * external imports (V24–V27 alternate cards still reference this
 * name). New callers should prefer `eventTheme.playedCount(dj)`. */
export function weddingsPlayedFor(dj: DJProfileWithRelations): number | null {
  return WEDDING_THEME.playedCount(dj);
}

const WEDDING_TINTS: SoftWeddingTint[] = [
  "wedding",
  "wedding-airy",
  "wedding-warm",
  "wedding-fineart",
  "wedding-grade-film",
  "wedding-grade-warmbias",
  "wedding-grade-matte",
];

/**
 * Compact horizontal listing row used on mobile for the event-DJs
 * pages (e.g. `/wedding-djs`). The hero photo + carved avatar sit on
 * the left; the DJ name, region, starting price, years of experience
 * and events-played count stack on the right. Sized so ~2.5 rows fit
 * on a phone screen. Desktop keeps the full `GridCardV23SoftWedding`.
 */
export function SoftWeddingMobileRow({
  dj,
  eventTypeId,
  eventTheme = WEDDING_THEME,
  heroOverrides,
  unavailable,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  eventTheme?: EventTheme;
  heroOverrides?: Record<string, string>;
  unavailable?: { reason: string; subReason?: string } | null;
}) {
  const hero =
    heroOverrides?.[dj.username] ||
    dj.equipment_photos[0]?.url ||
    dj.profile.avatar_url ||
    "";
  const avatar = dj.profile.avatar_url || hero;
  const href = djHref(dj, eventTypeId);
  const region = regionFor(dj);
  const price = priceFromLabel(dj);
  const played = eventTheme.playedCount(dj);
  const isUnavailable = Boolean(unavailable);

  return (
    <Link
      to={href}
      className={cn(
        "group relative flex h-48 overflow-hidden rounded-2xl border border-amber-100/70 bg-white shadow-sm transition-shadow hover:shadow-md",
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      {/* Left: hero photo. ~3:4 portrait keeps a natural photo
          proportion against the text column. */}
      <div className="relative h-full w-[9.5rem] shrink-0 overflow-hidden bg-amber-50">
        {hero && (
          <img
            src={hero}
            alt={dj.stage_name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      {/* Avatar carved onto the seam between the photo and the text
          column, vertically centred. */}
      <span className="absolute top-1/2 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md left-[9.5rem]">
        {avatar && (
          <img
            src={avatar}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </span>

      {/* Right: details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pl-10 pr-3">
        <div className="flex items-center gap-1">
          <h3 className="truncate text-[15px] font-semibold text-foreground">
            {dj.stage_name}
          </h3>
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{region}</span>
        </div>
        <div className="text-base font-semibold text-foreground">{price}</div>
        <div className="mt-0.5 flex flex-col gap-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {dj.years_experience} års erfaring
          </span>
          {played != null && (
            <span className="inline-flex items-center gap-1.5">
              <eventTheme.PlayedIcon className="h-3.5 w-3.5 shrink-0" />
              {played}+ {eventTheme.playedLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function GridCardV23SoftWedding({
  dj,
  eventTypeId,
  density = "3",
  tint = "soft",
  heroOverrides,
  heroGrayscale = false,
  avatarGrayscale = true,
  bioLines = 1,
  fontStyle = "serif",
  showWeddingsPlayed = false,
  hideEventTypes = false,
  hideStarRating = false,
  showResponseTime = false,
  showRegion = false,
  showSeeProfileCta = false,
  priceIncludes,
  statStyle = "default",
  footerStyle = "default",
  ctaLabel = "Se profil & kontakt DJen",
  colourway = "default",
  ctaProminence = "ghost",
  availabilityDate,
  photoLayout = "carved",
  eventTheme = WEDDING_THEME,
  hideHallmark = false,
  videoUrl,
  unavailable,
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  density?: "3" | "4" | "5";
  /** How much warm-wedding wash to apply on top of the hero. `none`
   * shows the raw photo, `light` is a very subtle blush, `soft` is
   * the original champagne/blush wedding wash. */
  tint?: SoftWeddingTint;
  /** Optional per-DJ hero photo override. Used by the unifying-grade
   * variants to swap in specific source photos for chosen DJs so we
   * can demo a colour grade against known-different lighting. */
  heroOverrides?: Record<string, string>;
  /** Grayscale applied to the hero image. `true` = 100 %, a number is
   * the percentage, `false`/undefined leaves the photo in colour.
   * Stacks with any tint filter. */
  heroGrayscale?: boolean | number;
  /** Grayscale applied to the avatar. `true` = 100 %, a number is the
   * percentage, `false` leaves it in colour. Defaults to true so
   * existing variants keep their B&W carved-in portrait. */
  avatarGrayscale?: boolean | number;
  /** How many lines of muted bio text to show under the DJ name. `1`
   * keeps the single truncated tagline used historically. Higher
   * values (2 or 3) switch to the full `dj.bio` clamped via
   * `line-clamp-N` for a denser editorial subtitle. */
  bioLines?: 1 | 2 | 3;
  /** Typography for the DJ name. `serif` (default) keeps the
   * editorial wedding-magazine treatment used by the existing soft
   * wedding variants. `sans` swaps to Inter to match the standard
   * marketplace card used on `/wedding-djs`. */
  fontStyle?: "serif" | "sans";
  /** When true, render a small "X+ brylluper spillet" expertise row
   * below the rating, derived from the DJ's years of experience and
   * review count. */
  showWeddingsPlayed?: boolean;
  /** When true, the event-type pill row (Bryllup · Fest · …) is
   * omitted entirely. */
  hideEventTypes?: boolean;
  /** When true, hide the orange star glyphs and numeric rating and
   * show only "X anmeldelser" instead. The row still reserves the
   * vertical space the stars would occupy, so a future re-enable does
   * not cause layout shift. */
  hideStarRating?: boolean;
  /** When true, render a small "Svarer typisk inden for X timer"
   * stat under the expertise row. Driven by the DJ's review count
   * via `responseHoursFor`. */
  showResponseTime?: boolean;
  /** When true, the utility-row location shows the DJ's region
   * (e.g. "Tilgængelig i Sjælland") rather than the raw city. */
  showRegion?: boolean;
  /** When true, render a full-width "Se profil →" CTA button at the
   * bottom of the card body, linking to the DJ's profile. */
  showSeeProfileCta?: boolean;
  /** Optional small inclusion lines rendered under the price (e.g.
   * "inkl. 5 timers spilletid", "inkl. mobil disco") to clarify what
   * the starting price covers. */
  priceIncludes?: string[];
  /** Visual treatment for the 3-stat block.
   * - `"default"` (current Clean): icon-badge column grid with thin
   *   amber dividers.
   * - `"banner"`: full-bleed cream-amber band with larger numbers
   *   and an editorial italic label — stats become the visual lead.
   * - `"pills"`: three compact horizontal chips in a single row,
   *   reducing card height and giving a lighter trust signal.
   * - `"inline"`: a single line of plain text with tiny icons —
   *   no chips, no badges. Includes the star rating as a 4th
   *   item so the row stays balanced.
   * - `"grid4"`: 4-column divided grid (rating added as col 1).
   *   Micro icons inline next to values, no badge circles,
   *   smaller everything than the default 3-col grid.
   * - `"rating-lead"`: rating displayed as a small cream-amber
   *   trust chip on the left, followed by 3 compact text stats.
   *   Rating becomes the visual anchor. */
  statStyle?:
    | "default"
    | "banner"
    | "pills"
    | "inline"
    | "grid4"
    | "rating-lead";
  /** Visual treatment for the location + price + inclusion +
   * "Se profil" CTA bracket at the bottom of the card.
   * - `"default"`: utility row (location left / price right),
   *   inclusion fine print right-aligned underneath, full-width
   *   pill CTA below.
   * - `"inline-row"`: single horizontal line with location · price ·
   *   inclusion as a bullet-separated mini-line on the left, and a
   *   compact auto-width pill CTA on the right.
   * - `"price-lead"`: price becomes the visual hero (large serif
   *   centred under the divider). Region + outline CTA on a row
   *   below.
   * - `"cta-bar"`: CTA becomes the visual hero (amber-filled
   *   full-width button with the price embedded inside it).
   *   Region + inclusion sit as a small caption above the CTA. */
  footerStyle?: "default" | "inline-row" | "price-lead" | "cta-bar";
  /** Label rendered inside the "Se profil →" CTA. Defaults to
   * `"Se profil"`. Override to surface a richer affordance such as
   * `"Se profil & bryllupspakker"`. The trailing arrow is added
   * automatically by the renderer. */
  ctaLabel?: string;
  /** Subtle accent retint applied to the stat-row icons and the
   * "Se profil" CTA — and, for `"champagne"`, the card body itself.
   * Defaults to `"default"` (existing rose-gold / amber palette).
   * Other options: `"blush"` (dusty rose), `"sage"` (botanical
   * green), `"champagne"` (warmer luxe). The BryllupsDJ hallmark
   * and editorial grayscale hero stay constant across colourways. */
  colourway?: SoftWeddingColourway;
  /** Visual weight of the "Se profil" CTA. Defaults to `"ghost"`
   * (white bg + faint outline pill — quiet secondary affordance).
   * `"filled"` switches to a warm colour-filled pill (palette-driven)
   * with a slightly darker border, semibold text, and a softer lift
   * shadow — turns the CTA into the visual end-anchor of the card. */
  ctaProminence?: "ghost" | "filled";
  /** Human-formatted availability hint shown next to a compact CTA
   * (e.g. `"d. 14. juni 2025"`). When provided, the default footer
   * collapses its full-width "Se profil" CTA into a flex row: a
   * small green-dot availability line on the left + an auto-width
   * pill button on the right. Intended to reflect a customer-
   * selected event date from the listings page. */
  availabilityDate?: string;
  /** Per-event theme pack that swaps the hallmark badge label/glyph
   * and the played-events stat (`brylluper` → `fødselsdage`,
   * `firmaevents`, `events`) while keeping the card layout,
   * colourway tokens, and editorial hero treatment identical. Defaults
   * to `WEDDING_THEME` so existing callers are unaffected. */
  eventTheme?: EventTheme;
  /** When true, the event hallmark badge (e.g. "BryllupsDJ") is not
   * rendered on the hero at all. Used by the event-neutral homepage
   * card so the design reads as a generic DJ listing without any
   * event-specific tag. */
  hideHallmark?: boolean;
  /** Optional intro-video URL. When provided, a small `[▶]` button
   * appears in the hero's top-right corner; tapping it swaps the
   * hero photo for an autoplaying `<video>` element. When omitted,
   * the video button is hidden and only the picture-button (links
   * to profile) is shown. */
  videoUrl?: string;
  /** Photo treatment above the content body. Defaults to `"carved"`
   * (single hero photo with the circular avatar carved into the
   * lower-middle via a radial mask — the Soft Wedding hallmark).
   * `"triptych"` swaps in the Triptych mosaic: 1 large hero on the
   * left + 3 stacked thumbnails on the right with intro-video play
   * badge + image-count overlay + a small B&W avatar overlapping the
   * seam between the panes. The content body below is identical
   * across both layouts. */
  photoLayout?: "carved" | "triptych";
  /** When set, the card replaces its CTA + availability hint with a
   * small dashed-bordered reason notice (mirroring the global
   * `DJCard` unavailable treatment) and dims the hero. Used by the
   * listings page to render DJs that are booked or don't list the
   * selected event type, without removing them from the grid. */
  unavailable?: { reason: string; subReason?: string } | null;
}) {
  const palette = SOFT_WEDDING_COLOURWAYS[colourway];
  const hero =
    heroOverrides?.[dj.username] ||
    dj.equipment_photos[0]?.url ||
    dj.profile.avatar_url ||
    "";
  const href = djHref(dj, eventTypeId);
  // 4-col and 5-col cards both collapse paddings, fonts, and the
  // avatar to the tighter "compact" set. 5-col gets a few additional
  // tweaks (`ultraCompact`) further below so the inline stat row and
  // hero crop don't feel claustrophobic at the narrowest width.
  const compact = density !== "3";
  const ultraCompact = density === "5";

  // Avatar / notch geometry. The radial-gradient mask carves a half-
  // circle out of the bottom-center of the hero so the avatar drops
  // into a real cutout (not just a circle pasted on top). The notch
  // hugs the avatar with only a hairline ivory gap so the integration
  // feels tight and elegant rather than a halo of empty space.
  const avatarSize = ultraCompact ? 78 : compact ? 90 : 108;
  const notchRadius = avatarSize / 2 + 2;

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
  const isUnavailable = Boolean(unavailable);

  // Hero → video toggle. When `showVideo` is true and the parent
  // supplied a `videoUrl`, the hero `<img>` is replaced with an
  // autoplaying muted `<video>`. The video button itself flips to a
  // close (✕) icon so users can revert to the photo. Disabled when
  // the card is in the `unavailable` state — booked DJs don't
  // get to flaunt their reel.
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();
  const canPlayVideo = Boolean(videoUrl) && !isUnavailable;
  const handleToggleVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canPlayVideo) setShowVideo((v) => !v);
  };
  const handleOpenProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUnavailable) navigate(href);
  };

  /** Two small chip-style action buttons rendered in the hero's
   * top-right corner, mirroring the hallmark badge on the top-left.
   * Visual treatment matches the Coral Grid "Video" / "Setup" chips
   * from `/wedding-djs-stacked-b-explore` variant 06 — rectangular
   * `rounded-md` pills, slate border, icon + label, white body with
   * backdrop-blur so they stay readable over varied hero photos.
   * The left chip toggles video playback in place of the hero
   * photo; the right chip navigates to the DJ's profile. Both stop
   * click propagation so the surrounding hero `<Link>` doesn't
   * double-navigate. */
  const renderHeroActions = (opts: { position: "carved" | "triptych" }) => {
    const iconSize = compact ? "h-3 w-3" : "h-3 w-3";
    const chipClass = cn(
      "inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white/95 px-1.5 py-1 font-medium text-slate-700 shadow-sm backdrop-blur transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
      compact ? "text-[10px]" : "text-[10.5px]",
    );
    const wrapPos =
      opts.position === "triptych"
        ? "absolute right-2 top-2"
        : "absolute right-3 top-3";
    return (
      <div className={cn(wrapPos, "z-10 inline-flex items-center gap-1.5")}>
        {canPlayVideo && (
          <button
            type="button"
            aria-label={showVideo ? "Skjul video" : "Afspil introvideo"}
            title={showVideo ? "Skjul video" : "Afspil introvideo"}
            onClick={handleToggleVideo}
            className={chipClass}
          >
            {showVideo ? (
              <X className={iconSize} strokeWidth={2.25} />
            ) : (
              <Play className={iconSize} strokeWidth={2} />
            )}
            {showVideo ? "Skjul" : "Video"}
          </button>
        )}
        <button
          type="button"
          aria-label="Se billeder & profil"
          title="Se billeder & profil"
          onClick={handleOpenProfile}
          className={chipClass}
        >
          <Images className={iconSize} strokeWidth={2} />
          Billeder
        </button>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md",
        hideHallmark ? "border-slate-200/80" : "border-amber-100/70",
        palette.cardBg,
        // Muted treatment for booked / non-matching DJs. Mirrors the
        // standard `DJCard` unavailable language: dashed border, soft
        // wash, and content opacity — the dashed reason banner that
        // replaces the CTA tells the user why.
        isUnavailable && "border-dashed bg-muted/30",
      )}
    >
      {/* Hero. Two layouts: the default `"carved"` is a single hero
          photo with the circular avatar carved into its lower edge
          via a radial mask. The `"triptych"` layout swaps in the V21
          mosaic — 1 hero + 3 stacked thumbnails + intro-video play
          badge + image-count overlay + a small B&W avatar overlapping
          the seam between panes. The BryllupsDJ hallmark sits in the
          same top-left position in both. */}
      {photoLayout === "triptych" && (
        <div className={cn("relative w-full pb-0", compact ? "p-2" : "p-3")}>
          <div
            className={cn(
              "grid grid-cols-[1.55fr_1fr]",
              compact ? "gap-1" : "gap-1.5",
            )}
          >
            {/* Hero (left, 3:4) */}
            <Link
              to={href}
              className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-amber-50"
            >
              {showVideo && videoUrl ? (
                <video
                  src={videoUrl}
                  className="absolute inset-0 h-full w-full bg-black object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                hero && (
                  <img
                    src={hero}
                    alt={dj.stage_name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{
                      filter:
                        [
                          tintFilter(tint),
                          grayscaleFilter(heroGrayscale),
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined,
                    }}
                    loading="lazy"
                  />
                )
              )}
              <TintOverlay tint={tint} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {/* Event-tailored hallmark — same cream/amber pill as the
                  carved layout, just sized down a touch to suit the
                  narrower triptych hero. Label + glyph swap per
                  `eventTheme` (BryllupsDJ / FødselsdagsDJ /
                  FirmaDJ / EventDJ). */}
              {!hideHallmark && (
                <span
                  className={cn(
                    "absolute left-2 top-2 inline-flex items-center rounded-full bg-white/95 font-sans font-medium uppercase text-slate-900 shadow-sm ring-1 ring-amber-200/80 backdrop-blur-sm",
                    compact
                      ? "gap-1 px-2 py-0.5 text-[9px] tracking-[0.12em]"
                      : "gap-1 px-2.5 py-1 text-[10px] tracking-[0.14em]",
                  )}
                >
                  <eventTheme.HallmarkIcon
                    className={compact ? "h-2.5 w-[18px]" : "h-3 w-[20px]"}
                  />
                  {eventTheme.hallmarkLabel}
                </span>
              )}
              {/* Video + picture action buttons — top-right of the
                  hero, mirroring the hallmark on the top-left. */}
              {renderHeroActions({ position: "triptych" })}
            </Link>
            {/* Three stacked thumbnails on the right. The wrapper is a
                relative grid item that stretches to the row's height
                (locked by the hero's 3:4 aspect); the inner absolute
                grid divides that height into three equal rows so the
                thumbs never inflate the row taller than the hero. */}
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 grid grid-rows-3",
                  compact ? "gap-1" : "gap-1.5",
                )}
              >
                {[1, 2, 3].map((idx) => {
                  const thumbs = thumbnailsFor(dj, 4);
                  const photoCount = photoCountFor(dj);
                  const src = thumbs[idx];
                  const isLast = idx === 3;
                  return (
                    <Link
                      key={idx}
                      to={href}
                      className="relative block w-full overflow-hidden rounded-lg bg-amber-50"
                    >
                      {src && (
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{
                            filter:
                              grayscaleFilter(heroGrayscale) || undefined,
                          }}
                          loading="lazy"
                        />
                      )}
                      {isLast && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[12px] font-semibold text-white">
                          +{Math.max(photoCount - 4, 1)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Favourite heart, top-right of the mosaic frame. */}
          <button
            type="button"
            aria-label="Tilf\u00f8j til favoritter"
            className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
          {/* Small B&W avatar overlapping the seam between hero and
              thumbnails. Card body bg is read into the ring so the
              avatar feels carved into the frame regardless of
              colourway. */}
          <span
            className={cn(
              "absolute left-1/2 block -translate-x-1/2 overflow-hidden rounded-full ring-2",
              colourway === "champagne" ? "ring-[#fcfaf6]" : "ring-white",
              compact ? "bottom-[-16px] h-10 w-10" : "bottom-[-18px] h-11 w-11",
            )}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
          >
            {dj.profile.avatar_url ? (
              <img
                src={dj.profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  filter: "grayscale(100%) contrast(1.1)",
                }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-700 text-[11px] font-bold text-white">
                {(dj.profile.full_name || dj.stage_name)
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </span>
        </div>
      )}
      {/* Hero with soft tint + carved notch for the avatar */}
      {photoLayout === "carved" && (
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
          {showVideo && videoUrl ? (
            <video
              src={videoUrl}
              className="absolute inset-0 h-full w-full bg-black object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            hero && (
              <img
                src={hero}
                alt={dj.stage_name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                  isUnavailable && "grayscale",
                )}
                style={{
                  filter:
                    [tintFilter(tint), grayscaleFilter(heroGrayscale)]
                      .filter(Boolean)
                      .join(" ") || undefined,
                }}
                loading="lazy"
              />
            )
          )}
          {/* Warm wedding-tone overlays. Driven entirely by the tint
              mode; `none` leaves the photo alone. */}
          <TintOverlay tint={tint} />
          {tint !== "none" && !WEDDING_TINTS.includes(tint) && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
          )}
          {isUnavailable && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-white/55" />
              <div className="pointer-events-none absolute inset-x-0 top-1/3 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-md">
                  <CalendarX2 className="h-3.5 w-3.5" />
                  Ikke ledig
                </span>
              </div>
            </>
          )}
        </Link>

        {/* Event-tailored hallmark badge. Single editorial trust
            mark, top-left. Cream backdrop + thin amber ring keeps it
            premium / wedding-magazine rather than marketplace-tag-y.
            Label + glyph swap per `eventTheme`. */}
        {!hideHallmark && (
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 font-sans font-medium uppercase text-slate-900 shadow-sm ring-1 ring-amber-200/80 backdrop-blur-sm",
              compact
                ? "gap-1 px-2.5 py-1 text-[9.5px] tracking-[0.12em]"
                : "gap-1.5 px-3 py-1 text-[10.5px] tracking-[0.14em]",
            )}
          >
            <eventTheme.HallmarkIcon
              className={compact ? "h-3 w-[20px]" : "h-3.5 w-[22px]"}
            />
            {eventTheme.hallmarkLabel}
          </span>
        )}

        {/* Video + picture action buttons — top-right of the hero,
            mirroring the hallmark on the top-left. */}
        {renderHeroActions({ position: "carved" })}

        {/* Carved-in avatar. Positioned so its centre sits exactly on
            the hero's bottom edge — the upper half drops into the
            notched cutout, the lower half spills into the content
            area below. We position with `left: 50%` + negative
            `marginLeft` rather than `transform: translateX(-50%)` so
            the avatar isn't promoted to a separate GPU layer, which
            was softening the image when combined with the avatar's
            CSS filters. Ring trimmed to 2 px for a sharper edge. */}
        <span
          className="absolute left-1/2 block overflow-hidden rounded-full bg-white ring-2 ring-white"
          style={{
            width: avatarSize,
            height: avatarSize,
            bottom: -avatarSize / 2,
            marginLeft: -avatarSize / 2,
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
              style={{
                imageRendering: "auto",
                filter: grayscaleFilter(avatarGrayscale) || undefined,
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-slate-700 text-base font-bold text-white">
              {(dj.profile.full_name || dj.stage_name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
      </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          palette.cardBg,
          ultraCompact ? "px-3 pb-3" : compact ? "px-4 pb-4" : "px-5 pb-5",
        )}
        style={{
          // Carved layout: clear the half of the avatar that spills
          // into the content area. Triptych layout: the small B&W
          // avatar overlaps the seam (a few px into the content), so
          // we just need a small clearance — no avatarSize math.
          paddingTop:
            photoLayout === "triptych"
              ? compact ? 24 : 28
              : avatarSize / 2 + (compact ? 10 : 14),
        }}
      >
        {/* Name + subtitle */}
        <h3
          className={cn(
            "truncate text-center font-semibold leading-tight text-slate-900",
            fontStyle === "serif"
              ? "font-serif tracking-tight"
              : "font-sans tracking-normal",
            ultraCompact ? "text-[17.5px]" : compact ? "text-[19px]" : "text-[22px]",
          )}
        >
          <Link to={href} className="hover:underline">
            {dj.stage_name}
          </Link>
        </h3>
        {(() => {
          // Show 1 line of `tagline` (historical default) or N lines
          // of the longer `bio` field when bioLines >= 2.
          const text = bioLines > 1 ? dj.bio || dj.tagline : dj.tagline;
          if (!text) return null;
          const clamp =
            bioLines === 1
              ? "truncate"
              : bioLines === 2
                ? "line-clamp-2"
                : "line-clamp-3";
          return (
            <p
              className={cn(
                "mt-1 text-center leading-snug text-slate-500",
                clamp,
                compact ? "text-[11.5px]" : "text-[12.5px]",
              )}
            >
              {text}
            </p>
          );
        })()}

        {/* Rating row. Only rendered when stars are shown; when
            `hideStarRating` is true the row is omitted entirely
            because the verified-reviews count lives inside the 3-stat
            block below instead. */}
        {!hideStarRating && (
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
        )}

        {/* Three-stat block. Three visual treatments selected by
         * `statStyle`:
         *   - "default": icon-badge column grid with thin amber
         *     dividers (the original Clean look).
         *   - "banner":  full-bleed cream-amber band with larger
         *     numbers and italic editorial labels — stats become the
         *     visual lead under the bio.
         *   - "pills":   three compact horizontal chips in a single
         *     row — same data, lighter footprint. */}
        {showWeddingsPlayed &&
          (() => {
            const playedValue = eventTheme.playedCount(dj);
            const years = dj.years_experience;
            const PlayedIcon = eventTheme.PlayedIcon;
            const stats: Array<{
              icon: React.ReactNode;
              value: string;
              label: string;
            }> = [
              {
                icon: (
                  <BadgeCheck
                    className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
                    style={{ fill: palette.accent, color: "#fff" }}
                    strokeWidth={2}
                  />
                ),
                value: `${ratingCount}`,
                label: "anmeldelser",
              },
              {
                icon: (
                  <PlayedIcon
                    className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
                    stroke={palette.accent}
                  />
                ),
                value: playedValue !== null ? `${playedValue}+` : "—",
                label: eventTheme.playedLabel,
              },
              {
                icon: (
                  <Clock
                    className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
                    style={{ color: palette.accent }}
                    strokeWidth={1.75}
                  />
                ),
                value: years || "—",
                label: "års erfaring",
              },
            ];

            if (statStyle === "banner") {
              // Full-bleed cream-amber banner. Negative horizontal
              // margins cancel the card's content padding so the
              // banner runs edge-to-edge. Larger numbers + italic
              // labels make stats the dominant visual under the bio.
              return (
                <div
                  className={cn(
                    "grid grid-cols-3 items-center bg-gradient-to-b from-[#fdf8ec] to-[#f9efd9]",
                    compact
                      ? "-mx-4 mt-4 px-3 py-3"
                      : "-mx-5 mt-5 px-4 py-4",
                  )}
                >
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className={cn(
                        "flex flex-col items-center gap-0.5 text-center",
                        i > 0 && "border-l border-amber-200/70",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center justify-center text-[#b8884a]",
                          compact ? "mb-0.5 h-3" : "mb-1 h-3.5",
                        )}
                      >
                        {s.icon}
                      </span>
                      <span
                        className={cn(
                          "font-serif font-semibold leading-none text-slate-900",
                          compact ? "text-[18px]" : "text-[20px]",
                        )}
                      >
                        {s.value}
                      </span>
                      <span
                        className={cn(
                          "font-serif italic text-slate-500",
                          compact ? "text-[10.5px]" : "text-[11.5px]",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            if (statStyle === "pills") {
              // Three compact horizontal chips on a single row.
              // Lighter trust signal, less vertical space than the
              // grid block. Wraps to two rows in 4-col where space
              // is tighter rather than overflowing.
              return (
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-center gap-1.5",
                    compact ? "mt-2.5" : "mt-3",
                  )}
                >
                  {stats.map((s) => (
                    <span
                      key={s.label}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-[#fdfaf3] text-slate-700",
                        compact
                          ? "px-2 py-1 text-[10.5px]"
                          : "px-2.5 py-1 text-[11.5px]",
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
              );
            }

            if (statStyle === "inline") {
              // Single text line: tiny icons + bold values + grey
              // labels separated by thin slate-300 bullets. No chips,
              // no badges, no padding boxes. The 4th item is a
              // value-less equipment claim ("Professionelt DJ
              // Udstyr") rather than the star rating — it reads as a
              // trust signal of its own without needing a number.
              const equipmentItem: {
                icon: React.ReactNode;
                value?: string;
                label: string;
              } = {
                icon: (
                  <Disc3
                    className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
                    style={{ color: palette.accent }}
                    strokeWidth={1.75}
                    aria-label="Professionelt DJ Udstyr"
                  />
                ),
                // Shortened label so it sits in the same weight
                // class as the numeric stats. Full string lives in
                // the icon's aria-label / title for accessibility.
                label: "Pro DJ-udstyr",
              };
              const inlineItems: Array<{
                icon: React.ReactNode;
                value?: string;
                label: string;
              }> = [...stats, equipmentItem];
              return (
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
                    compact ? "mt-2.5" : "mt-3",
                    compact ? "text-[10.5px]" : "text-[11.5px]",
                  )}
                >
                  {inlineItems.map((s, i) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1 text-slate-600"
                    >
                      {i > 0 && (
                        <span
                          aria-hidden="true"
                          className="text-slate-300"
                        >
                          ·
                        </span>
                      )}
                      <span className="inline-flex items-center">
                        {s.icon}
                      </span>
                      {s.value && (
                        <span className="font-semibold text-slate-900">
                          {s.value}
                        </span>
                      )}
                      <span
                        className={cn(
                          s.value ? "text-slate-500" : "text-slate-700",
                        )}
                      >
                        {s.label}
                      </span>
                    </span>
                  ))}
                </div>
              );
            }

            if (statStyle === "grid4") {
              // 4-column divided grid. Column 1 is a value-less
              // equipment claim (Disc3 + "Pro DJ-udstyr"); the
              // other 3 columns show micro icon + bold value +
              // caption. To keep the row vertically aligned, the
              // equipment cell renders a small rose-gold dot in
              // place of the missing numeric value so all four
              // cells take the same height.
              const grid4Items: Array<{
                icon: React.ReactNode;
                value?: string;
                label: string;
              }> = [
                {
                  icon: (
                    <Disc3
                      className={cn(
                        compact ? "h-2.5 w-2.5" : "h-3 w-3",
                        "text-[#b8884a]",
                      )}
                      strokeWidth={1.75}
                      aria-label="Professionelt DJ Udstyr"
                    />
                  ),
                  label: "Pro DJ-udstyr",
                },
                ...stats,
              ];
              return (
                <div
                  className={cn(
                    "grid grid-cols-4 divide-x divide-amber-100",
                    compact ? "mt-2" : "mt-2.5",
                  )}
                >
                  {grid4Items.map((s) => (
                    <div
                      key={s.label}
                      className={cn(
                        "flex flex-col items-center gap-0.5 text-center",
                        compact ? "px-0.5" : "px-1",
                      )}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        <span className="inline-flex items-center">
                          {s.icon}
                        </span>
                        {s.value ? (
                          <span
                            className={cn(
                              "font-semibold leading-none text-slate-900",
                              compact ? "text-[12px]" : "text-[13.5px]",
                            )}
                          >
                            {s.value}
                          </span>
                        ) : (
                          // Visual placeholder for the missing
                          // numeric value so the cell height
                          // matches the other three columns.
                          <span
                            aria-hidden="true"
                            className={cn(
                              "inline-block rounded-full bg-[#b8884a]",
                              compact ? "h-1 w-1" : "h-1.5 w-1.5",
                            )}
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          "leading-tight text-slate-500",
                          compact ? "text-[9px]" : "text-[10px]",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            if (statStyle === "rating-lead") {
              // Asymmetric: a cream-amber "trust chip" on the left,
              // followed by 3 supporting stats as compact text on
              // the right. The lead chip now carries the equipment
              // claim (Disc3 + "Pro DJ-udstyr") rather than the
              // star rating — a categorical claim is a stronger
              // anchor than a numeric score when the 3 supporting
              // stats are themselves numeric.
              return (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    compact ? "mt-2.5" : "mt-3",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-200 bg-[#fdf8ec]",
                      compact ? "px-2 py-1" : "px-2.5 py-1.5",
                    )}
                    title="Professionelt DJ Udstyr"
                  >
                    <Disc3
                      className={cn(
                        "text-[#b8884a]",
                        compact ? "h-3 w-3" : "h-3.5 w-3.5",
                      )}
                      strokeWidth={1.75}
                    />
                    <span
                      className={cn(
                        "font-semibold leading-none text-slate-900",
                        compact ? "text-[11.5px]" : "text-[12.5px]",
                      )}
                    >
                      Pro DJ-udstyr
                    </span>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
                    {stats.map((s, i) => (
                      <span
                        key={s.label}
                        className={cn(
                          "inline-flex items-center gap-1 text-slate-600",
                          compact ? "text-[10.5px]" : "text-[11.5px]",
                        )}
                      >
                        {i > 0 && (
                          <span
                            aria-hidden="true"
                            className="text-slate-300"
                          >
                            ·
                          </span>
                        )}
                        <span className="inline-flex items-center">
                          {s.icon}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {s.value}
                        </span>
                        <span className="text-slate-500">
                          {s.label}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            // Default — icon-badge grid with thin amber dividers.
            // Tightened one notch from the previous rhythm so the
            // row reads as a compact stat strip rather than a
            // standalone block.
            const badgeSize = compact ? "h-4 w-4" : "h-5 w-5";
            const valueSize = compact ? "text-[12px]" : "text-[14px]";
            const labelSize = compact ? "text-[9.5px]" : "text-[10.5px]";
            return (
              <div
                className={cn(
                  "grid grid-cols-3 divide-x divide-amber-100",
                  compact ? "mt-2" : "mt-2.5",
                )}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex flex-col items-center justify-start gap-0.5 text-center",
                      compact ? "px-0.5" : "px-1.5",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100",
                        badgeSize,
                      )}
                    >
                      {s.icon}
                    </span>
                    <span
                      className={cn(
                        "font-semibold leading-none text-slate-900",
                        valueSize,
                      )}
                    >
                      {s.value}
                    </span>
                    <span
                      className={cn(
                        "leading-none text-slate-500",
                        labelSize,
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

        {/* Event-type pill tags */}
        {!hideEventTypes && tagList.length > 0 && (
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

        {/* Footer bracket — location + price + inclusion + CTA.
            Visual treatment selected by `footerStyle`. */}
        {(() => {
          const locationText = showRegion
            ? `Kører i hele ${regionFor(dj)}`
            : dj.base_location;
          const priceText = priceFromLabel(dj);
          const inclusion =
            priceIncludes && priceIncludes.length > 0
              ? priceIncludes.join(" · ")
              : null;

          if (footerStyle === "inline-row") {
            // Single horizontal line: location · price · inclusion
            // on the left, compact auto-width pill CTA on the right.
            return (
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-t border-slate-100",
                  compact ? "mt-4 pt-3" : "mt-5 pt-4",
                )}
              >
                <div
                  className={cn(
                    "inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-600",
                    compact ? "text-[11px]" : "text-[11.5px]",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{locationText}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="whitespace-nowrap font-semibold text-slate-900">
                    {priceText}
                  </span>
                  {inclusion && (
                    <>
                      <span
                        aria-hidden="true"
                        className="text-slate-300"
                      >
                        ·
                      </span>
                      <span className="text-slate-500">{inclusion}</span>
                    </>
                  )}
                </div>
                {showSeeProfileCta && (
                  <Link
                    to={href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50",
                      compact
                        ? "px-2.5 py-1 text-[11px]"
                        : "px-3 py-1.5 text-[12px]",
                    )}
                  >
                    {ctaLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            );
          }

          if (footerStyle === "price-lead") {
            // Price is the visual hero — large centred serif under
            // the divider, with the inclusion as a small caption
            // beneath. Below it: a row with the region on the left
            // and a slimmer outline CTA on the right.
            return (
              <div
                className={cn(
                  "border-t border-slate-100",
                  compact ? "mt-4 pt-3" : "mt-5 pt-4",
                )}
              >
                <div className="text-center">
                  <div
                    className={cn(
                      "font-serif font-semibold leading-none text-slate-900",
                      compact ? "text-[22px]" : "text-[26px]",
                    )}
                  >
                    {priceText}
                  </div>
                  {inclusion && (
                    <div
                      className={cn(
                        "leading-tight text-slate-500",
                        compact ? "mt-1 text-[10.5px]" : "mt-1.5 text-[11.5px]",
                      )}
                    >
                      {inclusion}
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between gap-3",
                    compact ? "mt-3" : "mt-4",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex min-w-0 items-center gap-1.5 text-slate-600",
                      compact ? "text-[11.5px]" : "text-[12px]",
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{locationText}</span>
                  </span>
                  {showSeeProfileCta && (
                    <Link
                      to={href}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50",
                        compact
                          ? "px-3 py-1 text-[11.5px]"
                          : "px-3.5 py-1.5 text-[12.5px]",
                      )}
                    >
                      {ctaLabel}
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          }

          if (footerStyle === "cta-bar") {
            // CTA is the visual hero — amber-filled full-width
            // button with the price embedded inside it. The region
            // + inclusion sit above the button as a small caption.
            return (
              <div
                className={cn(
                  "border-t border-slate-100",
                  compact ? "mt-4 pt-3" : "mt-5 pt-4",
                )}
              >
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center text-slate-500",
                    compact ? "text-[10.5px]" : "text-[11px]",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{locationText}</span>
                  </span>
                  {inclusion && (
                    <>
                      <span
                        aria-hidden="true"
                        className="text-slate-300"
                      >
                        ·
                      </span>
                      <span>{inclusion}</span>
                    </>
                  )}
                </div>
                {showSeeProfileCta && (
                  <Link
                    to={href}
                    className={cn(
                      "mt-2 inline-flex w-full items-center justify-between gap-2 rounded-full border border-amber-300 bg-[#f7e6c2] font-semibold text-slate-900 shadow-sm transition-colors hover:bg-[#f3dca6]",
                      compact
                        ? "px-3.5 py-2 text-[12.5px]"
                        : "px-4 py-2.5 text-[13.5px]",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {ctaLabel}
                      <span
                        aria-hidden="true"
                        className="text-slate-400"
                      >
                        ·
                      </span>
                      <span className="font-semibold text-slate-900">
                        {priceText}
                      </span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            );
          }

          // Default — Clean footer (location/price row, inclusion
          // fine print, full-width pill CTA). Location text is
          // intentionally smaller than the price so the price
          // anchors the row, and the inclusion line is pulled flush
          // under the price so it reads as the price's subtitle.
          return (
            <>
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-t border-slate-100",
                  compact ? "mt-4 pt-3" : "mt-5 pt-4",
                )}
              >
                <span
                  className={cn(
                    "inline-flex min-w-0 items-center gap-1 text-slate-600",
                    compact ? "text-[11px]" : "text-[11.5px]",
                  )}
                >
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{locationText}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap font-semibold text-slate-900",
                    compact ? "text-[13px]" : "text-[14px]",
                  )}
                >
                  {priceText}
                </span>
              </div>

              {priceIncludes && priceIncludes.length > 0 && (
                <div
                  className={cn(
                    "text-right",
                    compact ? "mt-0" : "mt-0.5",
                  )}
                >
                  {priceIncludes.map((line) => (
                    <span
                      key={line}
                      className={cn(
                        "block leading-none text-slate-500",
                        compact ? "text-[10px]" : "text-[10.5px]",
                      )}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}

              {showSeeProfileCta && unavailable ? (
                // Unavailable treatment: replace the availability hint
                // and CTA with a small dashed reason banner so the DJ
                // still appears in the grid but the action is muted.
                <div
                  className={cn(
                    "rounded-md border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 text-slate-700",
                    compact ? "mt-3 text-[11.5px]" : "mt-4 text-[12px]",
                  )}
                >
                  <span className="font-medium text-slate-900">{unavailable.reason}</span>
                  {unavailable.subReason && (
                    <span className="ml-1 text-slate-500">· {unavailable.subReason}</span>
                  )}
                </div>
              ) : showSeeProfileCta ? (
                <>
                  {availabilityDate && (
                    // Availability caption sits as a small grey line on
                    // its own, immediately above the full-width CTA, so
                    // the button can claim the entire row at a larger
                    // size again.
                    <div
                      className={cn(
                        "flex items-center justify-center gap-1.5 text-slate-600",
                        compact ? "mt-3 text-[11.5px]" : "mt-3.5 text-[12px]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                      />
                      <span className="truncate">
                        Åben {availabilityDate}
                      </span>
                    </div>
                  )}
                  <Link
                    to={href}
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-1.5 rounded-full border text-slate-900 transition-colors",
                      // Slight separation between the availability
                      // caption and the button when the caption is
                      // shown; full top margin otherwise.
                      availabilityDate ? "mt-1.5" : "mt-4",
                      ctaProminence === "filled"
                        ? cn(
                            // Filled treatment: warm palette-driven
                            // fill, slightly darker border, semibold
                            // text + more padding + softer lift shadow
                            // so it reads as the visual end-anchor of
                            // the card. When the active event theme
                            // provides a `ctaTokens` override (used by
                            // birthday / corporate / other), those
                            // tokens win over the colourway palette —
                            // so non-wedding pages can break out of
                            // the rose-gold family for the CTA without
                            // touching the rest of the card.
                            "font-semibold shadow-md",
                            eventTheme.ctaTokens?.bg ?? palette.ctaFilledBg,
                            eventTheme.ctaTokens?.border ?? palette.ctaFilledBorder,
                            eventTheme.ctaTokens?.hover ?? palette.ctaFilledHover,
                            eventTheme.ctaTokens?.text,
                            compact ? "py-3 text-[13.5px]" : "py-3.5 text-[14.5px]",
                          )
                        : cn(
                            "bg-white font-medium shadow-sm",
                            palette.ctaBorder,
                            palette.ctaHover,
                            compact ? "py-2.5 text-[13px]" : "py-3 text-[13.5px]",
                          ),
                    )}
                  >
                    {ctaLabel} <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : null}
            </>
          );
        })()}

        {/* Typical response-time — small reassurance line beneath the
         * CTA so it sits last, after the user has seen the price and
         * the action. */}
        {showResponseTime && (
          <div
            className={cn(
              "flex items-center justify-center gap-1.5 text-slate-500",
              compact ? "mt-2 text-[11px]" : "mt-2.5 text-[11.5px]",
            )}
          >
            <MessageCircle
              className={cn(
                "text-[#b8884a]",
                compact ? "h-3 w-3" : "h-3.5 w-3.5",
              )}
              strokeWidth={1.75}
            />
            <span>Svarer typisk inden for {responseHoursFor(dj)} timer</span>
          </div>
        )}
      </div>
    </Card>
  );
}
