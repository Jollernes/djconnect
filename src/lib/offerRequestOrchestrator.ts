/**
 * Client-side simulation of the offer-request orchestration pipeline.
 *
 * Real behaviour we are simulating:
 *  1. Match 6-8 DJs by criteria (event type, geographic coverage, setup
 *     fit, calendar not blocked).
 *  2. Notify all matched DJs simultaneously (email + SMS + push).
 *  3. DJs respond within 24h with one of: quote / decline / time-out.
 *  4. The first 3 quotes become the customer's offers.
 *  5. If <3 quotes after 12h, expand by 3 more matched DJs.
 *  6. If <3 quotes after 36h, alert the customer to review what's ready.
 *
 * Until we have a real backend, the entire pipeline runs client-side. Each
 * request precomputes a deterministic-feel timeline at creation, stored in
 * `localStorage`, and {@link advanceRecord} advances the simulation each
 * time the live progress page ticks. Time is compressed so the demo runs
 * in ~3 minutes instead of ~36 hours.
 */
import {
  newRequestId,
  writeRecord,
  type DJSlot,
  type DeclineReason,
  type NotificationLogEntry,
  type OfferRequestRecord,
  type Quote,
} from "./offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import type { OfferRequest } from "@/hooks/useOfferRequest";
import type { OfferEventTypeId } from "@/lib/offerRequestContent";

// Demo timing. windowHours stays at 24 (the real value) — `compressionFactor`
// scales wall-clock time so the demo finishes in roughly 3 minutes.
const DEFAULT_WINDOW_HOURS = 24;
// 1 wall-clock minute represents 8 simulated hours -> 24h fits in 3 minutes.
const DEFAULT_COMPRESSION = (60 * 60 * 8) / 60; // 480 sim-seconds per real second
const INITIAL_COHORT_SIZE = 6;
const EXPANSION_COHORT_SIZE = 3;

const EXPANSION_THRESHOLD_FRACTION = 12 / 24; // 12h / 24h = 0.5
const ALERT_THRESHOLD_FRACTION = 36 / 24; // 36h / 24h = 1.5

const PACKAGE_BASE_PRICE: Record<"small" | "medium" | "large", number> = {
  small: 350000, // 3,500 DKK
  medium: 650000, // 6,500 DKK
  large: 1100000, // 11,000 DKK
};

const QUOTE_MESSAGE_TEMPLATES = [
  "Hej {name}! Jeg har lige tjekket kalenderen for {date} — den er fri. Jeres event lyder fantastisk, og {hook}. Jeg har vedhæftet et tilbud baseret på {setup}-setup. Skriv endelig hvis I vil ringe sammen, så kan vi tale om opvarmning og første dans.",
  "Tak for forespørgslen! {date} er ledig hos mig. Jeg arbejder fast med {hook}, og jeg lover en aften I kan mærke i kroppen dagen efter. Tilbuddet dækker komplet lyd + lys i {setup}-størrelse.",
  "Hej {name} 👋 Jeg er ledig den {date} og {hook}. Jeg vedhæfter et personligt tilbud — pris inkluderer komplet {setup}-rig, opsætning, mic til taler, og selvfølgelig en pause-playlist før jeg går på.",
  "Spændende event! {date} er fri. Jeg har {hook} og kan både køre med og uden visning. Tilbuddet er for {setup}-setup; sig til hvis I vil have noget tilføjet (uplighting, ekstra mic, karaoke etc.).",
];

const QUOTE_HOOKS = [
  "elsker bryllupsfester med en blanding af gamle hits og nye bangers",
  "har spillet over 80 events sidste år — fra intime middage til store baller",
  "bygger ofte sættet sammen med jer i ugen op til",
  "har selv en playlist med jeres ønskegenrer klar",
  "spiller både i kirken til ceremonien og om aftenen til festen",
  "tager altid backup-udstyr med, så aftenen aldrig stopper",
];

const DECLINE_REASONS: DeclineReason[] = [
  "fully_booked",
  "not_available",
  "out_of_coverage",
];

// ---------- Public API ----------

