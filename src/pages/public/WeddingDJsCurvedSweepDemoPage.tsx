import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const config = EVENT_LISTING_CONFIG.wedding;

/** Stable public sample MP4 — short, ~1 MB, hosted by Google Cloud
 * Storage. Used so the [▶] button in the hero actually plays
 * something in the demo. Production cards would pass a per-DJ
 * intro-video URL instead. */
const SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

type VariantId =
  | "soft-wedding-stats-inline-colour"
  | "soft-wedding-triptych";
type Density = "3" | "4" | "5";

type Variant = {
  id: VariantId;
  label: string;
  blurb: string;
  count3: number;
  count4: number;
  count5: number;
  render: (dj: DJProfileWithRelations, density: Density) => ReactElement;
};

const COLS_3 = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
const COLS_4 = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
const COLS_5 =
  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

const VARIANTS: Variant[] = [
  {
    id: "soft-wedding-stats-inline-colour",
    label: "Soft Wedding · Stats · Inline · Colour",
    blurb:
      "Identical to Soft Wedding · Stats · Inline but with the hero photo rendered in full colour (no grayscale wash). Direct A/B against the base variant — same stat row, same compact CTA + availability hint, same cream-amber palette.",
    count3: 6,
    count4: 8,
    count5: 10,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="none"
        heroGrayscale={0}
        avatarGrayscale={false}
        bioLines={3}
        showWeddingsPlayed
        hideEventTypes
        hideStarRating
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
        ctaProminence="filled"
        availabilityDate="d. 14. juni 2025"
        videoUrl={SAMPLE_VIDEO_URL}
      />
    ),
  },
  {
    id: "soft-wedding-triptych",
    label: "Soft Wedding · Triptych",
    blurb:
      "Hybrid — Triptych's photo mosaic (1 large hero + 3 stacked thumbnails with intro-video play badge + image-count overlay + small B&W avatar overlapping the seam) wears the Soft Wedding · Stats · Inline content body: BryllupsDJ hallmark, serif name + 3-line bio, inline stat row (anmeldelser · brylluper · års erfaring · Pro DJ-udstyr), and the compact CTA row with the availability hint. Photos render in full colour.",
    count3: 6,
    count4: 8,
    count5: 10,
    render: (dj, density) => (
      <GridCardV23SoftWedding
        dj={dj}
        eventTypeId={config.id}
        density={density}
        tint="none"
        heroGrayscale={0}
        avatarGrayscale={false}
        bioLines={3}
        showWeddingsPlayed
        hideEventTypes
        hideStarRating
        showRegion
        showSeeProfileCta
        priceIncludes={["5 timer inkl. lyd & lys"]}
        statStyle="inline"
        ctaProminence="filled"
        availabilityDate="d. 14. juni 2025"
        photoLayout="triptych"
        videoUrl={SAMPLE_VIDEO_URL}
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
  const density: Density =
    colsParam === "5" ? "5" : colsParam === "4" ? "4" : "3";

  useDocumentHead({
    title: `[${activeVariant.label} · ${density}-col] ${config.metaTitle}`,
    description: "Five card-only DJ marketplace explorations with toggle.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const count =
    density === "5"
      ? activeVariant.count5
      : density === "4"
        ? activeVariant.count4
        : activeVariant.count3;
  const cols = density === "5" ? COLS_5 : density === "4" ? COLS_4 : COLS_3;
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
              {(["3", "4", "5"] as const).map((d) => {
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
