import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type HostAvatarTone = "neutral" | "boutique" | "concierge";

const SIZE: Record<
  "sm" | "md" | "lg",
  { box: string; verifiedBox: string; verifiedIcon: string }
> = {
  sm: { box: "h-7 w-7", verifiedBox: "h-[10px] w-[10px] -right-[1px] -bottom-[1px]", verifiedIcon: "h-[7px] w-[7px]" },
  md: { box: "h-9 w-9", verifiedBox: "h-3 w-3 -right-0.5 -bottom-0.5", verifiedIcon: "h-2 w-2" },
  lg: { box: "h-12 w-12", verifiedBox: "h-4 w-4 -right-0.5 -bottom-0.5", verifiedIcon: "h-2.5 w-2.5" },
};

const TONE: Record<HostAvatarTone, string> = {
  neutral: "ring-white/90",
  boutique: "ring-amber-100",
  concierge: "ring-slate-200",
};

/**
 * Elegant round host avatar — single thin ring + soft drop-shadow, sized
 * to sit alongside the DJ's stage name rather than over the photo. The
 * verified ✓ dot is a small green chevron with a thin white halo (B & C).
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
    <span
      className={cn(
        "relative inline-flex shrink-0",
        className,
      )}
      style={{ filter: "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.10))" }}
    >
      <span
        className={cn(
          "overflow-hidden rounded-full bg-muted ring-1",
          s.box,
          TONE[tone],
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 text-[10px] font-semibold text-white">
            {initials || "DJ"}
          </span>
        )}
      </span>
      {verified && (
        <span
          aria-label="Verified"
          className={cn(
            "absolute inline-flex items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white",
            s.verifiedBox,
          )}
        >
          <BadgeCheck className={cn("text-white", s.verifiedIcon)} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}
