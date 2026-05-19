import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scaling options for the Stor (spacious) row variant on `/wedding-djs-stacked-c`.
 * The card design is identical across all options — only CSS scaling differs.
 *
 *   · stor    → 100 % (no scaling)
 *   · h80     → height only, scaled to 80 % (–20 %)
 *   · h70     → height only, scaled to 70 % (–30 %)
 *   · h60     → height only, scaled to 60 % (–40 %)
 *   · both80  → width and height both scaled to 80 %
 */
export type StorScale = "stor" | "h80" | "h70" | "h60" | "both80";

export const STOR_SCALE_OPTIONS: { value: StorScale; label: string; hint: string }[] = [
  { value: "stor", label: "Stor", hint: "100 %" },
  { value: "h80", label: "−20 % H", hint: "kun højde 80 %" },
  { value: "h70", label: "−30 % H", hint: "kun højde 70 %" },
  { value: "h60", label: "−40 % H", hint: "kun højde 60 %" },
  { value: "both80", label: "−20 % B+H", hint: "begge akser 80 %" },
];

const SCALE_VALUE: Record<StorScale, number> = {
  stor: 1,
  h80: 0.8,
  h70: 0.7,
  h60: 0.6,
  both80: 0.8,
};

/**
 * Small 5-button pill toggle that mirrors the look of `DensityToggle`.
 * Only rendered on `/wedding-djs-stacked-c` when density === "spacious".
 */
export function StorScaleToggle({
  value,
  onChange,
}: {
  value: StorScale;
  onChange: (next: StorScale) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Stor størrelse"
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5 text-xs"
    >
      {STOR_SCALE_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${opt.label} — ${opt.hint}`}
            title={`${opt.label} (${opt.hint})`}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Wraps a card and applies the chosen Stor scale.
 *
 * Strategy:
 *   - `both80` uses CSS `zoom`, which scales both axes AND adjusts layout flow
 *     (so siblings stack correctly and the next card sits flush).
 *   - The three height-only options use `transform: scaleY(s)` with
 *     `transform-origin: top left`, paired with a measured wrapper height
 *     (`offsetHeight * s`) so the layout-box collapses to the visible height
 *     and the cards below don't get a gap.
 *
 * `offsetHeight` is read because it ignores CSS transforms — it reports the
 * natural layout-box height of the inner card.
 */
export function StorScaledCard({
  scale,
  children,
}: {
  scale: StorScale;
  children: ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  const isHeightOnly = scale === "h80" || scale === "h70" || scale === "h60";
  const factor = SCALE_VALUE[scale];

  useEffect(() => {
    if (!isHeightOnly) return;
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setNaturalHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isHeightOnly]);

  if (scale === "stor") {
    return <>{children}</>;
  }

  if (scale === "both80") {
    // `zoom` scales both axes and participates in layout, so siblings stack
    // naturally without needing measured heights.
    return (
      <div
        style={{
          zoom: factor,
          // Centring fallback for browsers that treat `zoom` as a transform
          // (older Firefox); width stays at 100 % of the centred container.
        }}
      >
        {children}
      </div>
    );
  }

  // Height-only: measured wrapper + scaleY on the inner.
  const outerHeight = naturalHeight !== null ? Math.ceil(naturalHeight * factor) : undefined;
  return (
    <div
      style={{
        height: outerHeight,
        overflow: outerHeight !== undefined ? "hidden" : undefined,
      }}
    >
      <div
        ref={innerRef}
        style={{
          transform: `scaleY(${factor})`,
          transformOrigin: "top left",
          width: "100%",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
