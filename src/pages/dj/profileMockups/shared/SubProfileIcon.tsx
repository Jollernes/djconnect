import { Briefcase, Cake, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockupSubProfileMeta } from "./types";

/**
 * Small monochrome icon used inside event-type tabs and progress rows.
 * Uses semantic glyphs (sparkles for the general profile, heart for
 * wedding, briefcase for corporate) chosen for instant recognisability
 * without needing colour as a primary cue.
 */
export function SubProfileIcon({
  meta,
  className,
}: {
  meta: MockupSubProfileMeta;
  className?: string;
}) {
  const Icon =
    meta.icon === "rings"
      ? Heart
      : meta.icon === "cake"
      ? Cake
      : meta.icon === "sparkles"
      ? Sparkles
      : Briefcase;
  return <Icon className={cn("h-4 w-4", className)} aria-hidden="true" />;
}
