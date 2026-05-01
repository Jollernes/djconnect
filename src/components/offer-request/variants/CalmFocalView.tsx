import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CreditCard,
  FileText,
  Mail,
  MessageSquareText,
  Users,
} from "lucide-react";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  deriveActivityEvents,
  formatExpectedFromRemaining,
  seenCount,
} from "@/components/offer-request/shared";
import { cn } from "@/lib/utils";

/**
 * Variant A — Calm focal point.
 *
 * One pulsing radar/breathing animation in the middle of the page, a clear
 * deadline above it, a single rotating activity line below it, and explicit
 * reassurance that the customer doesn't need to stay on the page.
 *
 * The page should feel like a meditation, not a control panel — only one
 * thing is moving at a time, and motion is gentle.
 *
 * A subtle 4-step progress indicator (a quieter cousin of variant B's
 * stepper) sits between the focal and the ticker so the customer always
 * knows roughly where the request is in the process.
 */
type StageId = "sent" | "reviewing" | "quoting" | "choose";
type StageState = "done" | "current" | "todo";

const STAGE_ORDER: StageId[] = ["sent", "reviewing", "quoting", "choose"];
const STAGE_LABEL: Record<StageId, string> = {
  sent: "Sent",
  reviewing: "Reviewing",
  quoting: "Quoting",
  choose: "Choose",
};

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

  const stages = useMemo(() => buildStages(agg), [agg]);
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

          {/* Subtle progress micro-stepper */}
          <MicroStepper stages={stages} />

          {/* Activity ticker — one line at a time, fades in/out */}
          <div className="mt-6 h-6 w-full overflow-hidden">
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

      {/* "What happens now?" — quiet collapsible disclosure. Closed by
          default so it doesn't compete with the focal animation, but
          discoverable for first-time customers who want reassurance. */}
      <WhatHappensNow agg={agg} />

      {/* Quotes appear quietly below once any have arrived */}
      {hasAnyQuote && quotesSection ? (
        <section>{quotesSection}</section>
      ) : null}
    </div>
  );
}

/**
 * Closed-by-default disclosure explaining the 4 steps from brief to
 * booking. Uses the same accordion visual language as `BriefRecap` so
 * the customer immediately understands how it behaves.
 */
function WhatHappensNow({ agg }: { agg: ReturnType<typeof aggregateOf> }) {
  const [open, setOpen] = useState(false);

  const steps: { icon: typeof FileText; title: string; body: string }[] = [
    {
      icon: FileText,
      title: "Your brief is sent",
      body:
        agg.total > 0
          ? `We've forwarded your details to ${agg.total} matched DJ${agg.total === 1 ? "" : "s"} who fit your event, date and budget.`
          : "We've forwarded your details to the DJs who fit your event, date and budget.",
    },
    {
      icon: Users,
      title: "DJs review and respond",
      body:
        "Each DJ checks availability and either prepares a personal quote or lets us know they're not available. Most reply within a few hours.",
    },
    {
      icon: MessageSquareText,
      title: "Up to 3 personal quotes arrive",
      body:
        "You'll get up to 3 quotes within 24 hours — by email and on this page. No need to refresh; new quotes appear automatically.",
    },
    {
      icon: CreditCard,
      title: "Compare and book with escrow",
      body:
        "Compare prices and personal messages, ask the DJs questions, and book your favourite. The deposit is held in secure escrow until after your event.",
    },
  ];

  return (
    <section className="rounded-2xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            While you wait
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            What happens now?
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60"
          >
            <ol className="space-y-5 px-5 py-5">
              {steps.map((s, idx) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-foreground/80"
                  >
                    <s.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2 text-sm font-medium text-foreground">
                      <span className="tabular-nums text-muted-foreground">
                        {idx + 1}.
                      </span>
                      {s.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
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

/**
 * Tiny, hairline-style 4-step indicator. Quieter cousin of variant B —
 * dots are 6-8px instead of 32px, no big circles, no Check icon, labels
 * are micro-uppercase. Sits inside the focal section as orientation
 * without pulling focus from the breathing animation above.
 */
function MicroStepper({
  stages,
}: {
  stages: { id: StageId; label: string; state: StageState }[];
}) {
  return (
    <ol
      aria-label="Request progress"
      className="mt-8 flex w-full max-w-xs items-center"
    >
      {stages.map((s, idx) => (
        <li
          key={s.id}
          className="relative flex flex-1 flex-col items-center text-center"
        >
          {/* Connector to the next dot */}
          {idx < stages.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute left-1/2 top-[3px] h-px w-full -translate-y-1/2",
                s.state === "done"
                  ? "bg-foreground/30"
                  : "bg-border/60",
              )}
            />
          )}

          <span className="relative z-10 flex h-1.5 w-1.5 items-center justify-center">
            {s.state === "current" ? (
              <>
                <motion.span
                  className="absolute inset-[-3px] rounded-full bg-foreground/15"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative h-1.5 w-1.5 rounded-full bg-foreground" />
              </>
            ) : s.state === "done" ? (
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-border" />
            )}
          </span>

          <span
            className={cn(
              "mt-2 text-[10px] uppercase tracking-[0.12em]",
              s.state === "current"
                ? "text-foreground"
                : s.state === "done"
                  ? "text-foreground/60"
                  : "text-muted-foreground/70",
            )}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function buildStages(agg: ReturnType<typeof aggregateOf>): {
  id: StageId;
  label: string;
  state: StageState;
}[] {
  const reviewing = agg.inProgress > 0 || (agg.awaiting > 0 && agg.quotesReady === 0);
  const quoting = agg.quotesReady > 0 && agg.quotesReady < 3;
  const ready = agg.quotesReady >= 3;

  const currentId: StageId = ready
    ? "choose"
    : quoting
      ? "quoting"
      : reviewing
        ? "reviewing"
        : "sent";

  const currentIdx = STAGE_ORDER.indexOf(currentId);
  return STAGE_ORDER.map((id, idx) => ({
    id,
    label: STAGE_LABEL[id],
    state: idx < currentIdx ? "done" : idx === currentIdx ? "current" : "todo",
  }));
}


