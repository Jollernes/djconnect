import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV12Polaroid } from "@/components/event-djs/grid/V12Polaroid";
import { GridCardV13Editorial } from "@/components/event-djs/grid/V13Editorial";
import { GridCardV14Poster } from "@/components/event-djs/grid/V14Poster";
import { GridCardV15Atelier } from "@/components/event-djs/grid/V15Atelier";
import { GridCardV16Stamp } from "@/components/event-djs/grid/V16Stamp";
import type { DJProfileWithRelations } from "@/types/domain";

const config = EVENT_LISTING_CONFIG.wedding;

type Section = {
  letter: string;
  label: string;
  description: string;
  cols: string;
  count: number;
  render: (dj: DJProfileWithRelations, index: number) => ReactElement;
};

const SECTIONS: Section[] = [
  {
    letter: "01",
    label: "Bryllup-album — polaroid frame",
    description:
      "Hero photo sits inside a thick cream polaroid frame with a small handwritten-style serif caption at the bottom. Black-and-white avatar tucked top-right of the frame as a small 'host stamp' with a thin amber ring. Big serif name below the frame, single info line, thin amber 'Læs mere →' link CTA. 3 per row — personal, photo-album feel.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV12Polaroid dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "02",
    label: "Editorial spread — magazine lockup",
    description:
      "Two-column lockup at top: small black-and-white avatar on the left, italic-serif eyebrow + 22 px regular-weight serif name on the right. Hero photo (5:4) full-width below. Italic-serif bio, em-dash stats row, underlined italic 'Læs profil →' link CTA. 4 per row — feels like a magazine feature.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    count: 8,
    render: (dj) => <GridCardV13Editorial dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "03",
    label: "Koncertplakat — concert poster",
    description:
      "Hero photo fills the top with a strong dark gradient at the bottom. 28 px serif name printed in white over the photo's lower edge. Gold-ring black-and-white avatar overlapping top-left of the photo as the headshot. Ticket-stub info bar (📍 · 🎵 · ⭐) on a dashed amber border below. Rust pill 'Reservér →' CTA. 3 per row — dramatic, eventful.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    count: 6,
    render: (dj) => <GridCardV14Poster dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "04",
    label: "Atelier tile — boutique stationery",
    description:
      "Square card, centred composition. Large 80 px black-and-white avatar centred at the top with a thin amber ring. Serif name centred below + green verified ✓. Italic centred tagline. Thin amber divider, centred price + rating, outline rust pill CTA. 4 per row — feels like a premium wedding-supplier business card.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    count: 8,
    render: (dj) => <GridCardV15Atelier dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "05",
    label: "Postkort — postage stamp",
    description:
      "Hero photo gets a dashed amber perforation border evoking a postage stamp, plus a slight warm desaturation. Tilted oval 'postmark' badge with 'CITY · DK' stamped over the photo. Small black-and-white avatar bottom-right of the photo as a tiny stamp. Below: serif name, tagline, price + rating, amber underline 'Se profil →' link. 4 per row — collectible feel.",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    count: 8,
    render: (dj) => <GridCardV16Stamp dj={dj} eventTypeId={config.id} />,
  },
];

/**
 * Five fresh, brand-tailored grid-card explorations for the wedding-DJ
 * listing. Each variation is a genuinely distinct visual direction —
 * polaroid album, editorial spread, concert poster, boutique tile, and
 * postage stamp — all on the same cream/amber/serif brand foundation,
 * all featuring a black-and-white avatar.
 */
export function WeddingDJsCurvedSweepDemoPage() {
  useDocumentHead({
    title: `[Five-grids] ${config.metaTitle}`,
    description:
      "Five brand-tailored grid-card explorations for the wedding-DJ listing.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Five brand-tailored grid variations
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Five takes on the wedding-DJ grid card.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Five completely separate design directions for the DJ grid card,
            each rendered with real DJs. Every variation shares the same
            cream/amber/serif brand foundation and a black-and-white avatar,
            but each one expresses a distinct visual paradigm — wedding
            album, magazine spread, concert poster, boutique business card,
            and postage stamp. Cards-per-row varies by variation as noted in
            each description.
          </p>
        </div>
      </header>

      <main className="container space-y-14 py-10">
        {SECTIONS.map((s) => {
          const examples = availableDJs.slice(0, s.count);
          return (
            <section key={s.letter} className="space-y-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3">
                <span className="font-serif text-[28px] font-light leading-none text-amber-300">
                  {s.letter}
                </span>
                <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
                  {s.label}
                </h2>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                {s.description}
              </p>
              {loading ? (
                <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
              ) : (
                <div className={`grid gap-5 ${s.cols}`}>
                  {examples.map((dj, idx) => (
                    <div key={`${s.letter}-${dj.id}`}>{s.render(dj, idx)}</div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