export function createRequestRecord(
  brief: OfferRequest,
  djs: DJProfileWithRelations[],
  options: { customerId?: string | null } = {},
): OfferRequestRecord {
  const id = newRequestId();
  const now = Date.now();
  const ranked = rankDJs(djs, brief);
  const picked = ranked.slice(0, INITIAL_COHORT_SIZE);
  const slots = picked.map((dj, idx) =>
    buildSlot({ dj, idx, brief, cohort: "initial", notifiedAtMs: now }),
  );
  const notifications = picked.flatMap((dj) =>
    notifyDJ({ dj, brief, ts: now, requestId: id }),
  );
  notifications.unshift(notifyCustomerCreated({ brief, ts: now, requestId: id }));

  const record: OfferRequestRecord = {
    id,
    createdAtMs: now,
    customerId: options.customerId ?? undefined,
    brief,
    matchedEventType: brief.eventType,
    compressionFactor: DEFAULT_COMPRESSION,
    windowHours: DEFAULT_WINDOW_HOURS,
    expansionTriggered: false,
    alertedAt36h: false,
    slots,
    notifications,
  };
  // Note: status transitions are computed on demand in advanceRecord — we
  // only persist the schedule here and let the page tick advance reality.
  writeRecord(record);
  return record;
}

/**
 * Advance the record to the current wall-clock time. Pure function — does
 * not mutate the input. Returns a new record (and a list of notifications
 * that should be flashed as toasts).
 */
export function advanceRecord(
  record: OfferRequestRecord,
  djCatalog: DJProfileWithRelations[],
  nowMs: number,
): {
  record: OfferRequestRecord;
  changed: boolean;
  newNotifications: NotificationLogEntry[];
} {
  const elapsedSimMs =
    (nowMs - record.createdAtMs) * record.compressionFactor;
  const elapsedHours = elapsedSimMs / (60 * 60 * 1000);

  let changed = false;
  const newNotifications: NotificationLogEntry[] = [];

  // Step 1: advance each existing slot through its scheduled timeline.
  let updatedSlots = record.slots.map((slot) => {
    const next = transitionSlot(slot, elapsedHours, record);
    if (next !== slot) {
      changed = true;
      const note = notificationForTransition({
        slot: next,
        previous: slot,
        record,
        ts: nowMs,
      });
      if (note) newNotifications.push(note);
    }
    return next;
  });

  // Step 2: re-rank quotes — first 3 valid quotes (by responded-at) are surfaced.
  updatedSlots = surfaceTopThreeQuotes(updatedSlots);

  // Step 3: expansion — at the 12h mark (50% of 24h), if <3 quotes,
  // pull in 3 more matched DJs.
  let expansionTriggered = record.expansionTriggered;
  if (!expansionTriggered && elapsedHours >= record.windowHours * EXPANSION_THRESHOLD_FRACTION) {
    const quoteCount = updatedSlots.filter((s) => s.status === "quote_received").length;
    expansionTriggered = true;
    if (quoteCount < 3) {
      const existingIds = new Set(updatedSlots.map((s) => s.djId));
      const ranked = rankDJs(djCatalog, record.brief);
      const expansion = ranked
        .filter((dj) => !existingIds.has(dj.id))
        .slice(0, EXPANSION_COHORT_SIZE);
      const newSlots = expansion.map((dj, idx) =>
        buildSlot({
          dj,
          idx: updatedSlots.length + idx,
          brief: record.brief,
          cohort: "expansion",
          notifiedAtMs: nowMs,
        }),
      );
      updatedSlots = [...updatedSlots, ...newSlots];
      changed = true;
      newNotifications.push(
        notifyCustomerExpansion({
          brief: record.brief,
          requestId: record.id,
          ts: nowMs,
          extraCount: expansion.length,
        }),
      );
      for (const dj of expansion) {
        newNotifications.push(...notifyDJ({ dj, brief: record.brief, ts: nowMs, requestId: record.id }));
      }
    }
  }

  // Step 4: 36h alert — notify customer to review what's there if we still
  // don't have 3.
  let alertedAt36h = record.alertedAt36h;
  if (!alertedAt36h && elapsedHours >= record.windowHours * ALERT_THRESHOLD_FRACTION) {
    const quoteCount = updatedSlots.filter((s) => s.status === "quote_received").length;
    alertedAt36h = true;
    if (quoteCount < 3) {
      changed = true;
      newNotifications.push(
        notifyCustomerLowQuoteAlert({
          brief: record.brief,
          requestId: record.id,
          ts: nowMs,
          quoteCount,
        }),
      );
    }
  }

  if (
    !changed &&
    expansionTriggered === record.expansionTriggered &&
    alertedAt36h === record.alertedAt36h
  ) {
    return { record, changed: false, newNotifications: [] };
  }

  const next: OfferRequestRecord = {
    ...record,
    slots: updatedSlots,
    expansionTriggered,
    alertedAt36h,
    notifications: [...record.notifications, ...newNotifications],
  };
  return { record: next, changed: true, newNotifications };
}

