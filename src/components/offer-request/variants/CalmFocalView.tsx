import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  deriveActivityEvents,
  formatExpectedFromRemaining,
  seenCount,
} from "@/components/offer-request/shared";

/**
 * Variant A — Calm focal point.
 *
 * One pulsing radar/breathing animation in the middle of the page, a clear
 * deadline above it, a single rotating activity line below it, and explicit
 * reassurance that the customer doesn't need to stay on the page.
 *
 * The page should feel like a meditation, not a control panel — only one
 * thing is moving at a time, and motion is gentle.
 */
export function CalmFocalView({
  record,
  djCatalog,
  remainingHours,
  quotesSection,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  remainingHours: number;
  /** Quote cards to render below the focal area. Hidden if no quotes yet. */
  quotesSection?: React.ReactNode;
}) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const events = useMemo(
    () => deriveActivityEvents(record, djCatalog),
    [record, djCatalog],
  );
  const eta = formatExpectedFromRemaining(record, remainingHours);
  const seen = seenCount(record);

  // Activity ticker rotates through the recent events, one at a time.
  const tickerLines = useMemo(() => buildTickerLines(events, seen, agg), [
    events,
    seen,
    agg,
  ]);
  const [tickerIdx, setTickerIdx] = useState(0);
  useEffect(() => {
    if (tickerLines.length <= 1) return;
    const t = setInterval(() => {
      setTickerIdx((i) => (i + 1) % tickerLines.length);
    }, 4500);
    return () => clearInterval(t);
  }, [tickerLines.length]);

  // If activity itself just changed, jump to the latest line so the user
  // sees it immediately.
  useEffect(() => {
    if (tickerLines.length > 0) {
      setTickerIdx(tickerLines.length - 1);
    }
  }, [tickerLines.length]);

  const allDone = agg.quotesReady >= 3;
  const hasAnyQuote = agg.quotesReady > 0;

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-border/40 bg-card/30 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          {/* Deadline line */}
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Your offers are on the way
          </p>
          <h1 className="mt-3 text-2xl font-medium tracking-tight md:text-[26px]">
            {allDone
              ? "Your 3 personal quotes are ready"
              : eta
                ? `Quotes expected by ${eta}`
                : "Quotes are coming in"}
          </h1>
          {!allDone && (
            <p className="mt-2 text-sm text-muted-foreground">
              Up to 3 personal quotes within 24 hours.
            </p>
          )}

          {/* Pulsing focal animation */}
          <div className="relative mt-12 flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
            <PulsingFocal active={!allDone} />
            <div className="relative z-10 text-center">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Quotes ready
              </p>
              <p className="mt-1 text-5xl font-light tabular-nums leading-none text-foreground">
                {agg.quotesReady}
                <span className="text-2xl text-muted-foreground/70"> / 3</span>
              </p>
            </div>
          </div>

          {/* Activity ticker — one line at a time, fades in/out */}
          <div className="mt-10 h-6 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {tickerLines[tickerIdx] && (
                <motion.p
                  key={`${tickerIdx}-${tickerLines[tickerIdx]}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  {tickerLines[tickerIdx]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Reassurance */}
          {!allDone && (
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-4 py-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Feel free to close this page — we'll email you when each quote arrives
            </p>
          )}
        </div>
      </section>

      {/* Quotes appear quietly below once any have arrived */}
      {hasAnyQuote && quotesSection ? (
        <section>{quotesSection}</section>
      ) : null}
    </div>
  );
}

/**
 * Build the ticker lines shown one at a time. Mixes the most recent
 * orchestrator events with two evergreen reassurance lines so there's
 * always something quiet to show when nothing has happened yet.
 */
function buildTickerLines(
  events: ReturnType<typeof deriveActivityEvents>,
  seen: number,
  agg: ReturnType<typeof aggregateOf>,
): string[] {
  const lines: string[] = [];

  // Take the last 4 meaningful events
  const recent = events.slice(-4).map((e) => e.text);
  lines.push(...recent);

  // Append a status pulse so the ticker keeps moving even if events
  // haven't fired in a while.
  if (seen > 0 && agg.quotesReady < 3) {
    lines.push(
      `${seen} of ${agg.total} matched DJ${agg.total === 1 ? "" : "s"} have seen your request`,
    );
  }
  if (agg.quotesReady > 0 && agg.quotesReady < 3) {
    lines.push(
      `${agg.quotesReady} quote${agg.quotesReady === 1 ? " is" : "s are"} ready below`,
    );
  }

  // Final reassurance line
  if (agg.quotesReady < 3) {
    lines.push("You don't need to stay on this page.");
  }

  return lines.length > 0 ? lines : ["Matching DJs to your event…"];
}

function PulsingFocal({ active }: { active: boolean }) {
  if (!active) {
    // Steady ring once everything's done
    return (
      <span className="absolute inset-0 rounded-full border border-emerald-300/60 bg-emerald-50/40" />
    );
  }
  return (
    <>
      {/* Three concentric rings, breathing at offset phases */}
      {[0, 0.6, 1.2].map((delay) => (
        <motion.span
          key={delay}
          className="absolute inset-0 rounded-full border border-foreground/20"
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1.15, opacity: 0 }}
          transition={{
            duration: 2.4,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Soft static ring containing the count */}
      <span className="absolute inset-3 rounded-full border border-foreground/15 bg-background/80" />
    </>
  );
}
