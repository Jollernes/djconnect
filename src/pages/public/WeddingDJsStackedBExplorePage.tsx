import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { StackedDJCardB } from "@/components/event-djs/stacked/StackedDJCardB";
import { StackedDJCardB_V2Airy } from "@/components/event-djs/stacked/b-variants/V2Airy";
import { StackedDJCardB_V3Media } from "@/components/event-djs/stacked/b-variants/V3Media";
import { StackedDJCardB_V4Editorial } from "@/components/event-djs/stacked/b-variants/V4Editorial";
import { StackedDJCardB_V5Specs } from "@/components/event-djs/stacked/b-variants/V5Specs";
import type { DJProfileWithRelations } from "@/types/domain";

const config = EVENT_LISTING_CONFIG.wedding;

type Variation = {
  letter: string;
  label: string;
  description: string;
  render: (dj: DJProfileWithRelations, index: number) => ReactElement;
};

const VARIATIONS: Variation[] = [
  {
    letter: "01",
    label: "Variation 1 — B Standard (current)",
    description:
      "Unchanged baseline. Boutique cream surface, gold 'Wedding specialist' pill, 24 px serif name, full trust strip on the right rail.",
    render: (dj) => (
      <StackedDJCardB dj={dj} eventTypeId={config.id} density="comfortable" />
    ),
  },
  {
    letter: "02",
    label: "Variation 2 — Airy / type-first",
    description:
      "Editorial-light. Smaller scale (18 px name, 13 px bio, 12 px stats with em-dash separators), slate-500 eyebrow instead of amber, no boutique pill, minimal right rail (price + thin 'Anmod tilbud →' link, no trust strip).",
    render: (dj) => <StackedDJCardB_V2Airy dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "03",
    label: "Variation 3 — Media-rich",
    description:
      "Wider 320-px photo column with a centre play-icon overlay on the hero, a '▶ 1:00 introvideo' pill bottom-left, and a 3-thumbnail strip below. Right rail gains a secondary '▶ Se introvideo' button above the primary CTA.",
    render: (dj) => <StackedDJCardB_V3Media dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "04",
    label: "Variation 4 — Editorial magazine",
    description:
      "Kinfolk-style. Large serif numeral in the top-right corner, lowercase italic-serif eyebrow, regular-weight 26 px serif name, italic-serif bio, em-dash stat separators. Right rail is just price + 'Læs Mikkels historie →' italic-serif link.",
    render: (dj, idx) => (
      <StackedDJCardB_V4Editorial dj={dj} eventTypeId={config.id} index={idx + 1} />
    ),
  },
  {
    letter: "05",
    label: "Variation 5 — Pro-specs grid",
    description:
      "Comparison-focused. Narrower 180-px photo column. Middle column drops the bio in favour of a 2-column specs grid (Erfaring · Setup · Rejseradius · Events · Rating · Svartid). Right rail uses an outline 'Anmod tilbud' button instead of a filled one.",
    render: (dj) => <StackedDJCardB_V5Specs dj={dj} eventTypeId={config.id} />,
  },
];

/**
 * Demo / exploration page showing five stacked-row variations of the
 * current Variant B Standard. Variation 1 is the baseline; variations
 * 2–5 explore typography, media, editorial layout, and information
 * density. No customer testimonials in any variation.
 */
export function WeddingDJsStackedBExplorePage() {
  useDocumentHead({
    title: `[B-Explore] ${config.metaTitle}`,
    description:
      "Five layout explorations of the Variant B Standard wedding-DJ card.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const examples = availableDJs.slice(0, 2);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Variant B explorations
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Five takes on the boutique wedding-DJ card.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Variation 1 is the current B Standard, kept as-is for reference.
            Variations 2–5 explore four different design directions — type-first,
            media-rich, editorial-magazine, and information-dense — all built on
            the same boutique cream palette and serif lockup. Each section
            renders two real DJs so you can compare side-by-side. No customer
            testimonials are used in any variation.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            See also: <a href="/wedding-djs-stacked-b" className="text-amber-700 hover:underline">/wedding-djs-stacked-b</a>{" "}
            (the live B page with density toggle).
          </p>
        </div>
      </header>

      <main className="container space-y-12 py-10">
        {VARIATIONS.map((v) => (
          <section key={v.letter} className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3">
              <span className="font-serif text-[28px] font-light leading-none text-amber-300">
                {v.letter}
              </span>
              <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
                {v.label}
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              {v.description}
            </p>
            <div className="space-y-4">
              {loading ? (
                <div className="h-[220px] animate-pulse rounded-lg bg-muted" />
              ) : (
                examples.map((dj, idx) => (
                  <div key={`${v.letter}-${dj.id}`}>{v.render(dj, idx)}</div>
                ))
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
