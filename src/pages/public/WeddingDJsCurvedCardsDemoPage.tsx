import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { StackedDJCardB_V9CurvedScoop3Col } from "@/components/event-djs/stacked/b-variants/V9CurvedScoop3Col";
import { StackedDJCardB_V10CurvedScoop4Col } from "@/components/event-djs/stacked/b-variants/V10CurvedScoop4Col";

const config = EVENT_LISTING_CONFIG.wedding;

/**
 * Demo page for the two curved-scoop card layouts derived from the
 * external references. Layout 1 is a 3-column grid with a dramatic
 * scoop and large serif lockup; layout 2 is a 4-column grid with a
 * smaller scoop and a "KUNDEFAVORIT" pill. Both use black-and-white
 * avatars positioned in the scooped gap.
 */
export function WeddingDJsCurvedCardsDemoPage() {
  useDocumentHead({
    title: `[Curved-cards] ${config.metaTitle}`,
    description: "Curved-scoop card layouts (3-col and 4-col) for the wedding-DJ listing.",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const sixDJs = availableDJs.slice(0, 6);
  const eightDJs = availableDJs.slice(0, 8);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Curved-scoop card layouts
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Two takes on the curved-scoop wedding-DJ card.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Both layouts share the same distinctive design language: a hero
            photo with a sweeping concave scoop at the bottom-right (created
            with a CSS mask-image radial gradient), and a black-and-white
            avatar positioned precisely inside the scooped gap. Layout 1 is a
            3-column grid with a large serif lockup and a 6-fact micro-grid;
            Layout 2 is a 4-column grid with a more compact lockup, a
            "KUNDEFAVORIT" pill, and just two facts.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            See also: <a href="/wedding-djs-stacked-b-explore" className="text-amber-700 hover:underline">/wedding-djs-stacked-b-explore</a>{" "}
            (the broader B-variant exploration).
          </p>
        </div>
      </header>

      <main className="container space-y-14 py-10">
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3">
            <span className="font-serif text-[28px] font-light leading-none text-amber-300">01</span>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
              Layout 1 — Curved scoop, 3 per row
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Dramatic concave scoop at the bottom-right of the hero (220 px
            radial-gradient mask). Sage "TOP VURDERET / HURTIG RESPONS /
            VERIFICERET DJ" pill top-left. Black-and-white avatar with a thin
            slate ring, positioned in the scooped gap. 28 px serif name,
            italic bio, 2-column 6-fact micro-grid, rust pill CTA + heart.
          </p>
          {loading ? (
            <div className="h-[420px] animate-pulse rounded-lg bg-muted" />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sixDJs.map((dj, idx) => (
                <StackedDJCardB_V9CurvedScoop3Col
                  key={dj.id}
                  dj={dj}
                  eventTypeId={config.id}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-3">
            <span className="font-serif text-[28px] font-light leading-none text-amber-300">02</span>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
              Layout 2 — Curved scoop, 4 per row
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Same scoop, smaller scale (160 px mask). Sage "KUNDEFAVORIT" pill
            with a heart icon top-left. Black-and-white avatar in the
            scooped gap. 20 px serif name + green verified dot, italic bio,
            two facts (location + genres), price + rating row, full-width
            rust CTA + heart button.
          </p>
          {loading ? (
            <div className="h-[380px] animate-pulse rounded-lg bg-muted" />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {eightDJs.map((dj) => (
                <StackedDJCardB_V10CurvedScoop4Col
                  key={dj.id}
                  dj={dj}
                  eventTypeId={config.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
