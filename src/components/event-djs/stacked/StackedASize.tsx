import { cn } from "@/lib/utils";

/**
 * Size variants for `StackedDJCardA` on the **Standard** (comfortable)
 * density. The card design and every element stays identical — only
 * the **proportions** of the photo, paddings, headline, and rail are
 * recalibrated so the smaller version remains readable and visually
 * balanced (rather than a CSS-scale of the full-size card).
 *
 *   · default → reference proportions (224-px photo, 192-px rail).
 *   · small   → ~80 % proportions (176-px photo, 160-px rail, tighter
 *               paddings, smaller headline + rail price).
 */
export type StackedASize = "default" | "small";

export const STACKED_A_SIZE_OPTIONS: {
  value: StackedASize;
  label: string;
  hint: string;
}[] = [
  { value: "default", label: "Standard", hint: "fuld størrelse" },
  { value: "small", label: "−20 %", hint: "mindre, ~80 %" },
];

export type StackedASizeTokens = {
  /** Tailwind width class (with md: prefix) for the photo column. */
  photoColWidth: string;
  /** Padding for the middle (content) column. */
  contentPad: string;
  /** Padding for the right rail. */
  railPad: string;
  /** Width of the right rail (md+). */
  railWidth: string;
  /** Font size for the serif headline (DJ stage name). */
  nameSize: string;
  /** Font size for the rail price. */
  railPriceSize: string;
  /** Avatar size token (passed to <HostAvatar />). */
  avatarSize: "sm" | "md";
};

const TOKENS: Record<StackedASize, StackedASizeTokens> = {
  default: {
    photoColWidth: "md:w-56",
    contentPad: "p-4",
    railPad: "p-4",
    railWidth: "md:w-48",
    nameSize: "text-2xl",
    railPriceSize: "text-xl",
    avatarSize: "md",
  },
  small: {
    photoColWidth: "md:w-44",
    contentPad: "p-3 md:p-3.5",
    railPad: "p-3 md:p-3.5",
    railWidth: "md:w-40",
    nameSize: "text-xl",
    railPriceSize: "text-lg",
    avatarSize: "sm",
  },
};

export function stackedASizeTokens(size: StackedASize): StackedASizeTokens {
  return TOKENS[size];
}

/**
 * Pill toggle that mirrors the look of `DensityToggle` / `StorSizeToggle`.
 * Only rendered on `/wedding-djs-stacked-a` when density === "comfortable".
 */
export function StackedASizeToggle({
  value,
  onChange,
}: {
  value: StackedASize;
  onChange: (next: StackedASize) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Kortstørrelse"
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5 text-xs"
    >
      {STACKED_A_SIZE_OPTIONS.map((opt) => {
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
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
