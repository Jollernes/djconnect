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
    label: "Bryllup",
    longLabel: "et bryllup",
    Icon: Heart,
    tint: "from-rose-500/15 to-rose-500/5 text-rose-600",
    description: "Ceremoni & reception",
  },
  {
    id: "birthday",
    label: "Fødselsdag",
    longLabel: "en fødselsdagsfest",
    Icon: Cake,
    tint: "from-amber-500/15 to-amber-500/5 text-amber-600",
    description: "Mærkedagsfester",
  },
  {
    id: "corporate_event",
    label: "Firma",
    longLabel: "et firmaarrangement",
    Icon: Briefcase,
    tint: "from-sky-500/15 to-sky-500/5 text-sky-600",
    description: "Konferencer & lanceringer",
  },
  {
    id: "corporate_party",
    label: "Firmafest",
    longLabel: "en firmafest",
    Icon: PartyPopper,
    tint: "from-violet-500/15 to-violet-500/5 text-violet-600",
    description: "Sommer & jul",
  },
  {
    id: "private_party",
    label: "Privat",
    longLabel: "en privatfest",
    Icon: Users,
    tint: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    description: "Jubilæer & mere",
  },
  {
    id: "other",
    label: "Andet",
    longLabel: "et event",
    Icon: Sparkles,
    tint: "from-pink-500/15 to-pink-500/5 text-pink-600",
    description: "Alt andet",
  },
];

export function getEventTypeOption(id: string | null | undefined): EventTypeOption | null {
  if (!id) return null;
  return EVENT_TYPE_OPTIONS.find((o) => o.id === id) ?? null;
}
