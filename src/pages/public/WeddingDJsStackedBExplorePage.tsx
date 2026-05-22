import type { ReactElement } from "react";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { StackedDJCardB } from "@/components/event-djs/stacked/StackedDJCardB";
import { StackedDJCardB_V2Airy } from "@/components/event-djs/stacked/b-variants/V2Airy";
import { StackedDJCardB_V3Media } from "@/components/event-djs/stacked/b-variants/V3Media";
import { StackedDJCardB_V4Editorial } from "@/components/event-djs/stacked/b-variants/V4Editorial";
import { StackedDJCardB_V5Specs } from "@/components/event-djs/stacked/b-variants/V5Specs";
import { StackedDJCardB_V6CoralGrid } from "@/components/event-djs/stacked/b-variants/V6CoralGrid";
import { StackedDJCardB_V7BoutiqueGrid } from "@/components/event-djs/stacked/b-variants/V7BoutiqueGrid";
import { StackedDJCardB_V8HybridGrid } from "@/components/event-djs/stacked/b-variants/V8HybridGrid";
import type { DJProfileWithRelations } from "@/types/domain";

const config = EVENT_LISTING_CONFIG.wedding;

type Variation = {
  letter: string;
  label: string;
  description: string;
  /** "stacked" = one full-width card per row · "grid" = multi-column grid */
  kind: "stacked" | "grid";
  /** Tailwind grid cols utility (only used when kind="grid") */
  cols?: string;
  render: (dj: DJProfileWithRelations, index: number) => ReactElement;
};

const VARIATIONS: Variation[] = [
  {
    letter: "01",
    label: "Variation 1 — B Standard (current)",
    description:
      "Unchanged baseline. Boutique cream surface, gold 'Wedding specialist' pill, 24 px serif name, full trust strip on the right rail.",
    kind: "stacked",
    render: (dj) => (
      <StackedDJCardB dj={dj} eventTypeId={config.id} density="comfortable" />
    ),
  },
  {
    letter: "02",
    label: "Variation 2 — Airy / type-first",
    description:
      "Editorial-light. Smaller scale (18 px name, 13 px bio, 12 px stats with em-dash separators), slate-500 eyebrow instead of amber, no boutique pill, minimal right rail (price + thin 'Anmod tilbud →' link, no trust strip).",
    kind: "stacked",
    render: (dj) => <StackedDJCardB_V2Airy dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "03",
    label: "Variation 3 — Media-rich",
    description:
      "Wider 320-px photo column with a centre play-icon overlay on the hero, a '▶ 1:00 introvideo' pill bottom-left, and a 3-thumbnail strip below. Right rail gains a secondary '▶ Se introvideo' button above the primary CTA.",
    kind: "stacked",
    render: (dj) => <StackedDJCardB_V3Media dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "04",
    label: "Variation 4 — Editorial magazine",
    description:
      "Kinfolk-style. Large serif numeral in the top-right corner, lowercase italic-serif eyebrow, regular-weight 26 px serif name, italic-serif bio, em-dash stat separators. Right rail is just price + 'Læs Mikkels historie →' italic-serif link.",
    kind: "stacked",
    render: (dj, idx) => (
      <StackedDJCardB_V4Editorial dj={dj} eventTypeId={config.id} index={idx + 1} />
    ),
  },
  {
    letter: "05",
    label: "Variation 5 — Pro-specs grid",
    description:
      "Comparison-focused. Narrower 180-px photo column. Middle column drops the bio in favour of a 2-column specs grid (Erfaring · Setup · Rejseradius · Events · Rating · Svartid). Right rail uses an outline 'Anmod tilbud' button instead of a filled one.",
    kind: "stacked",
    render: (dj) => <StackedDJCardB_V5Specs dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "06",
    label: "Variation 6 — Coral grid (SaaS-energetic)",
    description:
      "Multi-DJ grid (4 cards / row on desktop). Vertical card with a diagonal coral corner accent on the hero, a small dark circular initials avatar overlapping the photo, bold sans name + green verified ✓, italic bio, big price + rating row, three outlined utility chips (Video · Setup · Fast quote), and a coral full-width 'Check availability →' CTA. Inspired by the international SaaS reference — energetic, modern, scannable.",
    kind: "grid",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    render: (dj) => <StackedDJCardB_V6CoralGrid dj={dj} eventTypeId={config.id} />,
  },
  {
    letter: "07",
    label: "Variation 7 — Boutique amber grid (Danish-premium)",
    description:
      "Multi-DJ grid (3 cards / row on desktop) on cream surface. Hero photo with a curved cutout at the bottom-right where a thin-gold-ringed avatar sits embedded. Sage-green status pill top-left (TOP VURDERET / HURTIG RESPONS / VERIFICERET DJ). Big serif name, italic bio, and a 2-column 6-fact micro-grid (location · rating · event types · 100% anbefalet · price range · genres). Rust CTA 'Se profil & forespørg' + heart shortlist button. On-brand, boutique-Danish.",
    kind: "grid",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    render: (dj, idx) => (
      <StackedDJCardB_V7BoutiqueGrid dj={dj} eventTypeId={config.id} index={idx} />
    ),
  },
  {
    letter: "08",
    label: "Variation 8 — Hybrid (best of V6 + V7)",
    description:
      "Multi-DJ grid (3 cards / row on desktop) on cream surface. Curved-cutout hero + sage status pill + embedded gold-ring avatar from V7. Serif name + verified dot, italic bio, and the 2-column 6-fact micro-grid from V7. Three amber-outlined utility chips (Video · Setup · Hurtigt tilbud) from V6. Prominent full-width rust 'Se tilgængelighed →' CTA + heart icon. The premium-but-energetic best-of-both.",
    kind: "grid",
    cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    render: (dj, idx) => (
      <StackedDJCardB_V8HybridGrid dj={dj} eventTypeId={config.id} index={idx} />
    ),
  },
];

