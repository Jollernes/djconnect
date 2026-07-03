/** Unified event-tagged setups list. */
export const DJ_SETUPS_KEY = "djconnect.dj.setups.v2";
/** Legacy keys kept for one-time migration into the unified list. */
export const DJ_SETUPS_LEGACY_KEY = "djconnect.dj.setups.v1";
export const DJ_WEDDING_SETUPS_KEY = "djconnect.dj.weddingSetups.v1";

export const EVENT_TAGS = [
  "Alle events",
  "Bryllup",
  "Firmafest",
  "Ungdomsfest",
] as const;
export type EventTag = (typeof EVENT_TAGS)[number];

export type Capacity = "80" | "150" | "200";

export const CAPACITY_OPTIONS: { value: Capacity; label: string }[] = [
  { value: "80", label: "Op til 80 gæster" },
  { value: "150", label: "Op til 150 gæster" },
  { value: "200", label: "Op til 200 gæster" },
];

/** Tags that are always included in every setup and cannot be toggled. */
export function fixedTags(capacity: Capacity): string[] {
  return [
    `Lyd & lys op til ${capacity} gæster`,
    "Opsætning af udstyr",
    "Nedtagning af udstyr",
  ];
}

/** Optional extras the DJ can choose to include in the setup price. */
export const OPTIONAL_INCLUSIONS = [
  "Tidlig opsætning af udstyret",
  "1 stk mikrofon (trådløs)",
  "1 stk mikrofon (ikke trådløs)",
  "Røgmaskine",
];

export type Setup = {
  id: string;
  /** Which event/profile the setup is shown on. */
  eventTag: EventTag;
  capacity: Capacity;
  description: string;
  price: string;
  /** Per-setup hourly rate, pre-filled from the standard rate but editable. */
  hourlyRate: string;
  extras: string[];
  photo?: string;
};

function uid(prefix = "setup"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptySetup(
  hourlyRate: string,
  eventTag: EventTag = "Alle events",
): Setup {
  return {
    id: uid(),
    eventTag,
    capacity: "80",
    description: "",
    price: "",
    hourlyRate,
    extras: [],
  };
}

type StoredSetup = Partial<Setup> & { saved?: boolean };

function normalize(raw: StoredSetup, fallbackTag: EventTag): Setup {
  const eventTag = EVENT_TAGS.includes(raw.eventTag as EventTag)
    ? (raw.eventTag as EventTag)
    : fallbackTag;
  return {
    id: typeof raw.id === "string" ? raw.id : uid(),
    eventTag,
    capacity: (raw.capacity as Capacity) ?? "80",
    description: raw.description ?? "",
    price: raw.price ?? "",
    hourlyRate: raw.hourlyRate ?? "",
    extras: Array.isArray(raw.extras) ? raw.extras : [],
    photo: raw.photo,
  };
}

function readList(key: string, fallbackTag: EventTag): Setup[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSetup[];
    return Array.isArray(parsed) ? parsed.map((s) => normalize(s, fallbackTag)) : [];
  } catch {
    return [];
  }
}

/**
 * Load persisted setups as a single unified list. Photos are not persisted
 * (they can be large), so a reloaded setup keeps its data but loses the image
 * preview. Legacy (v1) general + wedding lists are migrated in automatically.
 */
export function loadSetups(): Setup[] {
  const unified = readList(DJ_SETUPS_KEY, "Alle events");
  if (unified.length > 0) return unified;

  // One-time migration from the previous two-list model.
  return [
    ...readList(DJ_SETUPS_LEGACY_KEY, "Alle events"),
    ...readList(DJ_WEDDING_SETUPS_KEY, "Bryllup"),
  ];
}

export function saveSetups(setups: Setup[]): void {
  try {
    const stripped = setups.map(({ photo: _photo, ...rest }) => rest);
    localStorage.setItem(DJ_SETUPS_KEY, JSON.stringify(stripped));
  } catch {
    /* ignore */
  }
}
