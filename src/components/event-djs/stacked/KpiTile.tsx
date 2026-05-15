import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small icon-chip + value + label tile used inside the stacked DJ card
 * middle column. Three of these line up in a row to surface rating, event
 * count, and city.
 */
export function KpiTile({
  icon: Icon,
  value,
  label,
  accent = "slate",
  iconFill = false,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  accent?: "slate" | "amber" | "navy";
  iconFill?: boolean;
}) {
  const chip = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
    navy: "bg-slate-100 text-slate-800",
  }[accent];

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          chip,
        )}
      >
        <Icon
          className="h-4 w-4"
          {...(iconFill ? { fill: "currentColor" } : {})}
        />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-base font-semibold tabular-nums text-slate-900">
          {value}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
