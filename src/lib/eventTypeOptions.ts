import type { LucideIcon } from "lucide-react";
import { Heart, Cake, Briefcase, PartyPopper, Users, Sparkles } from "lucide-react";

export type EventTypeOption = {
  id: string;
  /** Short label used in chips, search bars, and headers. */
  label: string;
  /** Sentence-case label used in copy ("for a wedding", "for an office party"). */
  longLabel: string;
  Icon: LucideIcon;
  tint: string;
  description: string;
};

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    id: "wedding",
    label: "Wedding",
    longLabel: "a wedding",
    Icon: Heart,
    tint: "from-rose-500/15 to-rose-500/5 text-rose-600",
    description: "Ceremony & reception",
  },
  {
    id: "birthday",
    label: "Birthday",
    longLabel: "a birthday party",
    Icon: Cake,
    tint: "from-amber-500/15 to-amber-500/5 text-amber-600",
    description: "Milestone parties",
  },
  {
    id: "corporate_event",
    label: "Corporate",
    longLabel: "a corporate event",
    Icon: Briefcase,
    tint: "from-sky-500/15 to-sky-500/5 text-sky-600",
    description: "Conferences & launches",
  },
  {
    id: "corporate_party",
    label: "Office Party",
    longLabel: "an office party",
    Icon: PartyPopper,
    tint: "from-violet-500/15 to-violet-500/5 text-violet-600",
    description: "Summer & holiday",
  },
  {
    id: "private_party",
    label: "Private",
    longLabel: "a private party",
    Icon: Users,
    tint: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    description: "Anniversaries & more",
  },
  {
    id: "other",
    label: "Other",
    longLabel: "an event",
    Icon: Sparkles,
    tint: "from-pink-500/15 to-pink-500/5 text-pink-600",
    description: "Anything else",
  },
];

export function getEventTypeOption(id: string | null | undefined): EventTypeOption | null {
  if (!id) return null;
  return EVENT_TYPE_OPTIONS.find((o) => o.id === id) ?? null;
}
