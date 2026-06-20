import { Check, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDJStandardSettings } from "@/hooks/useDJStandardSettings";
import {
  HOME_REGION,
  REGIONS,
  snapTo50,
  type RegionState,
} from "@/lib/djStandardSettings";

export function DJSettingsPage() {
  const { settings, setHourlyRate, setRegion } = useDJStandardSettings();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Indstillinger</h1>
        <p className="text-sm text-muted-foreground">
          Dine standard-indstillinger — timepris og rejseradius gælder på tværs
          af alle dine mobildiskotek-opsætninger.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Settings2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Timepris & rejse</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Standard-indstillinger der bruges på alle opsætninger.
            </p>
          </div>
        </div>
        <StandardSettingsSection
          hourlyRate={settings.hourlyRate}
          onHourlyRateChange={setHourlyRate}
          regions={settings.regions}
          onRegionChange={setRegion}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Standard settings: hourly rate + travel                               */
/* -------------------------------------------------------------------- */

function StandardSettingsSection({
  hourlyRate,
  onHourlyRateChange,
  regions,
  onRegionChange,
}: {
  hourlyRate: string;
  onHourlyRateChange: (value: string) => void;
  regions: Record<string, RegionState>;
  onRegionChange: (region: string, next: RegionState) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hourly rate */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Timepris (DKK)
        </Label>
        <Input
          type="number"
          step={50}
          min={0}
          value={hourlyRate}
          onChange={(e) => onHourlyRateChange(e.target.value)}
          onBlur={(e) => onHourlyRateChange(snapTo50(e.target.value))}
          placeholder="fx 1.200"
        />
        <p className="text-[11px] text-muted-foreground">
          Timeprisen er grundprisen pr. times spilletid. Prisen på den valgte
          mobildiskotek-opsætning lægges oveni (timepris × antal timer +
          opsætningens pris). Angives i intervaller af 50 kr.
        </p>
      </div>

      {/* Travel radius */}
      <div className="space-y-2 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-medium text-foreground">
            Rejseradius
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Pris pr. region · gælder hele regionen
          </span>
        </div>

        <div className="divide-y divide-border/60 rounded-xl border">
          {REGIONS.map((region) => {
            const state = regions[region];
            const isHome = region === HOME_REGION;
            return (
              <div key={region} className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    onRegionChange(region, { ...state, active: !state.active })
                  }
                  aria-pressed={state.active}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    state.active
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-transparent hover:border-foreground/30",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 truncate text-sm text-foreground">
                  {region}
                  {isHome && (
                    <span className="ml-1.5 text-[10px] font-medium text-accent">
                      · hjemsted
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={state.price}
                    onChange={(e) =>
                      onRegionChange(region, { ...state, price: e.target.value })
                    }
                    disabled={!state.active}
                    placeholder="—"
                    className="h-8 w-24 text-right disabled:opacity-40"
                  />
                  <span className="text-[11px] text-muted-foreground">kr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
