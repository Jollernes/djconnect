/**
 * Persistent storage for "Get 3 offers" requests.
 *
 * Until the platform has a real backend, each request lives entirely in
 * `localStorage`. The orchestrator (see {@link offerRequestOrchestrator})
 * advances each request through its lifecycle on every page tick. Anyone
 * with the request id can load the live progress page — eventually a magic
 * link will bind that id to an authenticated customer profile.
 */
import type { OfferRequest } from "@/hooks/useOfferRequest";
import type { OfferEventTypeId } from "@/lib/offerRequestContent";

export type DJSlotStatus =
  | "awaiting_response"
  | "confirmed_preparing"
  | "quote_received"
  | "declined";

export type DeclineReason = "not_available" | "out_of_coverage" | "fully_booked";

export type Quote = {
  priceMinor: number;
  packageId: "small" | "medium" | "large";
  message: string;
  // Real-world response time in minutes (compressed to seconds in the simulation)
  responseTimeMinutes: number;
};

export type QuoteThreadMessage = {
  id: string;
  from: "customer" | "dj";
  text: string;
  ts: number;
};

export type DJSlot = {
  djId: string;
  username: string;
  notifiedAtMs: number;
  status: DJSlotStatus;
  preparingAtMs?: number;
  respondedAtMs?: number;
  declineReason?: DeclineReason;
  quote?: Quote;
  cohort: "initial" | "expansion";
  isOffer: boolean;
  // Customer actions on this slot
  thread: QuoteThreadMessage[];
  callbackRequested: boolean;
  bookedAtMs?: number;
};

export type OfferRequestRecord = {
  id: string;
  createdAtMs: number;
  /**
   * The logged-in customer's profile id at the time of submission, if any.
   * Anonymous submissions leave this undefined. Used to scope "My requests"
   * to the current user without a real backend.
   */
  customerId?: string;
  brief: OfferRequest;
  matchedEventType?: OfferEventTypeId;
  // Time-compression for the demo: 1 wall-clock second = `compressionFactor` real seconds.
  // The real spec calls for 24h / 12h / 36h thresholds; for the demo the
  // total simulation completes in ~3 minutes.
  compressionFactor: number;
  windowHours: number;
  expansionTriggered: boolean;
  alertedAt36h: boolean;
  slots: DJSlot[];
  // Mocked notification log so we can show the email/SMS/push that *would*
  // have been sent
  notifications: NotificationLogEntry[];
};

export type NotificationLogEntry = {
  id: string;
  ts: number;
  channel: "email" | "sms" | "push";
  to: string;
  audience: "customer" | "dj";
  subject: string;
  body: string;
};

const STORAGE_PREFIX = "djconnect.offerRequest.record.";
const INDEX_KEY = "djconnect.offerRequest.index";

export function storageKeyFor(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function readRecord(id: string): OfferRequestRecord | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(id));
    if (!raw) return null;
    return JSON.parse(raw) as OfferRequestRecord;
  } catch {
    return null;
  }
}

export function writeRecord(record: OfferRequestRecord): void {
  try {
    window.localStorage.setItem(storageKeyFor(record.id), JSON.stringify(record));
    addToIndex(record.id);
    window.dispatchEvent(
      new CustomEvent("offerRequest:update", { detail: { id: record.id } }),
    );
  } catch {
    // ignore quota / privacy failures
  }
}

export function listRequestIds(): string[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Returns every record stored on this device, sorted newest first.
 */
export function listRecords(): OfferRequestRecord[] {
  return listRequestIds()
    .map((id) => readRecord(id))
    .filter((r): r is OfferRequestRecord => r !== null)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

/**
 * Returns the records visible to the given customer. Pass `null` for the
 * anonymous (logged-out) view, which only sees legacy / un-tagged records.
 * Logged-in customers see records they created plus any legacy records that
 * pre-date user-scoped persistence.
 */
export function listRecordsForCustomer(
  customerId: string | null,
): OfferRequestRecord[] {
  const all = listRecords();
  if (customerId === null) {
    return all.filter((r) => !r.customerId);
  }
  return all.filter((r) => !r.customerId || r.customerId === customerId);
}

/**
 * Cheap ownership check used to gate dashboard detail pages. A record with
 * no `customerId` is treated as legacy / anonymous and visible to everyone.
 */
export function recordIsVisibleTo(
  record: OfferRequestRecord,
  customerId: string | null,
): boolean {
  if (!record.customerId) return true;
  return record.customerId === customerId;
}

function addToIndex(id: string): void {
  const ids = listRequestIds();
  if (!ids.includes(id)) {
    ids.push(id);
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  }
}

export function newRequestId(): string {
  // Short, copy-friendly id — base36 of timestamp + 4 random chars
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `${t}-${r}`;
}
