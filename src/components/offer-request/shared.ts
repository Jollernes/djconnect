import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";

export type ActivityEvent = {
  id: string;
  ts: number;
  kind:
    | "brief_sent"
    | "dj_notified"
    | "dj_preparing"
    | "quote_arrived"
    | "dj_declined"
    | "expansion"
    | "alert_36h";
  text: string;
  djName?: string;
  djAvatar?: string | null;
};

/**
 * Build a chronological list of human-readable events from a record's state.
 * Used by the conversational/feed variant of the live progress page; callers
 * may also use it to render compact activity tickers.
 */
export function deriveActivityEvents(
  record: OfferRequestRecord,
  djCatalog: DJProfileWithRelations[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const initialCount = record.slots.filter((s) => s.cohort === "initial").length;

  events.push({
    id: `brief-${record.createdAtMs}`,
    ts: record.createdAtMs,
    kind: "brief_sent",
    text:
      initialCount > 0
        ? `Brief sent. We matched ${initialCount} DJ${initialCount === 1 ? "" : "s"} to your event and contacted them.`
        : "Brief sent. We're matching DJs to your event…",
  });

  for (const slot of record.slots) {
    const dj = djCatalog.find((d) => d.id === slot.djId);
    const name = dj?.stage_name ?? "A DJ";
    const avatar = dj?.profile?.avatar_url ?? null;

    if (slot.cohort === "expansion") {
      // "Expansion cohort joined" event will be added once below; per-slot
      // notification still useful for the feed.
    }

    events.push({
      id: `${slot.djId}-notified`,
      ts: slot.notifiedAtMs,
      kind: "dj_notified",
      text: `${name} received your request`,
      djName: name,
      djAvatar: avatar,
    });

    if (slot.preparingAtMs) {
      events.push({
        id: `${slot.djId}-preparing`,
        ts: slot.preparingAtMs,
        kind: "dj_preparing",
        text: `${name} is preparing a quote`,
        djName: name,
        djAvatar: avatar,
      });
    }

    if (slot.respondedAtMs) {
      if (slot.status === "quote_received") {
        events.push({
          id: `${slot.djId}-quote`,
          ts: slot.respondedAtMs,
          kind: "quote_arrived",
          text: `${name}'s quote is in`,
          djName: name,
          djAvatar: avatar,
        });
      } else if (slot.status === "declined") {
        const reason =
          slot.declineReason === "fully_booked"
            ? "fully booked that date"
            : slot.declineReason === "out_of_coverage"
              ? "outside the area"
              : "not available that date";
        events.push({
          id: `${slot.djId}-declined`,
          ts: slot.respondedAtMs,
          kind: "dj_declined",
          text: `${name} can't take this one — ${reason}`,
          djName: name,
          djAvatar: avatar,
        });
      }
    }
  }

  if (record.expansionTriggered) {
    const expansionSlots = record.slots.filter((s) => s.cohort === "expansion");
    if (expansionSlots.length > 0) {
      events.push({
        id: `expansion`,
        ts: Math.min(...expansionSlots.map((s) => s.notifiedAtMs)) - 1,
        kind: "expansion",
        text: `We added ${expansionSlots.length} more matched DJ${expansionSlots.length === 1 ? "" : "s"} to be sure you have options.`,
      });
    }
  }

  if (record.alertedAt36h) {
    events.push({
      id: `alert-36h`,
      ts: record.createdAtMs +
        (36 / record.compressionFactor) * 60 * 60 * 1000,
      kind: "alert_36h",
      text:
        "It's taking longer than usual. You can review what's already in or wait a little longer.",
    });
  }

  return events.sort((a, b) => a.ts - b.ts);
}

/**
 * One-line "what's happening right now" summary used as a rotating ticker
 * in the calm focal variant. Returns the freshest meaningful sentence.
 */
export function tickerLineFor(
  record: OfferRequestRecord,
  djCatalog: DJProfileWithRelations[],
): string {
  const events = deriveActivityEvents(record, djCatalog);
  if (events.length === 0) return "Matching DJs to your event…";
  const last = events[events.length - 1];
  return last.text;
}

/**
 * Compute how many DJs have "seen" the request so far — for the calm
 * variant's subtle activity line.
 */
export function seenCount(record: OfferRequestRecord): number {
  return record.slots.filter(
    (s) =>
      s.status === "confirmed_preparing" ||
      s.status === "quote_received" ||
      s.status === "declined",
  ).length;
}

/**
 * Convert remaining real (compressed) hours into a human "Expected by …"
 * phrase.
 */
export function formatExpectedFromRemaining(
  record: OfferRequestRecord,
  remainingHours: number,
): string | null {
  if (remainingHours <= 0) return null;
  const realSecondsLeft =
    remainingHours * 60 * 60 * (1 / record.compressionFactor);
  const target = new Date(Date.now() + realSecondsLeft * 1000);
  return formatExpected(target);
}

export function formatExpected(target: Date): string {
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
  return target.toLocaleDateString("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isSlotOf(slot: DJSlot, status: DJSlot["status"]): boolean {
  return slot.status === status;
}
