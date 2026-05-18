import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock,
  Disc3,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  djHref,
  eventTypesLine,
  priceFromLabel,
} from "./shared";

/** Wedding-rings glyph for the BryllupsDJ badge — two slightly-
 * overlapping outline rings in warm champagne / rose-gold. Drawn as
 * inline SVG because lucide-react does not include this symbol. */
export function WeddingRings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 16"
      fill="none"
      stroke="#b8884a"
      strokeWidth={1.5}
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="5.25" />
      <circle cx="17" cy="9" r="5.25" />
    </svg>
  );
}

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
 * read. Returns `null` when we don't have enough signal. */
export function weddingsPlayedFor(dj: DJProfileWithRelations): number | null {
  const base: Record<string, number> = {
    "10+": 200,
    "5-10": 95,
    "3-5": 45,
    "1-3": 18,
  };
  const seed = base[dj.years_experience];
  if (seed === undefined) return null;
  const bumped = seed + Math.floor((dj.rating_count ?? 0) * 1.4);
  return Math.max(20, Math.round(bumped / 10) * 10);
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
}: {
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  density?: "3" | "4";
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
}) {
  const hero =
    heroOverrides?.[dj.id] ||
    dj.equipment_photos[0]?.url ||
    dj.profile.avatar_url ||
    "";
  const href = djHref(dj, eventTypeId);
  const compact = density === "4";

  // Avatar / notch geometry. The radial-gradient mask carves a half-
  // circle out of the bottom-center of the hero so the avatar drops
  // into a real cutout (not just a circle pasted on top). The notch
  // hugs the avatar with only a hairline ivory gap so the integration
  // feels tight and elegant rather than a halo of empty space.
  const avatarSize = compact ? 90 : 108;
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
                  [tintFilter(tint), grayscaleFilter(heroGrayscale)]
                    .filter(Boolean)
                    .join(" ") || undefined,
              }}
              loading="lazy"
            />
          )}
          {/* Warm wedding-tone overlays. Driven entirely by the tint
              mode; `none` leaves the photo alone. */}
          <TintOverlay tint={tint} />
          {tint !== "none" && !WEDDING_TINTS.includes(tint) && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
          )}
        </Link>

        {/* BryllupsDJ badge. Single editorial trust mark, top-
            left. Cream backdrop + thin amber ring + serif italic deep-
            navy text keeps it premium / wedding-magazine rather than
            marketplace-tag-y. */}
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
            "truncate text-center font-semibold leading-tight text-slate-900",
            fontStyle === "serif"
              ? "font-serif tracking-tight"
              : "font-sans tracking-normal",
            compact ? "text-[19px]" : "text-[22px]",
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
            const weddings = weddingsPlayedFor(dj);
            const years = dj.years_experience;
            const stats: Array<{
              icon: React.ReactNode;
              value: string;
              label: string;
            }> = [
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
                  <WeddingRings
                    className={compact ? "h-2.5 w-2.5" : "h-3 w-3"}
                  />
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
                    className={cn(
                      compact ? "h-2.5 w-2.5" : "h-3 w-3",
                      "text-[#b8884a]",
                    )}
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
            const badgeSize = compact ? "h-5 w-5" : "h-6 w-6";
            const valueSize = compact ? "text-[13.5px]" : "text-[15.5px]";
            const labelSize = compact ? "text-[10px]" : "text-[11px]";
            return (
              <div
                className={cn(
                  "grid grid-cols-3 divide-x divide-amber-100",
                  compact ? "mt-2.5" : "mt-3",
                )}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex flex-col items-center justify-start gap-1 text-center",
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
                    <span className={cn("text-slate-500", labelSize)}>
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
                    Se profil
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
                      Se profil
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
                      Se profil
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

          // Default — existing Clean footer (location/price row,
          // inclusion fine print, full-width pill CTA).
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
                    "inline-flex min-w-0 items-center gap-1.5 text-slate-600",
                    compact ? "text-[12px]" : "text-[12.5px]",
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
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
                    compact ? "mt-1" : "mt-1.5",
                  )}
                >
                  {priceIncludes.map((line) => (
                    <span
                      key={line}
                      className={cn(
                        "block leading-tight text-slate-500",
                        compact ? "text-[10px]" : "text-[10.5px]",
                      )}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}

              {showSeeProfileCta && (
                <Link
                  to={href}
                  className={cn(
                    "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-white font-medium text-slate-900 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50",
                    compact ? "py-2 text-[12.5px]" : "py-2.5 text-[13px]",
                  )}
                >
                  Se profil <span aria-hidden="true">→</span>
                </Link>
              )}
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
