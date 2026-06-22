export const DJ_SETUPS_KEY = "djconnect.dj.setups.v1";
export const DJ_WEDDING_SETUPS_KEY = "djconnect.dj.weddingSetups.v1";

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
  capacity: Capacity;
  description: string;
  price: string;
  /** Per-setup hourly rate, pre-filled from the standard rate but editable. */
  hourlyRate: string;
  extras: string[];
  photo?: string;
  /** Whether the DJ has saved the setup (collapses to a visual card). */
  saved: boolean;
};

export function emptySetup(hourlyRate: string): Setup {
  return {
    capacity: "80",
    description: "",
    price: "",
    hourlyRate,
    extras: [],
    saved: false,
  };
}

/**
 * Load persisted setups. Photos are not persisted (they can be large), so a
 * reloaded setup keeps its data but loses the image preview.
 */
export function loadSetups(key: string = DJ_SETUPS_KEY): Setup[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Setup[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSetups(setups: Setup[], key: string = DJ_SETUPS_KEY): void {
  try {
    const stripped = setups.map(({ photo: _photo, ...rest }) => rest);
    localStorage.setItem(key, JSON.stringify(stripped));
  } catch {
    /* ignore */
  }
}
