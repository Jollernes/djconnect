import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MOCKUPS = [
  { slug: "split-studio", label: "1 · Split Studio" },
  { slug: "guided-sections", label: "2 · Guided Sections" },
  { slug: "card-canvas", label: "3 · Card Canvas" },
];

/**
 * Floating pill switcher at the bottom of every mockup page so the user
 * can compare the three designs without going back to the index. Mirrors
 * the floating `VariantSwitcher` pattern from the existing editor.
 */
export function MockupSwitcher() {
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup
        </span>
        {MOCKUPS.map((m) => {
          const href = `/dj/profile-mockups/${m.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={m.slug}
              to={href}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {m.label}
            </Link>
          );
        })}
        <Link
          to="/dj/profile-mockups"
          className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Overview
        </Link>
      </div>
    </div>
  );
}
