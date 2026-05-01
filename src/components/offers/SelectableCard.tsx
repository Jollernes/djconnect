import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable selectable card used by the wizard for icon-driven choices.
 * Big tappable area, animated check on select, accessible button semantics.
 */
export function SelectableCard({
  selected,
  onClick,
  illustration,
  title,
  subtitle,
  caption,
  multiSelect = false,
  size = "md",
}: {
  selected: boolean;
  onClick: () => void;
  illustration?: React.ReactNode;
  title: string;
  subtitle?: string;
  caption?: string;
  multiSelect?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col items-start gap-2 rounded-2xl border-2 bg-white text-left transition-all",
        sizeClasses[size],
        selected
          ? "border-rose-500 bg-rose-50/40 shadow-sm ring-4 ring-rose-100"
          : "border-border hover:border-rose-300 hover:bg-rose-50/20",
      )}
    >
      {illustration ? <div className="w-full">{illustration}</div> : null}

      <div className="flex w-full items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
          {caption ? (
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">{caption}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full transition-all",
            multiSelect ? "rounded-md" : "",
            selected
              ? "bg-rose-500 text-white"
              : "border-2 border-border text-transparent group-hover:border-rose-300",
          )}
          aria-hidden
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
