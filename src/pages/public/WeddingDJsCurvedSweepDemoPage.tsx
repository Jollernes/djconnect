import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV21Triptych } from "@/components/event-djs/grid/V21Triptych";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const config = EVENT_LISTING_CONFIG.wedding;

type VariantId =
  | "triptych"
  | "soft-wedding-clean"
  | "soft-wedding-stats-inline"
  | "soft-wedding-stats-inline-blush"
  | "soft-wedding-stats-inline-sage"
  | "soft-wedding-stats-inline-champagne";
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
        hideStarRating
        showRegion
        showSeeProfileCta
        ctaLabel="Se profil & bryllupspakker"
        priceIncludes={["5 timer inkl. lyd & lys"]}
      />
    ),
  },
  {
    id: "soft-wedding-stats-inline",
    label: "Soft Wedding · Stats · Inline",
    blurb:
      "Alt G — central stat row collapsed to a single line of plain text with tiny rose-gold icons and thin slate-300 bullet separators. Star rating added as a 4th item to keep proportions balanced: \"★ 4,9 · 87 anmeldelser · 320+ brylluper · 10+ års erfaring\". Tightest possible footprint — barely taller than one text line.",
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
        hideStarRating
        showRegion
        showSeeProfileCta
        ctaLabel="Se profil & bryllupspakker"
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
      />
    ),
  },
  {
    id: "soft-wedding-stats-inline-blush",
    label: "Soft Wedding · Stats · Inline · Blush",
    blurb:
      "Colour alt 1 — dusty rose (`#c08487`) replaces the rose-gold accent on the stat-row icons, with a soft pink CTA border (`#f0d6d6`) and a pale blush hover (`#fbf2f2`). Romantic / floral wedding palette (peony, blush tablescapes). Card body and BryllupsDJ hallmark unchanged.",
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
        hideStarRating
        showRegion
        showSeeProfileCta
        ctaLabel="Se profil & bryllupspakker"
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
        colourway="blush"
      />
    ),
  },
  {
    id: "soft-wedding-stats-inline-sage",
    label: "Soft Wedding · Stats · Inline · Sage",
    blurb:
      "Colour alt 2 — muted sage (`#7d8b6e`) on the stat-row icons, sage-pale CTA border (`#d6dccc`) and hover (`#f3f5ee`). Botanical / greenery wedding palette (eucalyptus, olive). Cool, calm, modern. Card body and BryllupsDJ hallmark unchanged.",
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
        hideStarRating
        showRegion
        showSeeProfileCta
        ctaLabel="Se profil & bryllupspakker"
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
        colourway="sage"
      />
    ),
  },
  {
    id: "soft-wedding-stats-inline-champagne",
    label: "Soft Wedding · Stats · Inline · Champagne",
    blurb:
      "Colour alt 3 — warmer champagne gold (`#c9a16b`) on the stat-row icons, champagne CTA border (`#e8d09e`) + hover (`#f9f1de`), and the card body itself subtly tinted to a pale champagne (`#fcfaf6`) so the whole card reads warm rather than muted brown. Closest to the default palette but lifted in temperature.",
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
        hideStarRating
        showRegion
        showSeeProfileCta
        ctaLabel="Se profil & bryllupspakker"
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
        colourway="champagne"
      />
    ),
  },
];

/**
 * Two card-only variations for the wedding-DJ marketplace — Triptych
 * and Soft Wedding · Clean — toggled one-at-a-time via the top tab
 * strip. Each variant also has a density sub-toggle to switch between
 * 3 and 4 cards per row. Both choices persist in the URL search
 * params so the views are shareable.
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
            Two card designs for the wedding-DJ marketplace: Triptych
            (1 hero + 3 stacked thumbnails mosaic) and Soft Wedding ·
            Clean (premium single-photo card with the BryllupsDJ
            badge, 3-stat row, and Se profil CTA). Both share the same
            brand foundation: warm off-white, deep navy text, coral
            accents, soft shadows. Switch between variations using the
            tabs below, and toggle the row density to preview 3 or 4
            cards per row — both choices persist in the URL.
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
