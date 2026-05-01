import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  formatExpectedFromRemaining,
  seenCount,
} from "@/components/offer-request/shared";
import { cn } from "@/lib/utils";

/**
 * Variant B — Stepper / progress tracker.
 *
 * Familiar order-tracking pattern (Domino's pizza tracker, Stripe payouts,
 * Apple Wallet shipments). Four horizontal stages, current one highlighted
 * with a single subtle pulse. The customer always knows exactly where they
 * are in the process.
 */
type StageId = "sent" | "reviewing" | "quoting" | "choose";
type StageState = "done" | "current" | "todo";

export function SteppedTrackerView({
  record,
  djCatalog,
  remainingHours,
  quotesSection,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  remainingHours: number;
  quotesSection?: React.ReactNode;
}) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const stages = useMemo(() => buildStages(agg), [agg]);
  const eta = formatExpectedFromRemaining(record, remainingHours);
  const seen = seenCount(record);
  const current = stages.find((s) => s.state === "current") ?? stages[stages.length - 1];

  // Tiny per-DJ glance row used in the stage card
  const recentDJs = record.slots.slice(0, 6).map((s) => {
    const dj = djCatalog.find((d) => d.id === s.djId);
    return {
      slot: s,
      dj,
      label:
        s.status === "quote_received"
          ? "Quote in"
          : s.status === "confirmed_preparing"
            ? "Preparing"
            : s.status === "declined"
              ? "Unavailable"
              : "Reviewing",
    };
  });

  return (
    <div className="space-y-10">
      <section>
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Order in progress
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight md:text-[28px]">
            {agg.quotesReady >= 3
              ? "Your 3 quotes are ready"
              : eta
                ? `Quotes expected by ${eta}`
                : "Your DJs are reviewing your brief"}
          </h1>
        </header>

        <Stepper stages={stages} />

        {/* Current-stage detail card */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{current.label}</h2>
            <p className="text-xs text-muted-foreground">
              Stage {stages.indexOf(current) + 1} of {stages.length}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {stageBody(current.id, agg, seen)}
          </p>

          {/* Per-DJ glance — small chips, only meaningful in stages 2 & 3 */}
          {(current.id === "reviewing" || current.id === "quoting") &&
            recentDJs.length > 0 && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {recentDJs.map(({ slot, dj, label }) => (
                  <li
                    key={slot.djId}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm",
                      slot.status === "quote_received" && "border-emerald-300/50 bg-emerald-50/30",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        slot.status === "quote_received" && "bg-emerald-500",
                        slot.status === "confirmed_preparing" && "bg-amber-500",
                        slot.status === "awaiting_response" && "bg-muted-foreground/40",
                        slot.status === "declined" && "bg-destructive/60",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {dj?.stage_name ?? "DJ"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            )}

          <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            We'll email you the moment each quote arrives.
          </p>
        </div>
      </section>

      {agg.quotesReady > 0 && quotesSection ? (
        <section>{quotesSection}</section>
      ) : null}
    </div>
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

  // Determine current stage. Stages progress monotonically.
  const currentId: StageId = ready
    ? "choose"
    : quoting
      ? "quoting"
      : reviewing
        ? "reviewing"
        : "sent";

  const order: StageId[] = ["sent", "reviewing", "quoting", "choose"];
  const labels: Record<StageId, string> = {
    sent: "Brief sent",
    reviewing: "DJs reviewing",
    quoting: "Quotes arriving",
    choose: "You choose",
  };

  const currentIdx = order.indexOf(currentId);
  return order.map((id, idx) => ({
    id,
    label: labels[id],
    state: idx < currentIdx ? "done" : idx === currentIdx ? "current" : "todo",
  }));
}

function stageBody(
  id: StageId,
  agg: ReturnType<typeof aggregateOf>,
  seen: number,
): string {
  switch (id) {
    case "sent":
      return `Your brief was sent to ${agg.total} matched DJ${agg.total === 1 ? "" : "s"}.`;
    case "reviewing":
      return `${seen} of ${agg.total} DJ${agg.total === 1 ? "" : "s"} have already opened your request. Most reply within 4 hours.`;
    case "quoting":
      return `${agg.quotesReady} of up to 3 personal quote${agg.quotesReady === 1 ? "" : "s"} ${agg.quotesReady === 1 ? "is" : "are"} in. The rest are on the way.`;
    case "choose":
      return "All 3 quotes are ready. Compare them, message the DJs, or book directly with escrow.";
  }
}

function Stepper({
  stages,
}: {
  stages: { id: StageId; label: string; state: StageState }[];
}) {
  return (
    <ol className="relative flex items-start gap-2">
      {/* Connecting line */}
      <span
        className="pointer-events-none absolute left-4 right-4 top-4 h-px bg-border/60"
        aria-hidden
      />
      {stages.map((s) => (
        <li key={s.id} className="relative flex flex-1 flex-col items-center gap-2 text-center">
          <StageDot state={s.state} />
          <span
            className={cn(
              "text-[11px] leading-tight md:text-xs",
              s.state === "current"
                ? "font-medium text-foreground"
                : s.state === "done"
                  ? "text-foreground/70"
                  : "text-muted-foreground",
            )}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StageDot({ state }: { state: StageState }) {
  if (state === "done") {
    return (
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 text-white">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative z-10 flex h-8 w-8 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-foreground/15"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative h-3 w-3 rounded-full bg-foreground" />
      </span>
    );
  }
  return (
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background">
      <span className="h-2 w-2 rounded-full bg-border" />
    </span>
  );
}
