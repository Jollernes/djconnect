import { cn } from "@/lib/utils";

/**
 * Stor-size variants for `StackedDJCardC`. The card design and every element
 * stays identical — only the **proportions** of images, paddings, and text
 * are recalibrated per size so the smaller cards remain readable and visually
 * balanced.
 *
 *   · stor    → reference (current Stor variant)
 *   · h80     → height target ~80 %, full width
 *   · h70     → height target ~70 %, full width
 *   · h60     → height target ~60 %, full width
 *   · both80  → width + height both reduced (narrower max-width + shorter hero)
 */
export type StorSize = "stor" | "h80" | "h70" | "h60" | "both80";

export const STOR_SIZE_OPTIONS: { value: StorSize; label: string; hint: string }[] = [
  { value: "stor", label: "Stor", hint: "fuld størrelse" },
  { value: "h80", label: "−20 % H", hint: "kun højde, ~80 %" },
  { value: "h70", label: "−30 % H", hint: "kun højde, ~70 %" },
  { value: "h60", label: "−40 % H", hint: "kun højde, ~60 %" },
  { value: "both80", label: "−20 % B+H", hint: "smallere + lavere" },
];

export type StorSizeTokens = {
  /** Tailwind aspect class for the hero photo. */
  heroAspect: string;
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
  /** Line-clamp for the bio paragraph. */
  bioClamp: string;
  /** Avatar size token (passed to <HostAvatar />). */
  avatarSize: "md" | "lg";
  /** Vertical gap between elements in the middle column. */
  contentGap: string;
  /** Outer wrapper class (used by `both80` to narrow the whole card). */
  cardWrapper: string;
  /** Tweak the second package row's vertical density. */
  packageGap: string;
};

const TOKENS: Record<StorSize, StorSizeTokens> = {
  // Baseline — Triptych mosaic with the tallest hero (3:4 portrait).
  stor: {
    heroAspect: "aspect-[3/4]",
    photoColWidth: "md:w-[28rem]",
    contentPad: "p-5 md:p-6",
    railPad: "p-5 md:p-6",
    railWidth: "md:w-72",
    nameSize: "text-3xl",
    bioClamp: "line-clamp-3",
    avatarSize: "lg",
    contentGap: "gap-2.5",
    cardWrapper: "",
    packageGap: "space-y-2",
  },
  // ~80 % height — square hero, slightly tighter paddings, 2-line bio.
  h80: {
    heroAspect: "aspect-[1/1]",
    photoColWidth: "md:w-[28rem]",
    contentPad: "p-5",
    railPad: "p-5",
    railWidth: "md:w-64",
    nameSize: "text-2xl",
    bioClamp: "line-clamp-2",
    avatarSize: "lg",
    contentGap: "gap-2",
    cardWrapper: "",
    packageGap: "space-y-2",
  },
  // ~70 % height — narrower photo column, hero slightly wider than tall.
  h70: {
    heroAspect: "aspect-[5/4]",
    photoColWidth: "md:w-96",
    contentPad: "p-4 md:p-5",
    railPad: "p-4 md:p-5",
    railWidth: "md:w-60",
    nameSize: "text-2xl",
    bioClamp: "line-clamp-2",
    avatarSize: "md",
    contentGap: "gap-2",
    cardWrapper: "",
    packageGap: "space-y-1.5",
  },
  // ~60 % height — short hero (4:3), compact text, tightest paddings.
  h60: {
    heroAspect: "aspect-[4/3]",
    photoColWidth: "md:w-80",
    contentPad: "p-4",
    railPad: "p-4",
    railWidth: "md:w-56",
    nameSize: "text-xl",
    bioClamp: "line-clamp-2",
    avatarSize: "md",
    contentGap: "gap-1.5",
    cardWrapper: "",
    packageGap: "space-y-1.5",
  },
  // Width + height — narrower whole card AND square hero.
  both80: {
    heroAspect: "aspect-[1/1]",
    photoColWidth: "md:w-96",
    contentPad: "p-4 md:p-5",
    railPad: "p-4 md:p-5",
    railWidth: "md:w-60",
    nameSize: "text-2xl",
    bioClamp: "line-clamp-2",
    avatarSize: "md",
    contentGap: "gap-2",
    cardWrapper: "max-w-4xl",
    packageGap: "space-y-2",
  },
};

export function storSizeTokens(size: StorSize): StorSizeTokens {
  return TOKENS[size];
}

/**
 * Pill toggle that mirrors the look of `DensityToggle`.
 * Only rendered on `/wedding-djs-stacked-c` when density === "spacious".
 */
export function StorSizeToggle({
  value,
  onChange,
}: {
  value: StorSize;
  onChange: (next: StorSize) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Stor størrelse"
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5 text-xs"
    >
      {STOR_SIZE_OPTIONS.map((opt) => {
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
