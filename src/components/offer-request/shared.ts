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
        ? `Brief sendt. Vi matchede ${initialCount} DJ${initialCount === 1 ? "" : "s"} til dit event og kontaktede dem.`
        : "Brief sendt. Vi matcher DJs til dit event…",
  });

  for (const slot of record.slots) {
    const dj = djCatalog.find((d) => d.id === slot.djId);
    const name = dj?.stage_name ?? "En DJ";
    const avatar = dj?.profile?.avatar_url ?? null;

    if (slot.cohort === "expansion") {
      // "Expansion cohort joined" event will be added once below; per-slot
      // notification still useful for the feed.
    }

    events.push({
      id: `${slot.djId}-notified`,
      ts: slot.notifiedAtMs,
      kind: "dj_notified",
      text: `${name} modtog din forespørgsel`,
      djName: name,
      djAvatar: avatar,
    });

    if (slot.preparingAtMs) {
      events.push({
        id: `${slot.djId}-preparing`,
        ts: slot.preparingAtMs,
        kind: "dj_preparing",
        text: `${name} forbereder et tilbud`,
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
          text: `${name}s tilbud er klar`,
          djName: name,
          djAvatar: avatar,
        });
      } else if (slot.status === "declined") {
        const reason =
          slot.declineReason === "fully_booked"
            ? "fuldt booket den dato"
            : slot.declineReason === "out_of_coverage"
              ? "uden for området"
              : "ikke ledig den dato";
        events.push({
          id: `${slot.djId}-declined`,
          ts: slot.respondedAtMs,
          kind: "dj_declined",
          text: `${name} kan ikke tage denne — ${reason}`,
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
        text: `Vi tilføjede ${expansionSlots.length} flere matchede DJ${expansionSlots.length === 1 ? "" : "s"}, så du er sikker på at have valgmuligheder.`,
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
        "Det tager længere tid end normalt. Du kan gennemse det, der allerede er kommet ind, eller vente lidt længere.",
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
  if (events.length === 0) return "Matcher DJs til dit event…";
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
  const time = target.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `i dag kl. ${time}`;
  if (isTomorrow) return `i morgen kl. ${time}`;
  const weekday = target.toLocaleDateString("da-DK", { weekday: "long" });
  return `${weekday} kl. ${time}`;
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isSlotOf(slot: DJSlot, status: DJSlot["status"]): boolean {
  return slot.status === status;
}
