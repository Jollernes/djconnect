/**
 * Local persistence for direct booking requests sent from a DJ profile page.
 *
 * A booking request is *not* a payment. The customer fills out their event
 * details on a specific DJ's profile, sends the request, and waits for the
 * DJ to confirm before any escrow/payment step happens. Until we have a real
 * backend, requests live entirely in `localStorage` and are scoped to the
 * submitting customer (when one is logged in) so each customer only sees
 * their own bookings on the dashboard.
 */

export type BookingRequestStatus =
  | "pending_dj" // submitted, waiting for the DJ to confirm or adjust the price
  | "pending_customer" // DJ confirmed/adjusted the price; awaiting the customer's final confirmation + deposit
  | "pending_invoice" // customer chose invoice; deposit invoice issued and awaiting payment before the booking is confirmed
  | "confirmed" // customer confirmed and paid the 25% deposit; booking is locked in
  | "declined" // DJ declined; customer should pick another DJ
  | "expired"; // DJ never responded within the response window

/** How the customer pays the 25% deposit. */
export type PaymentMethod = "card" | "mobilepay" | "invoice";

/**
 * A price breakdown for a booking. The customer pays `fullPriceMinor` in
 * total; the `depositMinor` (25% of the full price) is paid up front on final
 * confirmation and *is* the platform fee. The remaining `payoutMinor` is the
 * DJ's payout, settled after the event.
 */
export type BookingPricing = {
  fullPriceMinor: number;
  depositPercent: number;
  depositMinor: number;
  payoutMinor: number;
};

export type BookingRequest = {
  id: string;
  customerId?: string; // undefined for anonymous (guest) submissions
  customerName?: string;
  createdAtMs: number;
  status: BookingRequestStatus;
  djId: string;
  djUsername: string;
  djStageName: string;
  djAvatarUrl?: string;
  djCity?: string;
  djCurrency: string;
  /** Estimated price snapshot at request time. `null` if DJ is "price on request". */
  pricing: BookingPricing | null;
  /**
   * The DJ's response: the confirmed (possibly adjusted) full price. Set when
   * the DJ moves the request to `pending_customer`. This is the authoritative
   * price the customer confirms and pays a deposit against.
   */
  djQuote?: BookingPricing & {
    respondedAtMs: number;
    changed: boolean;
    note?: string;
  };
  /**
   * The deposit invoice, set when the customer chooses to pay by invoice.
   * The booking stays in `pending_invoice` until the deposit on this invoice
   * is paid, at which point it becomes `confirmed`.
   */
  invoice?: {
    issuedAtMs: number;
    dueAtMs: number;
    amountMinor: number;
    number: string;
  };
  /** Deposit payment (25% of full price), set when the deposit is paid. */
  deposit?: {
    paidAtMs: number;
    amountMinor: number;
    method: PaymentMethod;
  };
  event: {
    eventTypeId: string;
    eventDate: string;
    startTime: string;
    endTime?: string;
    venueName: string;
    venueAddress: string;
    estimatedGuests?: number;
    notes?: string;
  };
  /** Free-text from the customer to the DJ (optional). */
  message?: string;
};

/**
 * Deposit is 25% of the full price and doubles as the platform fee. Keep this
 * in sync with `DEPOSIT_PERCENT` in `@/lib/constants`.
 */
export const DEPOSIT_PERCENT = 25;

/** Build a full price breakdown (deposit = 25% up front, rest is DJ payout). */
export function computeBookingPricing(fullPriceMinor: number): BookingPricing {
  const depositMinor = Math.round((fullPriceMinor * DEPOSIT_PERCENT) / 100);
  return {
    fullPriceMinor,
    depositPercent: DEPOSIT_PERCENT,
    depositMinor,
    payoutMinor: fullPriceMinor - depositMinor,
  };
}

/** The authoritative pricing for a request: the DJ quote if present, else the estimate. */
export function effectivePricing(req: BookingRequest): BookingPricing | null {
  return req.djQuote ?? req.pricing;
}

const STORAGE_PREFIX = "djconnect.bookingRequest.record.";
const INDEX_KEY = "djconnect.bookingRequest.index";

function storageKeyFor(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function readBookingRequest(id: string): BookingRequest | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(id));
    if (!raw) return null;
    return JSON.parse(raw) as BookingRequest;
  } catch {
    return null;
  }
}

export function writeBookingRequest(req: BookingRequest): void {
  try {
    window.localStorage.setItem(storageKeyFor(req.id), JSON.stringify(req));
    addToIndex(req.id);
    window.dispatchEvent(
      new CustomEvent("bookingRequest:update", { detail: { id: req.id } }),
    );
  } catch {
    // ignore quota / privacy failures
  }
}

export function listBookingRequestIds(): string[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function listBookingRequests(): BookingRequest[] {
  return listBookingRequestIds()
    .map((id) => readBookingRequest(id))
    .filter((r): r is BookingRequest => r !== null)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function listBookingRequestsForCustomer(
  customerId: string | null,
): BookingRequest[] {
  const all = listBookingRequests();
  if (customerId === null) return all.filter((r) => !r.customerId);
  return all.filter((r) => !r.customerId || r.customerId === customerId);
}

/**
 * Booking requests addressed to a specific DJ. When no record matches the
 * given `djId` (common in the mock/demo where the logged-in DJ's id differs
 * from the profile id a request was sent to) we fall back to the full inbox so
 * the DJ can still review and respond to requests in a single-browser demo.
 */
export function listBookingRequestsForDj(djId: string | null): BookingRequest[] {
  const all = listBookingRequests();
  if (!djId) return all;
  const mine = all.filter((r) => r.djId === djId);
  return mine.length > 0 ? mine : all;
}

/** Merge a partial patch into an existing request and persist it. */
export function updateBookingRequest(
  id: string,
  patch: Partial<BookingRequest>,
): BookingRequest | null {
  const existing = readBookingRequest(id);
  if (!existing) return null;
  const next: BookingRequest = { ...existing, ...patch };
  writeBookingRequest(next);
  return next;
}

function addToIndex(id: string): void {
  const ids = listBookingRequestIds();
  if (!ids.includes(id)) {
    ids.push(id);
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  }
}

export function newBookingRequestId(): string {
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `bk-${t}-${r}`;
}
