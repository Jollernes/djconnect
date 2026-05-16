import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV17Arch } from "@/components/event-djs/grid/V17Arch";
import { GridCardV18Diagonal } from "@/components/event-djs/grid/V18Diagonal";
import { GridCardV19Wave } from "@/components/event-djs/grid/V19Wave";
import { GridCardV20Corner } from "@/components/event-djs/grid/V20Corner";
import { GridCardV21Triptych } from "@/components/event-djs/grid/V21Triptych";
import { GridCardV22DiagonalRight } from "@/components/event-djs/grid/V22DiagonalRight";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const config = EVENT_LISTING_CONFIG.wedding;

type VariantId =
  | "arch"
  | "diagonal"
  | "wave"
  | "corner"
  | "triptych"
  | "diagonal-right"
  | "soft-wedding-clean"
  | "soft-wedding-light"
  | "soft-wedding-airy"
  | "soft-wedding-warm"
  | "soft-wedding-fineart"
  | "soft-wedding-grade-film"
  | "soft-wedding-grade-warmbias"
  | "soft-wedding-grade-matte"
  | "soft-wedding-clean-inter";
type Density = "3" | "4";

type Variant = {
  id: VariantId;
  label: string;
  blurb: string;
  count3: number;
  count4: number;
  render: (dj: DJProfileWithRelations, density: Density) => ReactElement;
};

