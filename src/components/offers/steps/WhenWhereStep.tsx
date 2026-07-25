import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITY_OPTIONS } from "@/lib/offerRequestContent";
import { cn } from "@/lib/utils";

export function WhenWhereStep({
  date,
  city,
  customCity,
  onDateChange,
  onCityChange,
  onCustomCityChange,
}: {
  date: string | undefined;
  city: string | undefined;
  customCity: string | undefined;
  onDateChange: (date: string) => void;
  onCityChange: (city: string) => void;
  onCustomCityChange: (city: string) => void;
}) {
  const [showCustomCity, setShowCustomCity] = useState(
    Boolean(customCity) || (Boolean(city) && !CITY_OPTIONS.find((c) => c.id === city)),
  );

  const today = new Date().toISOString().slice(0, 10);
  const isPresetCity = city && CITY_OPTIONS.find((c) => c.id === city);

  return (
    <div className="space-y-8">
      {/* Date */}
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-rose-500" /> Eventdato
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Cirka-dato er fint — DJs svarer hurtigere, når de kan tjekke tilgængelighed.
        </p>
        <Input
          type="date"
          min={today}
          value={date ?? ""}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-3 h-12 text-base"
        />
      </div>

      {/* City */}
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-rose-500" /> Hvor afholdes eventet?
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Vælg en by eller tilføj din egen — de fleste DJs rejser op til 100 km fra deres base.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {CITY_OPTIONS.map((c) => {
            const selected = Boolean(isPresetCity && city === c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setShowCustomCity(false);
                  onCityChange(c.id);
                  onCustomCityChange("");
                }}
                className={cn(
                  "flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left transition-all",
                  selected
                    ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-100"
                    : "border-border bg-white hover:border-rose-300 hover:bg-rose-50/20",
                )}
              >
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="text-[11px] text-muted-foreground">{c.region}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={showCustomCity}
            onClick={() => {
              setShowCustomCity(true);
              onCityChange("");
            }}
            className={cn(
              "flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left transition-all",
              showCustomCity
                ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-100"
                : "border-border bg-white hover:border-rose-300 hover:bg-rose-50/20",
            )}
          >
            <span className="text-sm font-semibold">Andet</span>
            <span className="text-[11px] text-muted-foreground">Skriv din by</span>
          </button>
        </div>
        {showCustomCity && (
          <Input
            placeholder="f.eks. Helsingør, Frederiksberg…"
            value={customCity ?? ""}
            onChange={(e) => onCustomCityChange(e.target.value)}
            className="mt-3 h-11"
          />
        )}
      </div>
    </div>
  );
}
