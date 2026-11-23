/**
 * Persistent storage for "Personlig Rådgivning" advisory requests.
 *
 * The advisory flow nudges customers toward booking a platform-provided DJ
 * package. The customer fills in an extended event brief, the platform
 * generates a personalized package recommendation, and an advisor (in
 * reality, a sales call) reaches out before booking is confirmed.
 *
 * Until the platform has a real backend, each request lives entirely in
 * `localStorage`. Records are scoped to the submitting customer's id so
 * different demo accounts see only their own advisory threads.
 */

export type AdvisoryEventType = "wedding" | "birthday" | "corporate" | "other";

export type AdvisoryStatus =
  | "awaiting_call"   // submitted; advisor will phone within hours
  | "reserved"        // customer clicked "Reserver din dato nu"
  | "declined";       // customer clicked "Afslå tilbud"

export type AdvisoryPackage = {
  /** Tier id, e.g. "intimate" / "classic" / "premium" / "grand". */
  id: string;
  /** Display name shown to the customer ("Klassisk", "Premium", etc.). */
  name: string;
  /** Full DKK price (8900 = 8.900 kr). */
  priceDkk: number;
  /** Total hours of DJ time included. */
  hours: number;
  /** Bullet list of inclusions, in Danish. */
  includes: string[];
  /** One-line rationale shown next to the package. */
  rationale: string;
};

export type WeddingAdvisoryBrief = {
  /** Couple's names ("Anna & Mikkel"). */
  coupleNames: string;
  /** ISO date string (YYYY-MM-DD). */
  weddingDate: string;
  /** Venue name (optional). */
  venueName: string;
  /** City / region. */
  city: string;
  /** Approximate guest count. */
  guestCount: number;
  /** Which parts of the wedding need a DJ ("ceremony" / "dinner" / "party"). */
  parts: Array<"ceremony" | "dinner" | "party">;
  /** Estimated total hours of DJ time. */
  totalHours: number;
  /** Music style preferences (free text). */
  musicStyle: string;
  /** Must-play tracks / artists. */
  mustPlay: string;
  /** Do-not-play tracks / artists. */
  doNotPlay: string;
  /** Setup needs (sound, lighting, mic, fog, etc.). */
  setupNeeds: string[];
  /** Venue notes — power, indoor/outdoor, etc. (optional). */
  venueNotes: string;
  /** Budget hint, free text. Optional. */
  budget: string;
  /** Anything else? */
  notes: string;
  /** Contact name. */
  contactName: string;
  /** Contact email. */
  contactEmail: string;
  /** Contact phone (the hook — "we'll call you"). */
  contactPhone: string;
};

export type AdvisoryBrief =
  | { eventType: "wedding"; wedding: WeddingAdvisoryBrief }
  // Other event types are scaffolded for later; kept narrow for now.
  | { eventType: "birthday" | "corporate" | "other"; wedding?: never };

export type PersonalAdviceRecord = {
  id: string;
  createdAtMs: number;
  customerId?: string;
  status: AdvisoryStatus;
  brief: AdvisoryBrief;
  recommendation: AdvisoryPackage;
};

const STORAGE_PREFIX = "djconnect.personalAdvice.record.";
const INDEX_KEY = "djconnect.personalAdvice.index";

function storageKeyFor(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function readAdvisoryRecord(id: string): PersonalAdviceRecord | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(id));
    if (!raw) return null;
    return JSON.parse(raw) as PersonalAdviceRecord;
  } catch {
    return null;
  }
}

export function writeAdvisoryRecord(record: PersonalAdviceRecord): void {
  try {
    window.localStorage.setItem(storageKeyFor(record.id), JSON.stringify(record));
    addToIndex(record.id);
    window.dispatchEvent(
      new CustomEvent("personalAdvice:update", { detail: { id: record.id } }),
    );
  } catch {
    /* ignore quota / privacy failures */
  }
}

