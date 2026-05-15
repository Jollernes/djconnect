import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { StackedDJCardB_V11CurvedSweep4Col } from "@/components/event-djs/stacked/b-variants/V11CurvedSweep4Col";

const config = EVENT_LISTING_CONFIG.wedding;

/**
 * Dedicated demo page rendering the V11 curved-sweep card layout (4
 * cards per row on desktop). The hero photo is masked with a large
 * radial-gradient sweep at the lower-right, creating a cream carved
 * area where the black-and-white avatar sits embedded — matching the
 * Luna Skye reference exactly.
 */
export function WeddingDJsCurvedSweepDemoPage() {
  useDocumentHead({
    title: `[Curved-sweep] ${config.metaTitle}`,
    description: "Curved-sweep wedding-DJ card layout (4 cards per row).",
  });

  const { availableDJs, loading } = useEventDJsListing(
    config.id,
    config.label.toLowerCase(),
  );

  const examples = availableDJs.slice(0, 8);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-16">
      <header className="border-b bg-[#fbf8f3]">
        <div className="container py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
            Mock-up · Curved-sweep card layout
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Curved-sweep wedding-DJ card — 4 per row.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Hero photo masked with a large radial-gradient sweep at the
            lower-right (~110 px radius circle centred inside the photo),
            carving a substantial curved gap. The black-and-white avatar sits
            embedded in that cream sweep, straddling the bottom edge of the
            photo so it reads as integrated into the card shape rather than
            placed underneath. Sage "KUNDEFAVORIT" pill top-left, serif name
            + verified dot, italic bio, two facts, price + rating row, and a
            wide rust pill CTA.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            See also: <a href="/wedding-djs-stacked-b-explore" className="text-amber-700 hover:underline">/wedding-djs-stacked-b-explore</a>{" "}
            (broader B-variant exploration).
          </p>
        </div>
      </header>

      <main className="container py-10">
        {loading ? (
          <div className="h-[460px] animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {examples.map((dj) => (
              <StackedDJCardB_V11CurvedSweep4Col
                key={dj.id}
                dj={dj}
                eventTypeId={config.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
