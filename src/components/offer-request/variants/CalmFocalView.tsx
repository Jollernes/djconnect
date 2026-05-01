import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
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

  const sortedSlots = useMemo(() => orderSlots(record.slots), [record.slots]);

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

      {/* Per-DJ cards with prominent imagery — avatars are the focal element
          of each card so the customer can quickly recognise who is on the
          job. Status text and dot stay quiet underneath. */}
      {sortedSlots.length > 0 && (
        <section>
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-medium tracking-tight text-foreground">
              Your matched DJs
            </h2>
            <p className="text-xs text-muted-foreground">
              {agg.quotesReady} of {agg.total} {agg.total === 1 ? "has" : "have"}{" "}
              sent a quote
            </p>
          </header>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {sortedSlots.map((slot) => (
              <DJAvatarCard key={slot.djId} slot={slot} djCatalog={djCatalog} />
            ))}
          </ul>
        </section>
      )}

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

function orderSlots(slots: DJSlot[]): DJSlot[] {
  const order = (s: DJSlot) =>
    s.status === "quote_received"
      ? 0
      : s.status === "confirmed_preparing"
        ? 1
        : s.status === "awaiting_response"
          ? 2
          : 3;
  return [...slots].sort((a, b) => order(a) - order(b));
}

const STATUS_COPY: Record<DJSlot["status"], string> = {
  awaiting_response: "Waiting",
  confirmed_preparing: "Preparing quote",
  quote_received: "Quote sent",
  declined: "Unavailable",
};

function DJAvatarCard({
  slot,
  djCatalog,
}: {
  slot: DJSlot;
  djCatalog: DJProfileWithRelations[];
}) {
  const dj = djCatalog.find((d) => d.id === slot.djId);
  const name = dj?.stage_name ?? slot.username;
  const city = dj?.profile?.city ?? dj?.base_location;
  const avatar = dj?.profile?.avatar_url ?? null;
  const isReady = slot.status === "quote_received";
  const isDeclined = slot.status === "declined";
  const initials = (dj?.stage_name ?? slot.username ?? "DJ")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-colors",
        isReady
          ? "border-emerald-300/60"
          : isDeclined
            ? "border-border/40"
            : "border-border/60",
      )}
    >
      {/* Larger image area — about 4:3 portrait crop */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-opacity",
              isDeclined && "opacity-60 grayscale",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-medium tracking-wide text-muted-foreground">
            {initials}
          </div>
        )}

        {/* Single tiny status dot, top-right */}
        <span
          aria-hidden
          className={cn(
            "absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-background",
            isReady && "bg-emerald-500",
            slot.status === "confirmed_preparing" && "bg-amber-500",
            slot.status === "awaiting_response" && "bg-muted-foreground/40",
            isDeclined && "bg-destructive/60",
          )}
        />
      </div>

      <div className="px-3 py-3">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {city && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {city}
          </p>
        )}
        <p
          className={cn(
            "mt-2 text-[11px] uppercase tracking-[0.12em]",
            isReady
              ? "text-emerald-700"
              : isDeclined
                ? "text-muted-foreground"
                : "text-muted-foreground",
          )}
        >
          {STATUS_COPY[slot.status]}
        </p>
      </div>
    </li>
  );
}