// ---------- Aggregates / derived ----------

export function aggregateOf(record: OfferRequestRecord) {
  const quotesReady = record.slots.filter((s) => s.status === "quote_received");
  const inProgress = record.slots.filter((s) => s.status === "confirmed_preparing");
  const awaiting = record.slots.filter((s) => s.status === "awaiting_response");
  const declined = record.slots.filter((s) => s.status === "declined");
  return {
    quotesReady: quotesReady.length,
    inProgress: inProgress.length,
    awaiting: awaiting.length,
    declined: declined.length,
    total: record.slots.length,
    offers: record.slots.filter((s) => s.isOffer && s.quote),
  };
}

export function realHoursElapsed(record: OfferRequestRecord, nowMs: number): number {
  return (nowMs - record.createdAtMs) * record.compressionFactor / (60 * 60 * 1000);
}

export function realHoursRemaining(record: OfferRequestRecord, nowMs: number): number {
  return Math.max(0, record.windowHours - realHoursElapsed(record, nowMs));
}

// ---------- Implementation details ----------

type EventTypeMatch = {
  match: boolean;
  reason?: DeclineReason;
};

function eventTypeMatch(
  dj: DJProfileWithRelations,
  eventType: OfferEventTypeId | undefined,
): EventTypeMatch {
  if (!eventType) return { match: true };
  const tags = (dj.event_types ?? []).map((e) => e.id);
  // Most DJs serve weddings, birthdays, private parties; match permissively.
  if (tags.length === 0) return { match: true };
  if (tags.includes(eventType)) return { match: true };
  // Birthdays/private parties are interchangeable for many DJs
  if (eventType === "birthday" && tags.includes("private_party")) return { match: true };
  if (eventType === "private_party" && tags.includes("birthday")) return { match: true };
  if (eventType === "corporate_party" && tags.includes("corporate_event")) return { match: true };
  return { match: false, reason: "not_available" };
}

function rankDJs(djs: DJProfileWithRelations[], brief: OfferRequest): DJProfileWithRelations[] {
  const desiredCity = brief.city ?? brief.customCity ?? "";
  const desiredSetup = brief.setupSize;

  // Score every DJ; we'll then sort and slice. We do *not* exclude DJs by
  // hard match — a real DJ may decline based on coverage, and that's part
  // of the simulation. We just rank good fits first.
  return [...djs]
    .map((dj) => {
      let score = 0;
      // Event type fit
      if (eventTypeMatch(dj, brief.eventType).match) score += 100;
      // City fit (exact or in DJ's travel coverage proxy)
      const djCity = dj.base_location ?? dj.profile.city ?? "";
      if (djCity && desiredCity && djCity.toLowerCase() === desiredCity.toLowerCase()) {
        score += 60;
      } else if (djCity && desiredCity) {
        score += 20;
      }
      // Setup fit
      if (desiredSetup && dj.setup_size === desiredSetup) score += 30;
      // Featured / verified DJs surface first
      if (dj.is_featured) score += 20;
      if (dj.verification_status === "approved") score += 10;
      // Rating tiebreaker
      score += (dj.rating_average ?? 4.5) * 4;
      return { dj, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ dj }) => dj);
}

type SlotPlanInput = {
  dj: DJProfileWithRelations;
  idx: number;
  brief: OfferRequest;
  cohort: "initial" | "expansion";
  notifiedAtMs: number;
};

/**
 * Plan a DJ's response timeline at notification time. We pre-roll dice for:
 *  - whether they respond at all (75%)
 *  - if responding, whether with a quote (65%) or decline (35%)
 *  - when they enter "preparing" (between 5–60% of window)
 *  - when they finalise the response (preparing + 5–25% of window)
 *
 * The actual transitions happen in {@link transitionSlot} based on these
 * pre-rolled timestamps.
 */