export function listAdvisoryIds(): string[] {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function listAdvisoryRecords(): PersonalAdviceRecord[] {
  return listAdvisoryIds()
    .map((id) => readAdvisoryRecord(id))
    .filter((r): r is PersonalAdviceRecord => r !== null)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function listAdvisoryRecordsForCustomer(
  customerId: string | null,
): PersonalAdviceRecord[] {
  const all = listAdvisoryRecords();
  if (customerId === null) {
    return all.filter((r) => !r.customerId);
  }
  return all.filter((r) => !r.customerId || r.customerId === customerId);
}

export function advisoryRecordIsVisibleTo(
  record: PersonalAdviceRecord,
  customerId: string | null,
): boolean {
  if (!record.customerId) return true;
  return record.customerId === customerId;
}

function addToIndex(id: string): void {
  const ids = listAdvisoryIds();
  if (!ids.includes(id)) {
    ids.push(id);
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  }
}

/* -------------------------------------------------------------------- */
/* Recommendation engine — wedding only for now                          */
/* -------------------------------------------------------------------- */

/**
 * Picks a package tier for a wedding brief based on guest count + total
 * hours + setup needs. Pure function so the same input always produces the
 * same recommendation in the demo.
 */
export function recommendWeddingPackage(
  brief: WeddingAdvisoryBrief,
): AdvisoryPackage {
  const guests = brief.guestCount || 0;
  const hours = brief.totalHours || 5;
  const wantsLights = brief.setupNeeds.some((s) =>
    /lys|lights|uplight/i.test(s),
  );
  const wantsCeremony = brief.parts.includes("ceremony");

  // Tier choice driven primarily by guest count, lifted by ceremony +
  // lighting requests.
  let tier: "intimate" | "classic" | "premium" | "grand";
  if (guests >= 150 || hours >= 8) tier = "grand";
  else if (guests >= 100 || (wantsLights && wantsCeremony) || hours >= 7) tier = "premium";
  else if (guests >= 50 || hours >= 5) tier = "classic";
  else tier = "intimate";

  switch (tier) {
    case "intimate":
      return {
        id: "intimate",
        name: "Intim",
        priceDkk: 6500,
        hours: 4,
        includes: [
          "DJ",
          "Lyd",
          "Mikrofon (kabel + trådløs)",
          "Transport, opsætning og nedtagning",
          "Musikbrief (online møde)",
        ],
        rationale:
          "Passer til mindre fester (op til ~50 gæster) hvor lyset i lokalet er fint som det er.",
      };
    case "classic":
      return {
        id: "classic",
        name: "Klassisk",
        priceDkk: 8900,
        hours: 5,
        includes: [
          "DJ",
          "Lyd",
          "Lys",
          "Mikrofon (kabel + trådløs)",
          "Transport, opsætning og nedtagning",
          "Musikbrief (online møde)",
        ],
        rationale:
          "Vores mest bookede pakke — passer til typiske bryllupper med 50–100 gæster og en god dansefest.",
      };
    case "premium":
      return {
        id: "premium",
        name: "Premium",
        priceDkk: 12500,
        hours: 6,
        includes: [
          "DJ",
          "Lyd (større anlæg)",
          "Lys + uplights",
          "Mikrofoner (kabel + trådløs + ceremoni-mikrofon)",
          "Transport, opsætning og nedtagning",
          "Musikbrief (telefonsamtale + online møde)",
          "Backup-udstyr",
        ],
        rationale:
          "Anbefalet til større bryllupper, ceremoni + middag + fest, og når lyset skal matche stemningen.",
      };
    case "grand":
      return {
        id: "grand",
        name: "Grand",
        priceDkk: 15900,
        hours: 7,
        includes: [
          "DJ",
          "Lyd til store lokaler",
          "Komplet lyssetup med uplights",
          "Mikrofoner (kabel + trådløs + ceremoni-mikrofon)",
          "Røg-/hazer-effekt (efter ønske)",
          "Transport, opsætning og nedtagning",
          "Musikbrief (telefonsamtale + online møde)",
          "Fuld backup-rig",
        ],
        rationale:
          "Til store bryllupper (150+ gæster) eller flere lokationer — dækker hele dagen fra ceremoni til lukketid.",
      };
  }
}
