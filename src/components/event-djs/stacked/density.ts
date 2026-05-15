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
    if (stored === "compact" || stored === "comfortable" || stored === "spacious") {
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

export const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: "compact", label: "Kompakt", hint: "list-style, ~130 px" },
  { value: "comfortable", label: "Standard", hint: "default, ~200 px" },
  { value: "spacious", label: "Stor", hint: "full showcase, ~300 px" },
];
