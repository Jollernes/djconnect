import { useMemo } from "react";
import { motion } from "framer-motion";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

/**
 * Quiet status visualisation for an in-flight offer request.
 *
 * Design intent (Danish-minimalist):
 * - One sentence at the top answers the only question the customer has —
 *   "how many quotes do I have, when will the rest land".
 * - DJ list is a compact table: name + city + one status word + one tiny dot.
 * - No constant motion. The only animation is a single fade-in when a slot
 *   transitions to a new status (driven by `status` as the motion key).
 * - Single restrained accent (positive green for ready, muted slate for the
 *   rest, dim red for declined). No gradients, no rose/amber here.
 */

const STATUS_LABEL: Record<DJSlot["status"], string> = {
  awaiting_response: "Waiting",
  confirmed_preparing: "Preparing quote",
  quote_received: "Quote sent",
  declined: "Unavailable",
};

const DECLINE_LABEL: Record<NonNullable<DJSlot["declineReason"]>, string> = {
  fully_booked: "Fully booked",
  not_available: "Not available",
  out_of_coverage: "Out of coverage",
};

export function OfferProgressTracker({
  record,
  djCatalog,
  remainingHours,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  remainingHours: number;
  elapsedHours: number;
}) {
  const agg = useMemo(() => aggregateOf(record), [record]);

  // Order: ready first, preparing, waiting, declined last
  const sortedSlots = useMemo(() => {
    const order = (s: DJSlot) =>
      s.status === "quote_received"
        ? 0
        : s.status === "confirmed_preparing"
          ? 1
          : s.status === "awaiting_response"
            ? 2
            : 3;
    return [...record.slots].sort((a, b) => order(a) - order(b));
  }, [record.slots]);

  const target = quietETA(record, remainingHours);
  const headline = headlineFor(agg, target);

  return (
    <section
      aria-label="Request status"
      className="rounded-2xl border border-border/60 bg-card/40 p-5 md:p-6"
    >
      {/* Single sentence answers the only question */}
      <p className="text-base font-medium leading-relaxed text-foreground md:text-[17px]">
        {headline}
      </p>

      {/* Minimal numeric breakdown — only shown if non-trivial */}
      {agg.total > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {agg.quotesReady} of up to 3 quotes ready
          {agg.declined > 0 && ` · ${agg.declined} unavailable`}
        </p>
      )}

      {/* DJ status list */}
      <ul className="mt-5 divide-y divide-border/50 border-y border-border/50">
        {sortedSlots.map((slot) => (
          <SlotRow key={slot.djId} slot={slot} djCatalog={djCatalog} />
        ))}
      </ul>

      {/* Expansion + 36h alerts — quiet */}
      {record.expansionTriggered && (
        <CalmNote
          title="Expanded to more DJs"
          body="We didn't reach 3 quotes within the first window, so we've added 3 more matched DJs. They're being contacted now."
        />
      )}
      {record.alertedAt36h && agg.quotesReady < 3 && (
        <CalmNote
          title="You can review what's available now"
          body={
            agg.quotesReady > 0
              ? `${agg.quotesReady} quote${agg.quotesReady === 1 ? "" : "s"} are ready. You can wait for the remaining DJs or move ahead with what's here.`
              : "We haven't received 3 quotes yet. We'll keep trying — check back soon, or browse DJs directly."
          }
        />
      )}
    </section>
  );
}

function SlotRow({
  slot,
  djCatalog,
}: {
  slot: DJSlot;
  djCatalog: DJProfileWithRelations[];
}) {
  const dj = djCatalog.find((d) => d.id === slot.djId);
  const stage = dj?.stage_name ?? slot.username;
  const city = dj?.profile.city ?? dj?.base_location;
  const isExpansion = slot.cohort === "expansion";

  const subtle =
    slot.status === "declined" && slot.declineReason
      ? DECLINE_LABEL[slot.declineReason]
      : STATUS_LABEL[slot.status];

  return (
    <motion.li
      key={`${slot.djId}-${slot.status}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-4 py-3 text-sm"
    >
      <div className="flex min-w-0 items-center gap-3">
        <StatusDot status={slot.status} />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {stage}
            {isExpansion && (
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                · added later
              </span>
            )}
          </p>
          {city && <p className="truncate text-xs text-muted-foreground">{city}</p>}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-xs",
          slot.status === "quote_received"
            ? "text-emerald-700"
            : slot.status === "declined"
              ? "text-muted-foreground"
              : "text-muted-foreground",
        )}
      >
        {subtle}
      </span>
    </motion.li>
  );
}

function StatusDot({ status }: { status: DJSlot["status"] }) {
  if (status === "quote_received") {
    return (
      <span
        aria-label="Quote sent"
        className="grid h-2 w-2 shrink-0 place-items-center rounded-full bg-emerald-600"
      />
    );
  }
  if (status === "confirmed_preparing") {
    return (
      <span
        aria-label="Preparing quote"
        className="h-2 w-2 shrink-0 rounded-full ring-1 ring-foreground/40"
      />
    );
  }
  if (status === "declined") {
    return (
      <span
        aria-label="Declined"
        className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
      />
    );
  }
  return (
    <span
      aria-label="Waiting"
      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-border"
    />
  );
}

function CalmNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

function headlineFor(
  agg: ReturnType<typeof aggregateOf>,
  etaPhrase: string | null,
): string {
  if (agg.quotesReady === 0) {
    // Only DJs still in-flight count toward "awaiting" — declined DJs have
    // already responded.
    const active = agg.total - agg.declined;
    if (active === 0) {
      return "All matched DJs have responded — none were available this date.";
    }
    return etaPhrase
      ? `Awaiting quotes from ${active} matched DJ${active === 1 ? "" : "s"}. Expected ${etaPhrase}.`
      : `Awaiting quotes from ${active} matched DJ${active === 1 ? "" : "s"}.`;
  }
  if (agg.quotesReady >= 3) {
    return "Your 3 personal quotes are ready below.";
  }
  if (etaPhrase) {
    return `${agg.quotesReady} of up to 3 personal quote${agg.quotesReady === 1 ? "" : "s"} ready. Expected ${etaPhrase}.`;
  }
  return `${agg.quotesReady} of up to 3 personal quote${agg.quotesReady === 1 ? "" : "s"} ready.`;
}

function quietETA(record: OfferRequestRecord, remainingHours: number): string | null {
  if (remainingHours <= 0) return null;
  // Compressed timeline: convert remainingHours back to wall-clock seconds.
  const realSecondsLeft =
    remainingHours * 60 * 60 * (1 / record.compressionFactor);
  const target = new Date(Date.now() + realSecondsLeft * 1000);
  return formatExpected(target);
}

function formatExpected(target: Date): string {
  const now = new Date();
  const sameDay = target.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = target.toDateString() === tomorrow.toDateString();
  const time = target.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `today at ${time}`;
  if (isTomorrow) return `tomorrow at ${time}`;
  const weekday = target.toLocaleDateString("en-GB", { weekday: "long" });
  return `${weekday} at ${time}`;
}