function buildSlot({ dj, idx: _idx, brief, cohort, notifiedAtMs }: SlotPlanInput): DJSlot {
  const respondAtAll = Math.random() < 0.78;
  const willQuote = Math.random() < 0.7;
  const startFraction = 0.04 + Math.random() * 0.5;
  const responseExtraFraction = 0.04 + Math.random() * 0.18;

  const plan: DJSlot = {
    djId: dj.id,
    username: dj.username,
    notifiedAtMs,
    status: "awaiting_response",
    cohort,
    isOffer: false,
    thread: [],
    callbackRequested: false,
    // Stored under non-public keys via JSON.stringify. We keep the rolls here
    // by re-using existing optional fields: `preparingAtMs` becomes the
    // *scheduled* start of preparing in real wall-clock ms; `respondedAtMs`
    // becomes the scheduled response time. Once status flips, those values
    // already represent the real moment they happened, so this dual-use is
    // safe. We compute schedules in *simulated* hours and convert.
  };

  if (!respondAtAll) {
    return plan;
  }

  const startSimHours = startFraction * DEFAULT_WINDOW_HOURS;
  const responseSimHours = startSimHours + responseExtraFraction * DEFAULT_WINDOW_HOURS;
  // Convert sim hours -> wall-clock ms from notifiedAtMs.
  const startWallMs = notifiedAtMs + (startSimHours * 60 * 60 * 1000) / DEFAULT_COMPRESSION;
  const respondWallMs = notifiedAtMs + (responseSimHours * 60 * 60 * 1000) / DEFAULT_COMPRESSION;

  // Build the planned quote up-front. If they decline, we won't surface it.
  const quote = willQuote ? buildQuote({ dj, brief, responseSimHours }) : undefined;
  const declineReason = willQuote ? undefined : pickDeclineReason(dj, brief);

  return {
    ...plan,
    preparingAtMs: startWallMs,
    respondedAtMs: respondWallMs,
    quote,
    declineReason,
  };
}

function buildQuote({
  dj,
  brief,
  responseSimHours,
}: {
  dj: DJProfileWithRelations;
  brief: OfferRequest;
  responseSimHours: number;
}): Quote {
  const setup = (brief.setupSize ?? dj.setup_size ?? "medium") as "small" | "medium" | "large";
  const base = PACKAGE_BASE_PRICE[setup];
  // Each DJ adds +/- 25% spread, plus a personal premium tied to their rating
  const spread = (Math.random() - 0.4) * 0.5;
  const ratingBoost = ((dj.rating_average ?? 4.5) - 4.5) * 0.08;
  const priceMinor = Math.max(150000, Math.round(base * (1 + spread + ratingBoost)));
  const template = QUOTE_MESSAGE_TEMPLATES[Math.floor(Math.random() * QUOTE_MESSAGE_TEMPLATES.length)] ?? QUOTE_MESSAGE_TEMPLATES[0];
  const hook = QUOTE_HOOKS[Math.floor(Math.random() * QUOTE_HOOKS.length)] ?? QUOTE_HOOKS[0];
  const message = template
    .replace("{name}", brief.contact.name?.split(" ")[0] ?? "der")
    .replace("{date}", formatDanishDate(brief.date))
    .replace("{setup}", setup)
    .replace("{hook}", hook);
  return {
    priceMinor,
    packageId: setup,
    message,
    responseTimeMinutes: Math.round(responseSimHours * 60),
  };
}

function pickDeclineReason(
  dj: DJProfileWithRelations,
  brief: OfferRequest,
): DeclineReason {
  const desiredCity = (brief.city ?? brief.customCity ?? "").toLowerCase();
  const djCity = (dj.base_location ?? dj.profile.city ?? "").toLowerCase();
  if (desiredCity && djCity && djCity !== desiredCity && Math.random() < 0.45) {
    return "out_of_coverage";
  }
  return DECLINE_REASONS[Math.floor(Math.random() * DECLINE_REASONS.length)] ?? "fully_booked";
}

function transitionSlot(
  slot: DJSlot,
  _elapsedSimHours: number,
  _record: OfferRequestRecord,
): DJSlot {
  // The slot was "rolled" at notification time — its preparingAtMs and
  // respondedAtMs are already real wall-clock targets. We just advance it
  // through the states based on the current real time.
  const nowMs = Date.now();
  // No-response path: timeline never set, or DJ rolled "not responding".
  if (slot.status === "quote_received" || slot.status === "declined") return slot;

  if (slot.preparingAtMs && nowMs >= slot.preparingAtMs && slot.status === "awaiting_response") {
    if (slot.quote || slot.declineReason) {
      // Move into preparing when due
      slot = { ...slot, status: "confirmed_preparing" };
    }
  }
  if (slot.respondedAtMs && nowMs >= slot.respondedAtMs) {
    if (slot.quote) {
      return { ...slot, status: "quote_received" };
    }
    if (slot.declineReason) {
      return { ...slot, status: "declined" };
    }
  }
  return slot;
}

