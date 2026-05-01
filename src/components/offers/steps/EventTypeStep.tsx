import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";
import type { OfferEventTypeId } from "@/lib/offerRequestContent";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function EventTypeStep({
  value,
  onChange,
}: {
  value: OfferEventTypeId | undefined;
  onChange: (next: OfferEventTypeId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {EVENT_TYPE_OPTIONS.map((opt) => {
        const Icon = opt.Icon;
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.id as OfferEventTypeId)}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-2xl border-2 bg-white p-4 text-left transition-all",
              selected
                ? "border-rose-500 bg-rose-50/40 shadow-sm ring-4 ring-rose-100"
                : "border-border hover:border-rose-300 hover:bg-rose-50/20",
            )}
          >
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br",
                opt.tint,
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{opt.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
            </div>
            <span
              className={cn(
                "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full transition-all",
                selected
                  ? "bg-rose-500 text-white"
                  : "border-2 border-border text-transparent",
              )}
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
