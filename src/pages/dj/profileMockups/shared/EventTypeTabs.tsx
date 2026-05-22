import { cn } from "@/lib/utils";
import {
  MOCKUP_SUB_PROFILE_KEYS,
  MOCKUP_SUB_PROFILE_META,
  type MockupSubProfileKey,
} from "./types";
import { SubProfileIcon } from "./SubProfileIcon";

/**
 * Three-tab event-type switcher shown at the top of every redesign mockup.
 *
 * Visual pattern: a single rounded pill row with thin vertical dividers
 * separating the inactive tabs and an inset white "card" highlighting the
 * active tab. Matches the user's reference screenshot.
 */
export function EventTypeTabs({
  active,
  onChange,
  className,
}: {
  active: MockupSubProfileKey;
  onChange: (next: MockupSubProfileKey) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Event type sub-profile"
      className={cn(
        "flex w-full overflow-hidden rounded-2xl border bg-card shadow-sm",
        className,
      )}
    >
      {MOCKUP_SUB_PROFILE_KEYS.map((key, idx) => {
        const meta = MOCKUP_SUB_PROFILE_META[key];
        const isActive = key === active;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              idx > 0 && "border-l border-border/60",
              isActive
                ? "bg-card text-foreground shadow-[inset_0_0_0_1px_hsl(var(--border))]"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <SubProfileIcon
              meta={meta}
              className={cn(
                isActive
                  ? meta.accent === "amber"
                    ? "text-amber-600"
                    : meta.accent === "rose"
                    ? "text-rose-600"
                    : "text-slate-700"
                  : "text-muted-foreground",
              )}
            />
            {meta.tabLabel}
          </button>
        );
      })}
    </div>
  );
}
