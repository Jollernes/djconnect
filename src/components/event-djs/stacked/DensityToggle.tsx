import { Rows2, Rows3, Rows4 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DENSITY_OPTIONS, type Density } from "./density";

const ICONS: Record<Density, typeof Rows2> = {
  compact: Rows4,
  comfortable: Rows3,
  spacious: Rows2,
};

/**
 * Three-button pill toggle for stacked-row density. Sits in the filter
 * bar's right rail and writes through to localStorage via the hook.
 */
export function DensityToggle({
  value,
  onChange,
}: {
  value: Density;
  onChange: (next: Density) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Row density"
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5 text-xs"
    >
      {DENSITY_OPTIONS.map((opt) => {
        const Icon = ICONS[opt.value];
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${opt.label} — ${opt.hint}`}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