const COLS_3 = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
const COLS_4 = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const VARIANTS: Variant[] = [
  {
    id: "arch",
    label: "Arch",
    blurb:
      "Chapel-arch image mask · image counter pill · B&W avatar bottom-left of image · compact thumbnail strip beneath.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV17Arch dj={dj} eventTypeId={config.id} density={density} />
    ),
  },
  {
    id: "diagonal",
    label: "Diagonal",
    blurb:
      "Diagonal slash image mask · coral 'Introvideo 1:00' pill · stacked mini-gallery cascading in the open diagonal corner.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV18Diagonal dj={dj} eventTypeId={config.id} density={density} />
    ),
  },
  {
    id: "wave",
    label: "Wave",
    blurb:
      "Wave-cut bottom edge (SVG clipPath) · B&W avatar itself functions as the intro video with a coral play overlay · compact Foto/Video/Setlist media tabs.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV19Wave dj={dj} eventTypeId={config.id} density={density} />
    ),
  },
  {
    id: "corner",
    label: "Corner",
    blurb:
      "Asymmetric top-right corner cut creating a pentagon image · '+N fotos' counter pill · 3-square thumbnail column sits next to the lockup at 3-per-row (hidden at 4-per-row to keep cards uncluttered).",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV20Corner dj={dj} eventTypeId={config.id} density={density} />
    ),
  },
  {
    id: "triptych",
    label: "Triptych",
    blurb:
      "1 hero + 3 stacked thumbnails as a mosaic · intro-video play badge on the hero · '+N' image counter on the bottom thumbnail · B&W avatar overlapping the seam.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV21Triptych dj={dj} eventTypeId={config.id} density={density} />
    ),
  },
  {
    id: "diagonal-right",
    label: "Diagonal · Right",
    blurb:
      "Variant 6 — same diagonal slash mask as Diagonal, but the coral intro-video pill is removed and the stacked mini-gallery sits in the open diagonal corner on the bottom-right (cascading right-to-left into the cut).",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV22DiagonalRight
        dj={dj}
        eventTypeId={config.id}
        density={density}
      />
    ),
  },
  {
    id: "soft-wedding-clean-inter",
    label: "Soft Wedding · Clean · Inter",
    blurb:
      "Variant 7a-Inter — identical to Soft Wedding · Clean (hero grayscale 60 %, colour avatar, 3-line bio, BryllupsDJ badge) but the DJ name swaps from font-serif tracking-tight to font-sans tracking-normal — i.e. Inter, the same font used by the standard marketplace DJ card on /wedding-djs.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="none"
        heroGrayscale={60}
        avatarGrayscale={false}
        bioLines={3}
        fontStyle="sans"
      />
    ),
  },
  {
    id: "soft-wedding-clean",
    label: "Soft Wedding · Clean",
    blurb:
      "Variant 7a — same premium marketplace card with the elegant BryllupsDJ badge and the circular avatar carved into the lower-middle of the hero. The hero photo is rendered with a 60 % grayscale wash for a calmer monochrome backdrop, the avatar keeps its original colours, the bio expands to a 3-line summary, the event-type pills are hidden, and a small rose-gold \"X+ brylluper spillet\" row sits under the rating to emphasise wedding expertise.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="none"
        heroGrayscale={60}
        avatarGrayscale={false}
        bioLines={3}
        showWeddingsPlayed
        hideEventTypes
        priceIncludes={[
          "inkl. 5 timers spilletid",
          "inkl. mobil disco",
        ]}
      />
    ),
  },
  {
    id: "soft-wedding-light",
    label: "Soft Wedding · Light",
    blurb:
      "Variant 7b — same premium marketplace card, but with only a SLIGHT fade on the hero: a small saturation drop and a very light blush overlay (~⅓ the intensity of the original Soft Wedding wash). Photo still reads close to its true colour while picking up a touch of wedding warmth.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="light"
      />
    ),
  },
  {
    id: "soft-wedding-airy",
    label: "Soft Wedding · Light & Airy",
    blurb:
      "Variant 8a — Light & Airy wedding grade. High-key brightness lift, low contrast, lightly desaturated. A cream haze in the highlights and a very gentle blush midtone keep the photo bright and Pinterest-wedding-friendly; shadows are lifted with cream rather than warmed with taupe so the overall image stays luminous. Reference: Mastin Labs Fuji 400H / Sage & Ivory.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-airy"
      />
    ),
  },
  {
    id: "soft-wedding-warm",
    label: "Soft Wedding · Warm Romantic",
    blurb:
      "Variant 8b — Warm Romantic / Golden Hour grade. Slight sepia tilt + saturated peach midtones and warm amber shadows; an amber radial glow biased toward the upper-right suggests late-afternoon sun. Feels intimate, celebratory, golden. Reference: Tribe Archipelago Forester / Greg Finck golden-hour ceremonies.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-warm"
      />
    ),
  },
  {
    id: "soft-wedding-fineart",
    label: "Soft Wedding · Fine-Art Film",
    blurb:
      "Variant 8c — Diagonal peach → blush → lavender wash on the hero. A single 135° linear gradient (warm peach → soft blush pink → pale lavender) sits on top of the photo with calibrated alphas, giving the image a dreamy, romantic colour-graded feel.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-fineart"
      />
    ),
  },
  // Three unifying colour-grade demos. Each variant uses the same two
  // very different source photos for DJ Alex Holm (dark blue stage
  // light) and DJ Flashback (bright neutral daylight) and applies a
  // different unifying grade so we can compare how each grade pulls
  // visually inconsistent photos into the same wedding palette.
  {
    id: "soft-wedding-grade-film",
    label: "Soft Wedding · Grade A (Film Wash)",
    blurb:
      "Variant 9a — Unifying grade A. Heavy desaturation (sat 0.55) strips out source colour casts hard, then a champagne base + ivory highlights / peach midtones / warmed-taupe shadows + a luminous upper-centre haze rebuild a single wedding palette from scratch. Strongest unification — the dark-blue venue photo loses its blue cast almost entirely.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-grade-film"
        heroOverrides={WEDDING_GRADE_HERO_OVERRIDES}
      />
    ),
  },
  {
    id: "soft-wedding-grade-warmbias",
    label: "Soft Wedding · Grade B (Warm Bias)",
    blurb:
      "Variant 9b — Unifying grade B. A hue-rotation of −8° plus sepia 15% bias every photo toward warm before a single 165° champagne → peach → taupe gradient is applied. Less aggressive than Grade A — keeps more of each photo's individual character while still reading as the same shoot. The blue venue stays slightly cool but reads as warm-toned overall.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-grade-warmbias"
        heroOverrides={WEDDING_GRADE_HERO_OVERRIDES}
      />
    ),
  },
  {
    id: "soft-wedding-grade-matte",
    label: "Soft Wedding · Grade C (Matte Film)",
    blurb:
      "Variant 9c — Unifying grade C. A heavy contrast drop (0.85) flattens both photos into a matte film look, then a lifted-black champagne base + standard ivory/peach/taupe soft-light bands add warmth. Less colour-twist than Grade A, more unifying than Grade B — middle ground that preserves natural skin tones while equalising the lighting feel.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="wedding-grade-matte"
        heroOverrides={WEDDING_GRADE_HERO_OVERRIDES}
      />
    ),
  },
];

