import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV21Triptych } from "@/components/event-djs/grid/V21Triptych";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";
import { GridCardV24SoftWeddingSide } from "@/components/event-djs/grid/V24SoftWeddingSide";
import { GridCardV25SoftWeddingLeft } from "@/components/event-djs/grid/V25SoftWeddingLeft";
import { GridCardV26SoftWeddingCompact } from "@/components/event-djs/grid/V26SoftWeddingCompact";
import { GridCardV27SoftWeddingOverlay } from "@/components/event-djs/grid/V27SoftWeddingOverlay";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const config = EVENT_LISTING_CONFIG.wedding;

type VariantId =
  | "triptych"
  | "soft-wedding-clean"
  | "soft-wedding-banner"
  | "soft-wedding-side"
  | "soft-wedding-pills"
  | "soft-wedding-left"
  | "soft-wedding-compact"
  | "soft-wedding-overlay"
  | "soft-wedding-stats-inline"
  | "soft-wedding-stats-grid4"
  | "soft-wedding-stats-rating-lead";
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
      />
    ),
  },
  {
    id: "soft-wedding-banner",
    label: "Soft Wedding · Banner",
    blurb:
      "Alt A — same Clean recipe, but the 3-stat row is restyled as a full-bleed cream-amber banner with larger serif numbers and italic editorial labels. Stats become the visual lead under the bio. Bio length preserved at 3 lines.",
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
        statStyle="banner"
      />
    ),
  },
  {
    id: "soft-wedding-side",
    label: "Soft Wedding · Side",
    blurb:
      "Alt B — horizontal layout. Hero (with the avatar carved into its right edge) sits on the left ~45%, all text content (name → full 3-line bio → 3-stat row → region/price → Se profil CTA → response time) flows on the right. Stacks back to vertical on mobile. Bio length preserved.",
    count3: 4,
    count4: 6,
    render: (dj, density) => (
      <GridCardV24SoftWeddingSide
        dj={dj}
        eventTypeId={config.id}
        density={density}
      />
    ),
  },
  {
    id: "soft-wedding-pills",
    label: "Soft Wedding · Pills",
    blurb:
      "Alt C — same Clean recipe, but the 3-stat row is restyled as three compact horizontal chips on a single row (icon · value · label). Lighter trust signal, less vertical real-estate than the icon-badge grid. Bio length preserved at 3 lines.",
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
        statStyle="pills"
      />
    ),
  },
  {
    id: "soft-wedding-left",
    label: "Soft Wedding · Left",
    blurb:
      "Alt D — left-aligned content. Hero plain rectangle (no avatar notch). Below the hero a horizontal mini-header: a small 56-px avatar on the left + name + 3-line bio stacked beside it. Stats inline-left, region/price utility, CTA and response-time line all left-aligned.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV25SoftWeddingLeft
        dj={dj}
        eventTypeId={config.id}
        density={density}
      />
    ),
  },
  {
    id: "soft-wedding-compact",
    label: "Soft Wedding · Compact",
    blurb:
      "Alt E — same centered vertical layout as Clean but everything tightened: 16:9 hero, 76-px avatar in the carved notch, smaller paddings (px-3.5), smaller serif name (17 / 15.5 px), stats as one inline pills row, smaller CTA, response-time line dropped. 3-line bio preserved.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV26SoftWeddingCompact
        dj={dj}
        eventTypeId={config.id}
        density={density}
      />
    ),
  },
  {
    id: "soft-wedding-overlay",
    label: "Soft Wedding · Overlay",
    blurb:
      "Alt F — image-heavy. Taller 4:3 hero with a subtle bottom gradient. Content sits as a frosted-glass \"ticket\" overlapping the bottom of the hero via a negative top margin, with the avatar floating in the top-right of the panel just above its edge. 3-line bio preserved.",
    count3: 6,
    count4: 8,
    render: (dj, density) => (
      <GridCardV27SoftWeddingOverlay
        dj={dj}
        eventTypeId={config.id}
        density={density}
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
        statStyle="inline"
      />
    ),
  },
  {
    id: "soft-wedding-stats-grid4",
    label: "Soft Wedding · Stats · Grid-4",
    blurb:
      "Alt H — 4-column divided grid. Rating added as a fourth column on the left. Micro icons inline with the bold values (no icon badge circles), single-line captions, thin amber dividers, smaller numbers and labels than the current 3-col default. Same visual language but compressed and balanced 4-up.",
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
        statStyle="grid4"
      />
    ),
  },
  {
    id: "soft-wedding-stats-rating-lead",
    label: "Soft Wedding · Stats · Rating-Lead",
    blurb:
      "Alt I — asymmetric. Star rating rendered as a small cream-amber \"trust chip\" on the left (slightly taller than the other stats), then the three supporting stats flow as compact bullet-separated text on the right. Rating becomes the visual anchor; the other facts read as support.",
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
        showResponseTime
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. mobildiskotek"]}
        statStyle="rating-lead"
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
