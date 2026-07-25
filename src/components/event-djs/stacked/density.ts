import { useEffect, useState } from "react";

export type Density = "compact" | "comfortable" | "spacious";

export const DEFAULT_DENSITY: Density = "comfortable";

const STORAGE_KEY = "djconnect.stackedDJDensity";

/**
 * Read + persist the active row-density across A/B/C mock-up pages. Stored
 * in localStorage so the choice survives refreshes and is shared across
 * variants — flipping A → B → C keeps whatever density the user last set.
 */
export function useStackedDensity(): [Density, (next: Density) => void] {
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window === "undefined") return DEFAULT_DENSITY;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Migrate the removed "compact" density to the new default so
    // returning users aren't stuck on a density that no longer has a
    // toggle button.
    if (stored === "comfortable" || stored === "spacious") {
      return stored;
    }
    return DEFAULT_DENSITY;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, density);
  }, [density]);

  return [density, setDensityState];
}

// `compact` is intentionally omitted — the Kompakt density was removed
// from the user-facing toggle. The type still includes it so the card
// components' compact branches keep type-checking; it just can't be
// selected from the UI any more.
export const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: "comfortable", label: "Standard", hint: "default, ~200 px" },
  { value: "spacious", label: "Stor", hint: "full showcase, ~300 px" },
];