/** Per-DJ hero overrides used only by the wedding-grade demo
 * variants. Two source photos with intentionally inconsistent
 * lighting (bright daylight neutral vs dark venue with strong blue
 * stage light) so we can compare how each unifying grade handles
 * very different starting points. */
const WEDDING_GRADE_HERO_OVERRIDES: Record<string, string> = {
  "dj-1": "/dj-photos/warm-alex.png",
  "dj-5": "/dj-photos/warm-flashback.png",
};

/**
 * Five card-only variations for the wedding-DJ marketplace, toggled
 * one-at-a-time via the top tab strip. Each variant also has a density
 * sub-toggle to switch between 3 and 4 cards per row. Both choices
 * persist in the URL search params so the views are shareable.
 */
export function WeddingDJsCurvedSweepDemoPage() {
  const [params, setParams] = useSearchParams();
  const variantParam = params.get("variant");
  const colsParam = params.get("cols");
  const activeVariant: Variant = useMemo(() => {
    const found = VARIANTS.find((v) => v.id === variantParam);
    return found || VARIANTS[0]!;
  }, [variantParam]);
  const density: Density = colsParam === "4" ? "4" : "3";

  useDocumentHead({
    title: `[${activeVariant.label} · ${density}-col] ${config.metaTitle}`,
    description: "Five card-only DJ marketplace explorations with toggle.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const count = density === "4" ? activeVariant.count4 : activeVariant.count3;
  const cols = density === "4" ? COLS_4 : COLS_3;
  const examples = availableDJs.slice(0, count);

  const setVariant = (id: VariantId) => {
    if (id === VARIANTS[0]!.id) {
      params.delete("variant");
    } else {
      params.set("variant", id);
    }
    setParams(params, { replace: true });
  };

  const setDensity = (d: Density) => {
    if (d === "3") {
      params.delete("cols");
    } else {
      params.set("cols", d);
    }
    setParams(params, { replace: true });
  };

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Card-only explorations · Toggle
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Card variations for the wedding-DJ marketplace.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Card designs that differ in how the hero image is cut and
            integrated (arch, diagonal, wave, corner, triptych,
            diagonal · right, soft wedding · clean, soft wedding · light).
            All share the same brand
            foundation: warm off-white, deep navy text, coral accents,
            soft shadows. Switch between variations using the tabs below,
            and toggle the row density to preview 3 or 4 cards per row —
            both choices persist in the URL.
          </p>

          {/* Toggles */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Card variant"
              className="inline-flex flex-wrap items-center gap-1 rounded-full border border-amber-200 bg-white p-1 shadow-sm"
            >
              {VARIANTS.map((v) => {
                const active = v.id === activeVariant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setVariant(v.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[12.5px] font-semibold tracking-tight transition-colors",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tablist"
              aria-label="Cards per row"
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white p-1 shadow-sm"
            >
              {(["3", "4"] as const).map((d) => {
                const active = d === density;
                return (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setDensity(d)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold tracking-tight transition-colors",
                      active
                        ? "text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                    style={active ? { backgroundColor: "#ff6b46" } : undefined}
                  >
                    {d} per række
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500">
            {activeVariant.blurb}
          </p>
        </div>
      </header>

      <main className="container py-10">
        {loading ? (
          <div className="h-[460px] animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className={cn("grid gap-6", cols)}>
            {examples.map((dj) => (
              <div key={`${activeVariant.id}-${density}-${dj.id}`}>
                {activeVariant.render(dj, density)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
