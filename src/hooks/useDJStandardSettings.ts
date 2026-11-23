import { useCallback, useEffect, useState } from "react";
import {
  loadStandardSettings,
  saveStandardSettings,
  type DJStandardSettings,
  type RegionState,
} from "@/lib/djStandardSettings";

/**
 * Persisted DJ standard settings (hourly rate + travel regions). Shared
 * between the Settings tab and the Pricing & Equipment tab so the standard
 * hourly rate can pre-fill each setup package.
 */
export function useDJStandardSettings() {
  const [settings, setSettings] = useState<DJStandardSettings>(() =>
    loadStandardSettings(),
  );

  useEffect(() => {
    saveStandardSettings(settings);
  }, [settings]);

  const setHourlyRate = useCallback((hourlyRate: string) => {
    setSettings((prev) => ({ ...prev, hourlyRate }));
  }, []);

  const setRegion = useCallback((region: string, next: RegionState) => {
    setSettings((prev) => ({
      ...prev,
      regions: { ...prev.regions, [region]: next },
    }));
  }, []);

  return { settings, setHourlyRate, setRegion };
}
