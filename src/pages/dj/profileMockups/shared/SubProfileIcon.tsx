import { Briefcase, Cake, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockupSubProfileMeta } from "./types";

/**
 * Small monochrome icon used inside event-type tabs and progress rows.
 * Uses semantic glyphs (heart for wedding, cake for birthday, briefcase
 * for corporate) chosen for instant recognisability without needing
 * colour as a primary cue.
 */
export function SubProfileIcon({
  meta,
  className,
}: {
  meta: MockupSubProfileMeta;
  className?: string;
}) {
  const Icon =
    meta.icon === "rings" ? Heart : meta.icon === "cake" ? Cake : Briefcase;
  return <Icon className={cn("h-4 w-4", className)} aria-hidden="true" />;
}
