import type {
  BriefContactRole,
  BudgetBand,
  EventType,
  GuestCountRange,
  Region,
  VibeTag,
  YesNoUnsure,
} from "@/types/domain";

export const PLATFORM_NAME = "DJConnect";
export const PLATFORM_TAGLINES = [
  "Danmarks nemmeste og tryggeste måde at booke musik til firmafesten.",
  "Professionel DJ, lyd, lys og backup samlet ét sted.",
  "Fortæl os om jeres arrangement. Vi matcher jer med den rette løsning.",
  "Du vælger pakken. Vi sikrer festen.",
] as const;
export const PLATFORM_TAGLINE = PLATFORM_TAGLINES[0];
export const PLATFORM_SUPPORT_EMAIL = "support@djconnect.dk";
export const PLATFORM_FEE_PERCENT = 10;

export const EVENT_TYPE_OPTIONS: { id: EventType; label: string }[] = [
  { id: "Firmafest", label: "Firmafest" },
  { id: "Julefrokost", label: "Julefrokost" },
  { id: "Påskefrokost", label: "Påskefrokost" },
  { id: "Sommerfest", label: "Sommerfest" },
  { id: "Middag og efterfest", label: "Middag og efterfest" },
  { id: "Kick-off", label: "Kick-off" },
  { id: "Jubilæum", label: "Jubilæum" },
  { id: "Reception", label: "Reception" },
  { id: "Andet firmaarrangement", label: "Andet firmaarrangement" },
  { id: "Anden firmafest", label: "Anden firmafest" },
];

export const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: "København / Sjælland", label: "København / Sjælland" },
  { id: "Fyn", label: "Fyn" },
  { id: "Aarhus / Østjylland", label: "Aarhus / Østjylland" },
  { id: "Aalborg / Nordjylland", label: "Aalborg / Nordjylland" },
  { id: "Sydjylland", label: "Sydjylland" },
  { id: "Hele Danmark / andet", label: "Hele Danmark / andet" },
];

export const GUEST_COUNT_RANGE_OPTIONS: { id: GuestCountRange; label: string }[] = [
  { id: "Under 50", label: "Under 50" },
  { id: "50-80", label: "50-80" },
  { id: "80-150", label: "80-150" },
  { id: "150-250", label: "150-250" },
  { id: "250-350", label: "250-350" },
  { id: "350+", label: "350+" },
];

export const VIBE_OPTIONS: { id: VibeTag; label: string }[] = [
  { id: "Elegant middag først, fest senere", label: "Elegant middag først, fest senere" },
  { id: "Bred firmafest for alle aldre", label: "Bred firmafest for alle aldre" },
  { id: "Julefrokost med singalong og klassikere", label: "Julefrokost med singalong og klassikere" },
  { id: "Moderne dance/pop", label: "Moderne dance/pop" },
  { id: "Disco, funk og 80’er/90’er", label: "Disco, funk og 80’er/90’er" },
  { id: "Internationalt publikum", label: "Internationalt publikum" },
  { id: "Rolig lounge og baggrund", label: "Rolig lounge og baggrund" },
  { id: "High-energy dansegulv", label: "High-energy dansegulv" },
];

export const BUDGET_BAND_OPTIONS: { id: BudgetBand; label: string }[] = [
  { id: "8.000-12.000 DKK", label: "8.000-12.000 DKK" },
  { id: "12.000-18.000 DKK", label: "12.000-18.000 DKK" },
  { id: "18.000-25.000 DKK", label: "18.000-25.000 DKK" },
  { id: "25.000+ DKK", label: "25.000+ DKK" },
  { id: "Ikke sikker", label: "Ikke sikker" },
];

export const YES_NO_UNSURE_OPTIONS: { id: YesNoUnsure; label: string }[] = [
  { id: "Ja", label: "Ja" },
  { id: "Nej", label: "Nej" },
  { id: "Ikke sikker", label: "Ikke sikker" },
];

export const TECHNICAL_NEEDS_OPTIONS = [
  { id: "needs_sound", label: "Brug for lydanlæg" },
  { id: "needs_lighting", label: "Brug for dansegulvslys" },
  { id: "needs_microphone", label: "Brug for mikrofon til taler" },
] as const;

export const BRIEF_CONTACT_ROLE_OPTIONS: { value: BriefContactRole; label: string }[] = [
  { value: "HR", label: "HR" },
  { value: "Office manager", label: "Office manager" },
  { value: "Assistant", label: "Assistent" },
  { value: "Event committee", label: "Festudvalg" },
  { value: "Founder/management", label: "Stifter/ledelse" },
  { value: "Other", label: "Andet" },
];

export const CONTACT_ROLE_OPTIONS = [
  { id: "client", label: "Kunde / bestiller" },
  { id: "dj", label: "DJ" },
  { id: "admin", label: "Admin" },
] as const;

export const PACKAGE_RECOMMENDATION_THRESHOLDS = {
  compactMaxGuests: 70,
  dinnerPartyMinGuests: 70,
  dinnerPartyMaxGuests: 160,
  largeMinGuests: 160,
  customMinGuests: 351,
} as const;
