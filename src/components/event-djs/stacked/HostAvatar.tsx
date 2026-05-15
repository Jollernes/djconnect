import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type HostAvatarTone = "neutral" | "boutique" | "concierge";

const SIZE: Record<"sm" | "md" | "lg", { box: string; ring: string; verifiedBox: string; verifiedIcon: string }> = {
  sm: { box: "h-6 w-6", ring: "ring-2", verifiedBox: "h-3 w-3 -right-0.5 -bottom-0.5", verifiedIcon: "h-2.5 w-2.5" },
  md: { box: "h-10 w-10", ring: "ring-2", verifiedBox: "h-4 w-4 -right-0.5 -bottom-0.5", verifiedIcon: "h-3 w-3" },
  lg: { box: "h-14 w-14", ring: "ring-[3px]", verifiedBox: "h-5 w-5 -right-1 -bottom-1", verifiedIcon: "h-3.5 w-3.5" },
};

const TONE: Record<HostAvatarTone, string> = {
  neutral: "ring-white",
  boutique: "ring-amber-100",
  concierge: "ring-white",
};

/**
 * Round host avatar pinned over the hero photo. Anchors "the human behind
 * the brand" — small ring for contrast against any photo, optional green
 * verified ✓ dot in the corner for trust-leaning variants.
 */
export function HostAvatar({
  src,
  alt,
  size = "md",
  tone = "neutral",
  verified = false,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  tone?: HostAvatarTone;
  verified?: boolean;
  className?: string;
}) {
  const s = SIZE[size];
  const initials = alt
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "overflow-hidden rounded-full bg-muted shadow-md",
          s.box,
          s.ring,
          TONE[tone],
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-slate-300 text-[10px] font-semibold text-white">
            {initials || "DJ"}
          </span>
        )}
      </span>
      {verified && (
        <span
          aria-label="Verified"
          className={cn(
            "absolute inline-flex items-center justify-center rounded-full bg-white shadow-sm",
            s.verifiedBox,
          )}
        >
          <BadgeCheck className={cn("fill-emerald-500 text-white", s.verifiedIcon)} />
        </span>
      )}
    </span>
  );
}
