/**
 * Static content for the "Get 3 offers" wizard. Centralised so copy edits
 * happen in one place and so each step component stays presentational.
 */

export type OfferEventTypeId =
  | "wedding"
  | "birthday"
  | "corporate_event"
  | "corporate_party"
  | "private_party"
  | "other";

export type OfferSetupId = "small" | "medium" | "large";

export type OfferBudgetId = "tight" | "comfortable" | "premium";

export type GuestBucketId = "intimate" | "small" | "medium" | "large" | "huge";

export type GuestBucket = {
  id: GuestBucketId;
  label: string;
  range: string;
  estimate: number;
  tagline: string;
};

export const GUEST_BUCKETS: GuestBucket[] = [
  { id: "intimate", label: "Intim", range: "Op til 30", estimate: 25, tagline: "Lejlighed, kun ceremoni, familiemiddag" },
  { id: "small", label: "Lille", range: "30–80", estimate: 60, tagline: "Hjemmefest, lille lokale, familiebryllup" },
  { id: "medium", label: "Mellem", range: "80–150", estimate: 120, tagline: "De fleste bryllupper, mellemstort lokale" },
  { id: "large", label: "Stor", range: "150–250", estimate: 200, tagline: "Stor sal, firmafest, gallafest" },
  { id: "huge", label: "Meget stor", range: "250+", estimate: 350, tagline: "Udendørs bryllup, firmagalla, festival" },
];

export type CityOption = {
  id: string;
  label: string;
  region: string;
};

export const CITY_OPTIONS: CityOption[] = [
  { id: "Copenhagen", label: "København", region: "Hovedstaden" },
  { id: "Aarhus", label: "Aarhus", region: "Midtjylland" },
  { id: "Odense", label: "Odense", region: "Syddanmark" },
  { id: "Aalborg", label: "Aalborg", region: "Nordjylland" },
  { id: "Esbjerg", label: "Esbjerg", region: "Syddanmark" },
  { id: "Roskilde", label: "Roskilde", region: "Sjælland" },
];

export type GenreOption = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export const GENRE_OPTIONS: GenreOption[] = [
  { id: "pop", label: "Pop", emoji: "🎵", description: "Hitlister, fællessang" },
  { id: "rnb", label: "R&B / Soul", emoji: "🎤", description: "Blødt, vokaldrevet" },
  { id: "latin", label: "Latin", emoji: "💃", description: "Salsa, reggaeton" },
  { id: "disco", label: "Disco / Funk", emoji: "🕺", description: "70'er- & 80'er-grooves" },
  { id: "house", label: "House", emoji: "🎧", description: "Deep, tech, klassisk" },
  { id: "rock", label: "Rock", emoji: "🎸", description: "Klassisk & indierock" },
  { id: "folk", label: "Dansk folk", emoji: "🇩🇰", description: "Dansktop, fællessang" },
  { id: "eighties", label: "80'er & 90'er", emoji: "📻", description: "Nostalgiske hits" },
  { id: "hiphop", label: "Hip-hop", emoji: "🎙️", description: "Old-school til nutid" },
  { id: "edm", label: "EDM", emoji: "🔊", description: "Big-room, festival" },
  { id: "afro", label: "Afrobeats", emoji: "🥁", description: "Moderne afrikansk pop" },
  { id: "jazz", label: "Jazz / Lounge", emoji: "🎷", description: "Baggrund, middag" },
];

export type ExtraOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

export const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "wireless_mic", label: "Trådløs mikrofon til taler", description: "Skåltaler, konferencier, ceremoni", emoji: "🎤" },
  { id: "first_dance", label: "Koordinering af bryllupsdans", description: "Planlægningsopkald før eventet", emoji: "💃" },
  { id: "karaoke", label: "Karaoke-indslag", description: "1–2 timers fællessang", emoji: "🎶" },
  { id: "photo_booth", label: "Fotoboks", description: "Brandede print + rekvisitter", emoji: "📸" },
  { id: "outdoor_power", label: "Strøm udendørs", description: "Klar til generator", emoji: "⚡" },
  { id: "branded_booth", label: "Brandet DJ-pult", description: "Dit logo på fronten", emoji: "🪧" },
  { id: "late_night", label: "Forlængelse sent om natten", description: "Efter kl. 02:00", emoji: "🌙" },
  { id: "uplighting", label: "Effektbelysning / room wash", description: "Farvet vægbelysning", emoji: "🌈" },
  { id: "english_speaking", label: "Engelsktalende DJ", description: "Internationale gæster", emoji: "🌍" },
  { id: "sober_curated", label: "Familievenlig playliste", description: "Ingen eksplicitte tekster", emoji: "🎈" },
];

export type BudgetOption = {
  id: OfferBudgetId;
  label: string;
  range: string;
  rangeMinor: [number, number];
  description: string;
  illustration: "tight" | "comfortable" | "premium";
};

export const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: "tight",
    label: "Stramt",
    range: "Op til 6.500 kr.",
    rangeMinor: [0, 650000],
    description: "Solo-DJ, kompaktopsætning, kortere sæt",
    illustration: "tight",
  },
  {
    id: "comfortable",
    label: "Komfortabelt",
    range: "6.500 – 12.000 kr.",
    rangeMinor: [650000, 1200000],
    description: "De fleste bookinger — hele aftenen, fuldt udstyr",
    illustration: "comfortable",
  },
  {
    id: "premium",
    label: "Premium",
    range: "12.000 kr. +",
    rangeMinor: [1200000, Number.MAX_SAFE_INTEGER],
    description: "Topklasse-DJ, stort anlæg, konferencier, tilpasset lys",
    illustration: "premium",
  },
];

export const TOTAL_QUESTION_STEPS = 8;
