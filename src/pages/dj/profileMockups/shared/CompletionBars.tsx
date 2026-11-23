import { cn } from "@/lib/utils";
import {
  MOCKUP_SUB_PROFILE_KEYS,
  MOCKUP_SUB_PROFILE_META,
  type MockupSubProfileKey,
} from "./types";
import { SubProfileIcon } from "./SubProfileIcon";

export type CompletionEntry = {
  key: MockupSubProfileKey;
  ratio: number;
};

/**
 * "Dine profiler" card: a small status board showing how complete each
 * of the three event-type sub-profiles is, with one row per profile.
 *
 * Used as the top card in the right rail of the Split Studio mockup,
 * the floating preview header in Guided Sections, and the canvas header
 * in Card Canvas. Single component, single source of truth.
 */
export function CompletionBars({
  entries,
  className,
  onJump,
  activeKey,
  heading = "Dine profiler",
  subheading = "Alle tre profiler skal være færdige for at gå live.",
}: {
  entries: CompletionEntry[];
  className?: string;
  onJump?: (key: MockupSubProfileKey) => void;
  activeKey?: MockupSubProfileKey;
  heading?: string;
  subheading?: string;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-start gap-6">
        <div>
          <p className="text-sm font-semibold">{heading}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subheading}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {MOCKUP_SUB_PROFILE_KEYS.map((key) => {
          const meta = MOCKUP_SUB_PROFILE_META[key];
          const entry = entries.find((e) => e.key === key);
          const pct = Math.round((entry?.ratio ?? 0) * 100);
          const isActive = activeKey === key;
          const accentBar =
            meta.accent === "amber"
              ? "bg-amber-500"
              : meta.accent === "rose"
              ? "bg-rose-500"
              : meta.accent === "indigo"
              ? "bg-indigo-500"
              : "bg-slate-700";
          const RowEl: "button" | "div" = onJump ? "button" : "div";
          return (
            <li key={key}>
              <RowEl
                {...(onJump
                  ? { onClick: () => onJump(key), type: "button" as const }
                  : {})}
                className={cn(
                  "flex w-full items-center gap-3 text-left",
                  onJump &&
                    "rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-muted/40",
                  isActive && onJump && "bg-muted/30",
                )}
              >
                <SubProfileIcon
                  meta={meta}
                  className={cn(
                    meta.accent === "amber"
                      ? "text-amber-600"
                      : meta.accent === "rose"
                      ? "text-rose-600"
                      : meta.accent === "indigo"
                      ? "text-indigo-600"
                      : "text-slate-700",
                  )}
                />
                <span className="w-24 shrink-0 text-sm font-medium">
                  {meta.label === "Wedding"
                    ? "Bryllup"
                    : meta.label === "General"
                    ? "Generel"
                    : "Firmaevent"}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("absolute inset-y-0 left-0 rounded-full", accentBar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </RowEl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
