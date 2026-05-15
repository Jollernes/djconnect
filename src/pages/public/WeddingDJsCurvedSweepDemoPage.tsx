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
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const config = EVENT_LISTING_CONFIG.wedding;

type VariantId = "arch" | "diagonal" | "wave" | "corner" | "triptych";

type Variant = {
  id: VariantId;
  label: string;
  blurb: string;
  cols: string;
  count: number;
  render: (dj: DJProfileWithRelations) => ReactElement;
};

const VARIANTS: Variant[] = [
  {
    id: "arch",
    label: "Arch",
    blurb:
      "Chapel-arch image mask · image counter pill · B&W avatar bottom-left of image · compact thumbnail strip beneath.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV17Arch dj={dj} eventTypeId={config.id} />,
  },
  {
    id: "diagonal",
    label: "Diagonal",
    blurb:
      "Diagonal slash image mask · coral 'Introvideo 1:00' pill · stacked mini-gallery cascading in the open diagonal corner.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV18Diagonal dj={dj} eventTypeId={config.id} />,
  },
  {
    id: "wave",
    label: "Wave",
    blurb:
      "Wave-cut bottom edge (SVG clipPath) · B&W avatar itself functions as the intro video with a coral play overlay · compact Foto/Video/Setlist media tabs.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV19Wave dj={dj} eventTypeId={config.id} />,
  },
  {
    id: "corner",
    label: "Corner",
    blurb:
      "Asymmetric top-right corner cut creating a pentagon image · '+N fotos' counter pill · 3-square thumbnail column sits next to the lockup to save vertical space.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV20Corner dj={dj} eventTypeId={config.id} />,
  },
  {
    id: "triptych",
    label: "Triptych",
    blurb:
      "1 hero + 2 stacked thumbnails as a mosaic · intro-video play badge on the hero · '+N' image counter on the bottom thumbnail · B&W avatar overlapping the seam.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV21Triptych dj={dj} eventTypeId={config.id} />,
  },
];

/**
 * Five card-only variations for the wedding-DJ marketplace, toggled
 * one-at-a-time via the top tab strip. Variant choice persists in the
 * URL search param so each view is shareable.
 */
export function WeddingDJsCurvedSweepDemoPage() {
  const [params, setParams] = useSearchParams();
  const variantParam = params.get("variant");
  const activeVariant: Variant = useMemo(() => {
    const found = VARIANTS.find((v) => v.id === variantParam);
    return found || VARIANTS[0]!;
  }, [variantParam]);

  useDocumentHead({
    title: `[${activeVariant.label}] ${config.metaTitle}`,
    description: "Five card-only DJ marketplace explorations with toggle.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const examples = availableDJs.slice(0, activeVariant.count);

  const setVariant = (id: VariantId) => {
    if (id === VARIANTS[0]!.id) {
      params.delete("variant");
    } else {
      params.set("variant", id);
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
            Five card variations for the wedding-DJ marketplace.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Five card designs, each differing in how the hero image is cut
            and integrated into the card (arch, diagonal, wave, corner,
            triptych). All share the same brand foundation: warm off-white,
            deep navy text, coral accents, soft shadows. Switch between
            variations using the tabs below — the choice persists in the URL.
          </p>

          {/* Toggle */}
          <div role="tablist" aria-label="Card variant" className="mt-6 inline-flex flex-wrap items-center gap-1 rounded-full border border-amber-200 bg-white p-1 shadow-sm">
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
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500">
            {activeVariant.blurb}
          </p>
        </div>
      </header>

      <main className="container py-10">
        {loading ? (
          <div className="h-[460px] animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className={`grid gap-6 ${activeVariant.cols}`}>
            {examples.map((dj) => (
              <div key={`${activeVariant.id}-${dj.id}`}>
                {activeVariant.render(dj)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
