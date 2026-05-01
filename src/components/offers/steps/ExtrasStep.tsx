import { EXTRA_OPTIONS } from "@/lib/offerRequestContent";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ExtrasStep({
  extras,
  onToggle,
}: {
  extras: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-muted-foreground">
        Optional — pick anything that applies. Skip if nothing fits.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {EXTRA_OPTIONS.map((x) => {
          const selected = extras.includes(x.id);
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(x.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border-2 bg-white p-3 text-left transition-all",
                selected
                  ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-100"
                  : "border-border hover:border-rose-300 hover:bg-rose-50/20",
              )}
            >
              <span className="text-2xl" aria-hidden>{x.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{x.label}</span>
                <span className="block text-[11px] text-muted-foreground">{x.description}</span>
              </span>
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md transition-all",
                  selected ? "bg-rose-500 text-white" : "border-2 border-border text-transparent",
                )}
                aria-hidden
              >
                <Check className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
