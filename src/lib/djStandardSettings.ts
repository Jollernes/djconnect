export const DJ_SETTINGS_KEY = "djconnect.dj.standardSettings.v1";

export const REGIONS = [
  "Region Hovedstaden",
  "Region Sjælland",
  "Region Syddanmark",
  "Region Midtjylland",
  "Region Nordjylland",
] as const;

/** Demo home region — registered during signup. */
export const HOME_REGION = "Region Hovedstaden";

export type RegionState = { active: boolean; price: string };

export type DJStandardSettings = {
  hourlyRate: string;
  regions: Record<string, RegionState>;
};

export function defaultStandardSettings(): DJStandardSettings {
  return {
    hourlyRate: "",
    regions: Object.fromEntries(
      REGIONS.map((r) => [r, { active: r === HOME_REGION, price: "" }]),
    ),
  };
}

export function loadStandardSettings(): DJStandardSettings {
  try {
    const raw = localStorage.getItem(DJ_SETTINGS_KEY);
    if (!raw) return defaultStandardSettings();
    const parsed = JSON.parse(raw) as Partial<DJStandardSettings>;
    const base = defaultStandardSettings();
    return {
      hourlyRate: parsed.hourlyRate ?? base.hourlyRate,
      regions: { ...base.regions, ...(parsed.regions ?? {}) },
    };
  } catch {
    return defaultStandardSettings();
  }
}

export function saveStandardSettings(settings: DJStandardSettings): void {
  try {
    localStorage.setItem(DJ_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

/** Snap a price string to the nearest 50 DKK (prices are set in steps of 50). */
export function snapTo50(value: string): string {
  if (value.trim() === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return String(Math.max(0, Math.round(n / 50) * 50));
}
