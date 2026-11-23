/**
 * DJ pricing & equipment model.
 *
 * Holds the DJ's activated event types (with per-type hourly rates), up to
 * three equipment setups by guest capacity, an "over 200 guests" capability
 * flag, and priced add-ons. Persisted to localStorage (demo store).
 */
export const DJ_PRICING_KEY = "djconnect.dj.pricing.v2";

export const MAX_GUESTS = 200;
export const CALC_HOURS = 5;

/* -------------------------------------------------------------------- */
/* Event types                                                           */
/* -------------------------------------------------------------------- */

export type EventTypeKey =
  | "wedding"
  | "corporate"
  | "birthday"
  | "youth"
  | "other";

export const EVENT_TYPES: {
  key: EventTypeKey;
  label: string;
  /** Whether the DJ may set a higher hourly rate than the standard rate. */
  adjustable: boolean;
}[] = [
  { key: "wedding", label: "Bryllup", adjustable: true },
  { key: "corporate", label: "Firmafest", adjustable: true },
  { key: "birthday", label: "Fødselsdag", adjustable: false },
  { key: "youth", label: "Ungdomsfest", adjustable: false },
  { key: "other", label: "Andet", adjustable: false },
];

export type EventTypeState = {
  active: boolean;
  /** Custom hourly rate; only meaningful for adjustable types. */
  rate: string;
};

/* -------------------------------------------------------------------- */
/* Setups & add-ons                                                      */
/* -------------------------------------------------------------------- */

export type SetupState = {
  id: string;
  /** Max number of guests this setup covers (≤ 200). */
  capacity: string;
  /** Setup / package price in DKK. */
  price: string;
};

export type AddonState = {
  id: string;
  name: string;
  price: string;
  free: boolean;
};

export type PricingState = {
  standardRate: string;
  eventTypes: Record<EventTypeKey, EventTypeState>;
  setups: SetupState[];
  /** DJ has equipment for events with more than 200 guests. */
  over200: boolean;
  addons: AddonState[];
};

/* -------------------------------------------------------------------- */
/* Defaults                                                              */
/* -------------------------------------------------------------------- */

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export const DEFAULT_ADDON_NAMES = [
  "Tidlig opsætning af udstyr",
  "Ekstra time",
  "Fotobooth",
  "Karaoke-anlæg",
  "Konfettiskydere",
  "Ekstra højtaler",
  "Uplights / stemningslys",
];

function defaultEventTypes(): Record<EventTypeKey, EventTypeState> {
  return {
    wedding: { active: true, rate: "" },
    corporate: { active: true, rate: "" },
    birthday: { active: true, rate: "" },
    youth: { active: true, rate: "" },
    other: { active: true, rate: "" },
  };
}

export function defaultPricing(standardRate = ""): PricingState {
  return {
    standardRate,
    eventTypes: defaultEventTypes(),
    setups: [
      { id: newId("setup"), capacity: "80", price: "" },
      { id: newId("setup"), capacity: "150", price: "" },
      { id: newId("setup"), capacity: "200", price: "" },
    ],
    over200: false,
    addons: DEFAULT_ADDON_NAMES.map((name) => ({
      id: newId("addon"),
      name,
      price: "",
      free: false,
    })),
  };
}

/* -------------------------------------------------------------------- */
/* Persistence                                                           */
/* -------------------------------------------------------------------- */

export function loadPricing(standardRate = ""): PricingState {
  try {
    const raw = localStorage.getItem(DJ_PRICING_KEY);
    if (!raw) return defaultPricing(standardRate);
    const parsed = JSON.parse(raw) as Partial<PricingState>;
    const base = defaultPricing(standardRate);
    return {
      standardRate: parsed.standardRate ?? base.standardRate,
      eventTypes: { ...base.eventTypes, ...(parsed.eventTypes ?? {}) },
      setups:
        Array.isArray(parsed.setups) && parsed.setups.length > 0
          ? parsed.setups.slice(0, 3).map((s) => ({
              id: s.id ?? newId("setup"),
              capacity: s.capacity ?? "",
              price: s.price ?? "",
            }))
          : base.setups,
      over200: parsed.over200 ?? base.over200,
      addons:
        Array.isArray(parsed.addons) && parsed.addons.length > 0
          ? parsed.addons.map((a) => ({
              id: a.id ?? newId("addon"),
              name: a.name ?? "",
              price: a.price ?? "",
              free: a.free ?? false,
            }))
          : base.addons,
    };
  } catch {
    return defaultPricing(standardRate);
  }
}

export function savePricing(state: PricingState): void {
  try {
    localStorage.setItem(DJ_PRICING_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------- */
/* Derived helpers                                                       */
/* -------------------------------------------------------------------- */

/** Effective hourly rate for an event type (falls back to the standard rate). */
export function eventHourlyRate(
  key: EventTypeKey,
  state: PricingState,
): number {
  const std = Number(state.standardRate) || 0;
  const cfg = EVENT_TYPES.find((e) => e.key === key);
  if (!cfg || !cfg.adjustable) return std;
  const custom = Number(state.eventTypes[key].rate) || 0;
  return custom > 0 ? custom : std;
}

/** Cost of a CALC_HOURS booking: setup price + hourly rate × hours. */
export function fiveHourTotal(setupPrice: string, hourlyRate: number): number {
  return (Number(setupPrice) || 0) + hourlyRate * CALC_HOURS;
}
