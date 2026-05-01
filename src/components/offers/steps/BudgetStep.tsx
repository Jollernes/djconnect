import { BUDGET_OPTIONS, type OfferBudgetId } from "@/lib/offerRequestContent";
import { BudgetIllustration } from "@/components/offers/OfferIllustrations";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function BudgetStep({
  value,
  onChange,
}: {
  value: OfferBudgetId | undefined;
  onChange: (id: OfferBudgetId) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-muted-foreground">
        DJs use this as a sanity check. You'll see actual offers within this range — no surprises.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BUDGET_OPTIONS.map((b) => {
          const selected = value === b.id;
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(b.id)}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-2xl border-2 bg-white p-4 text-center transition-all",
                selected
                  ? "border-rose-500 bg-rose-50/40 shadow-sm ring-4 ring-rose-100"
                  : "border-border hover:border-rose-300 hover:bg-rose-50/20",
              )}
            >
              <BudgetIllustration variant={b.illustration} size="sm" />
              <div>
                <p className="text-sm font-semibold leading-tight">{b.label}</p>
                <p className="mt-0.5 text-xs font-medium text-rose-700">{b.range}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {b.description}
                </p>
              </div>
              <span
                className={cn(
                  "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full transition-all",
                  selected ? "bg-rose-500 text-white" : "border-2 border-border text-transparent",
                )}
                aria-hidden
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