function surfaceTopThreeQuotes(slots: DJSlot[]): DJSlot[] {
  const orderedQuotes = slots
    .filter((s) => s.status === "quote_received" && s.respondedAtMs)
    .sort((a, b) => (a.respondedAtMs ?? 0) - (b.respondedAtMs ?? 0))
    .slice(0, 3);
  const offerIds = new Set(orderedQuotes.map((s) => s.djId));
  let mutated = false;
  const next = slots.map((s) => {
    const wantOffer = offerIds.has(s.djId);
    if (wantOffer !== s.isOffer) {
      mutated = true;
      return { ...s, isOffer: wantOffer };
    }
    return s;
  });
  return mutated ? next : slots;
}

// ---------- Notifications ----------

function notifyDJ({
  dj,
  brief,
  ts,
  requestId,
}: {
  dj: DJProfileWithRelations;
  brief: OfferRequest;
  ts: number;
  requestId: string;
}): NotificationLogEntry[] {
  const summary = `${formatDanishDate(brief.date)} · ${brief.city ?? brief.customCity ?? "Denmark"} · ${brief.guestBucket ?? "guests"} guests`;
  const subject = `New ${brief.eventType ?? "event"} request — respond within 24h`;
  const body = `Hi ${dj.stage_name}, ${brief.contact.name} just sent a brief: ${summary}. Open the deep link to send a personal quote: /dj/quote-requests/${requestId}/${dj.id}`;
  const channels: Array<{ ch: "email" | "sms" | "push"; to: string }> = [
    { ch: "email", to: dj.profile.email ?? `${dj.username}@dj.local` },
  ];
  if (dj.profile.phone) channels.push({ ch: "sms", to: dj.profile.phone });
  channels.push({ ch: "push", to: `device:${dj.username}` });
  return channels.map((c, i) => ({
    id: `${ts}-${dj.id}-${c.ch}-${i}`,
    ts,
    channel: c.ch,
    to: c.to,
    audience: "dj",
    subject,
    body,
  }));
}

function notifyCustomerCreated({
  brief,
  ts,
  requestId,
}: {
  brief: OfferRequest;
  ts: number;
  requestId: string;
}): NotificationLogEntry {
  return {
    id: `${ts}-customer-created`,
    ts,
    channel: "email",
    to: brief.contact.email,
    audience: "customer",
    subject: "We're contacting DJs for your event now",
    body: `Hi ${brief.contact.name?.split(" ")[0] ?? "there"}, we sent your brief to a first batch of DJs and you'll see live progress here: /my-requests/${requestId}. Expect up to 3 personal quotes within 24 hours.`,
  };
}

function notifyCustomerExpansion({
  brief,
  requestId,
  ts,
  extraCount,
}: {
  brief: OfferRequest;
  requestId: string;
  ts: number;
  extraCount: number;
}): NotificationLogEntry {
  return {
    id: `${ts}-customer-expansion`,
    ts,
    channel: "email",
    to: brief.contact.email,
    audience: "customer",
    subject: "We've expanded your shortlist",
    body: `Hi ${brief.contact.name?.split(" ")[0] ?? "there"}, we just contacted ${extraCount} more matched DJs to make sure you get 3 strong offers. Live progress: /my-requests/${requestId}.`,
  };
}

function notifyCustomerLowQuoteAlert({
  brief,
  requestId,
  ts,
  quoteCount,
}: {
  brief: OfferRequest;
  requestId: string;
  ts: number;
  quoteCount: number;
}): NotificationLogEntry {
  return {
    id: `${ts}-customer-36h`,
    ts,
    channel: "email",
    to: brief.contact.email,
    audience: "customer",
    subject: `${quoteCount} quote${quoteCount === 1 ? "" : "s"} ready — review now or wait for more?`,
    body: `Hi ${brief.contact.name?.split(" ")[0] ?? "there"}, we have ${quoteCount} quote${quoteCount === 1 ? "" : "s"} ready. You can review now or wait — we'll keep matching: /my-requests/${requestId}.`,
  };
}

function notificationForTransition({
  slot,
  previous,
  record,
  ts,
}: {
  slot: DJSlot;
  previous: DJSlot;
  record: OfferRequestRecord;
  ts: number;
}): NotificationLogEntry | null {
  if (slot.status === previous.status) return null;
  if (slot.status === "quote_received") {
    return {
      id: `${ts}-${slot.djId}-quote`,
      ts,
      channel: "email",
      to: record.brief.contact.email,
      audience: "customer",
      subject: "New quote received",
      body: `A new quote has arrived from ${slot.username}. Open /my-requests/${record.id} to review.`,
    };
  }
  return null;
}

// ---------- Helpers ----------

function formatDanishDate(d?: string | null): string {
  if (!d) return "your event date";
  try {
    return new Date(d).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
