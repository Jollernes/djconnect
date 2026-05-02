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
  | "pending_dj" // submitted, waiting for the DJ to accept or decline
  | "accepted" // DJ accepted, customer can now pay the deposit into escrow
  | "declined" // DJ declined; customer should pick another DJ
  | "expired" // DJ never responded within the response window
  | "paid"; // customer paid the deposit, booking is confirmed

export type BookingRequest = {
  id: string;
  customerId?: string; // undefined for anonymous (guest) submissions
  createdAtMs: number;
  status: BookingRequestStatus;
  djId: string;
  djUsername: string;
  djStageName: string;
  djAvatarUrl?: string;
  djCity?: string;
  djCurrency: string;
  /** Quoted price snapshot at request time. `null` if DJ is "price on request". */
  pricing: {
    basePriceMinor: number;
    feePercent: number;
    feeMinor: number;
    totalMinor: number;
  } | null;
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