/**
 * Demo / exploration page showing eight variations of the boutique B
 * Standard wedding-DJ card. V1 is the baseline; V2–V5 explore stacked
 * row layouts (typography, media, editorial, info-density); V6–V8 are
 * multi-DJ grid layouts inspired by two external references and a
 * hybrid. No customer testimonials in any variation.
 */
export function WeddingDJsStackedBExplorePage() {
  useDocumentHead({
    title: `[B-Explore] ${config.metaTitle}`,
    description:
      "Eight layout explorations of the boutique B Standard wedding-DJ card.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const stackedExamples = availableDJs.slice(0, 2);
  const gridExamples = availableDJs.slice(0, 6);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Variant B explorations
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Eight takes on the boutique wedding-DJ card.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Variations 1–5 are stacked, full-width-row layouts (typography,
            media, editorial, info-density). Variations 6–8 switch to a
            multi-DJ grid format — two of them inspired by external references
            (coral SaaS-energetic and Danish-boutique premium), and the third
            a hybrid combining the best of both. No customer testimonials are
            used in any variation.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            See also: <a href="/wedding-djs-stacked-b" className="text-amber-700 hover:underline">/wedding-djs-stacked-b</a>{" "}
            (the live B page with density toggle).
          </p>
        </div>
      </header>

      <main className="container space-y-12 py-10">
        {VARIATIONS.map((v) => {
          const examples = v.kind === "grid" ? gridExamples : stackedExamples;
          return (
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
              {loading ? (
                <div className="h-[260px] animate-pulse rounded-lg bg-muted" />
              ) : v.kind === "grid" ? (
                <div className={`grid gap-4 ${v.cols ?? "grid-cols-3"}`}>
                  {examples.map((dj, idx) => (
                    <div key={`${v.letter}-${dj.id}`}>{v.render(dj, idx)}</div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {examples.map((dj, idx) => (
                    <div key={`${v.letter}-${dj.id}`}>{v.render(dj, idx)}</div>
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
