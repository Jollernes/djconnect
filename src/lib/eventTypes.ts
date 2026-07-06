import { Flower2, PartyPopper, Snowflake, Sparkles, SunMedium, type LucideIcon } from "lucide-react";
import type { EventType, GuestCountRange } from "@/types/domain";

export type BriefEventType = "Julefrokost" | "Påskefrokost" | "Sommerfest" | "Reception" | "Anden firmafest";
export type GuestTier = "compact" | "medium" | "large";

export interface BriefEventTypeConfig {
  label: string;
  icon: LucideIcon;
  iconToneClassName: string;
  cardToneClassName: string;
  expectationCopy: string;
  setupCopy: Record<GuestTier, string>;
  matchingEventTypes: EventType[];
}

export const BRIEF_EVENT_TYPE_OPTIONS: Array<{ id: BriefEventType; label: string }> = [
  { id: "Julefrokost", label: "Julefrokost" },
  { id: "Påskefrokost", label: "Påskefrokost" },
  { id: "Sommerfest", label: "Sommerfest" },
  { id: "Reception", label: "Reception" },
  { id: "Anden firmafest", label: "Anden firmafest" },
];

export const BRIEF_EVENT_TYPE_CONFIGS: Record<BriefEventType, BriefEventTypeConfig> = {
  Julefrokost: {
    label: "Julefrokost",
    icon: Snowflake,
    iconToneClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
    cardToneClassName: "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300",
    expectationCopy:
      "Vi leverer en varm og festlig løsning med sikre juleklassikere, plads til taler og en klar plan for både middag og dansegulv.",
    setupCopy: {
      compact: "Et elegant kompakt setup med diskret lyd, varm belysning og tydelig taleforståelighed.",
      medium: "Et balanceret setup med fuldt danselys, ekstra headroom og en overgang fra middag til fest.",
      large: "Et større setup med flere zoner, kraftigere lyd og en fleksibel løsning til hele selskabet.",
    },
    matchingEventTypes: ["Julefrokost", "Firmafest", "Andet firmaarrangement"],
  },
  Påskefrokost: {
    label: "Påskefrokost",
    icon: Flower2,
    iconToneClassName: "border-lime-200 bg-lime-50 text-lime-600",
    cardToneClassName: "border-lime-200 bg-lime-50/60 hover:border-lime-300",
    expectationCopy:
      "Vi planlægger en let og lys løsning med god energi, smidig afvikling og musik, der bygger stemningen op uden at overdøve samtalerne.",
    setupCopy: {
      compact: "Et lyst og let setup med diskret lyd, blød belysning og plads til taler eller præsentationer.",
      medium: "Et velafbalanceret setup med mere punch på dansegulvet, men stadig ro til spisningen.",
      large: "Et større setup med tydelig opbygning til fest, talespor og en stærk afslutning på aftenen.",
    },
    matchingEventTypes: ["Påskefrokost", "Julefrokost", "Firmafest"],
  },
  Sommerfest: {
    label: "Sommerfest",
    icon: SunMedium,
    iconToneClassName: "border-amber-200 bg-amber-50 text-amber-600",
    cardToneClassName: "border-amber-200 bg-amber-50/60 hover:border-amber-300",
    expectationCopy:
      "Vi leverer en afslappet, solrig løsning med let musik, god timing og en fest, der føles naturlig fra velkomst til sidste nummer.",
    setupCopy: {
      compact: "Et kompakt sommer-setup med klar lyd, stemningslys og en afslappet overgang fra hygge til fest.",
      medium: "Et medium setup med ekstra lydreserve, varme farver og et dansespor, der kan samle hele holdet.",
      large: "Et stort sommer-setup med flere zoner, robust lyd og en tydelig festprofil til mange gæster.",
    },
    matchingEventTypes: ["Sommerfest", "Reception", "Firmafest"],
  },
  Reception: {
    label: "Reception",
    icon: Sparkles,
    iconToneClassName: "border-sky-200 bg-sky-50 text-sky-600",
    cardToneClassName: "border-sky-200 bg-sky-50/60 hover:border-sky-300",
    expectationCopy:
      "Vi skaber en elegant og rolig reception med afdæmpet lyd, præcis timing og en løsning, der understøtter værtsrollen.",
    setupCopy: {
      compact: "Et diskret setup med smuk lyd og et elegant udtryk, der holder samtalerne i centrum.",
      medium: "Et afbalanceret setup med plads til taler, baggrundsmusik og en kontrolleret overgang til fest.",
      large: "Et større setup til mange gæster med tydelig lydfordeling og sikker håndtering af taler og flow.",
    },
    matchingEventTypes: ["Reception", "Firmafest", "Andet firmaarrangement"],
  },
  "Anden firmafest": {
    label: "Anden firmafest",
    icon: PartyPopper,
    iconToneClassName: "border-violet-200 bg-violet-50 text-violet-600",
    cardToneClassName: "border-violet-200 bg-violet-50/60 hover:border-violet-300",
    expectationCopy:
      "Vi tilpasser løsningen efter jeres program, tone og ambitionsniveau, så festen føles skræddersyet og enkel at afvikle.",
    setupCopy: {
      compact: "Et fleksibelt kompakt setup til mindre firmaevents med tydelig lyd og rolig opsætning.",
      medium: "Et alsidigt setup, der balancerer taler, middag og dansegulv uden at fylde unødigt.",
      large: "Et markant setup til store firmafester med kraftig lyd, god lysdækning og solid afvikling.",
    },
    matchingEventTypes: ["Firmafest", "Andet firmaarrangement", "Middag og efterfest", "Kick-off", "Jubilæum"],
  },
};

export const BRIEF_EVENT_TYPE_CONFIG_LIST = BRIEF_EVENT_TYPE_OPTIONS.map((option) => ({
  ...option,
  ...BRIEF_EVENT_TYPE_CONFIGS[option.id],
}));

export function normalizeBriefEventType(value: string | null | undefined): BriefEventType {
  switch (value) {
    case "Julefrokost":
    case "Påskefrokost":
    case "Sommerfest":
    case "Reception":
    case "Anden firmafest":
      return value;
    case "Firmafest":
    case "Middag og efterfest":
    case "Kick-off":
    case "Jubilæum":
    case "Andet firmaarrangement":
      return "Anden firmafest";
    default:
      return "Julefrokost";
  }
}

export function getBriefEventTypeConfig(eventType: BriefEventType) {
  return BRIEF_EVENT_TYPE_CONFIGS[eventType];
}

export function getBriefGuestTier(guestCountRange: GuestCountRange): GuestTier {
  switch (guestCountRange) {
    case "Under 50":
    case "50-80":
      return "compact";
    case "80-150":
      return "medium";
    case "150-250":
    case "250-350":
    case "350+":
      return "large";
    default:
      return "compact";
  }
}

export function getBriefSetupImageUrl(guestCountRange: GuestCountRange) {
  const tier = getBriefGuestTier(guestCountRange);
  return {
    compact:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    medium:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    large:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80",
  }[tier];
}

export function getBriefSetupCopy(eventType: BriefEventType, guestCountRange: GuestCountRange) {
  return getBriefEventTypeConfig(eventType).setupCopy[getBriefGuestTier(guestCountRange)];
}
