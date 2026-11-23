import { cn } from "@/lib/utils";

/** Wedding-rings glyph used by the BryllupsDJ badge — two slightly-
 * overlapping outline rings in warm champagne / rose-gold. Drawn as
 * inline SVG because lucide-react does not include this symbol. */
export function WeddingRings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 16"
      fill="none"
      stroke="#b8884a"
      strokeWidth={1.5}
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="5.25" />
      <circle cx="17" cy="9" r="5.25" />
    </svg>
  );
}

/** Editorial "BryllupsDJ" trust mark.
 *
 *   - `variant="premium"` (default) — cream backdrop, thin amber
 *     ring, soft shadow, backdrop-blur. Reads as a magazine-style
 *     hallmark and is what Soft Wedding variants use.
 *   - `variant="discrete"` — a smaller, more subtle pill suitable
 *     for cards whose hero is busier (e.g. the Triptych mosaic). No
 *     ring, lower-opacity backdrop, tighter tracking. */
export function BryllupsDJBadge({
  variant = "premium",
  compact = false,
  className,
}: {
  variant?: "premium" | "discrete";
  /** When the parent grid is denser (4 per row) the badge shrinks. */
  compact?: boolean;
  className?: string;
}) {
  const isDiscrete = variant === "discrete";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-sans font-medium uppercase text-slate-900",
        isDiscrete
          ? "bg-white/85 shadow-sm"
          : "bg-white/95 shadow-sm ring-1 ring-amber-200/80 backdrop-blur-sm",
        isDiscrete
          ? compact
            ? "gap-1 px-2 py-0.5 text-[8.5px] tracking-[0.10em]"
            : "gap-1 px-2 py-0.5 text-[9px] tracking-[0.12em]"
          : compact
            ? "gap-1 px-2.5 py-1 text-[9.5px] tracking-[0.12em]"
            : "gap-1.5 px-3 py-1 text-[10.5px] tracking-[0.14em]",
        className,
      )}
    >
      <WeddingRings
        className={cn(
          isDiscrete
            ? compact
              ? "h-2.5 w-[17px]"
              : "h-2.5 w-[18px]"
            : compact
              ? "h-3 w-[20px]"
              : "h-3.5 w-[22px]",
        )}
      />
      BryllupsDJ
    </span>
  );
}
