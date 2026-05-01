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
  { id: "intimate", label: "Intimate", range: "Up to 30", estimate: 25, tagline: "Apartment, ceremony only, family dinner" },
  { id: "small", label: "Small", range: "30–80", estimate: 60, tagline: "House party, small venue, family wedding" },
  { id: "medium", label: "Medium", range: "80–150", estimate: 120, tagline: "Most weddings, mid-size venue" },
  { id: "large", label: "Large", range: "150–250", estimate: 200, tagline: "Big hall, company party, gala" },
  { id: "huge", label: "Huge", range: "250+", estimate: 350, tagline: "Outdoor wedding, corporate gala, festival" },
];

export type CityOption = {
  id: string;
  label: string;
  region: string;
};

export const CITY_OPTIONS: CityOption[] = [
  { id: "Copenhagen", label: "Copenhagen", region: "Hovedstaden" },
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
  { id: "pop", label: "Pop", emoji: "🎵", description: "Charts, sing-alongs" },
  { id: "rnb", label: "R&B / Soul", emoji: "🎤", description: "Smooth, vocal-led" },
  { id: "latin", label: "Latin", emoji: "💃", description: "Salsa, reggaeton" },
  { id: "disco", label: "Disco / Funk", emoji: "🕺", description: "70s & 80s grooves" },
  { id: "house", label: "House", emoji: "🎧", description: "Deep, tech, classic" },
  { id: "rock", label: "Rock", emoji: "🎸", description: "Classic & indie rock" },
  { id: "folk", label: "Danish folk", emoji: "🇩🇰", description: "Dansktop, fællessang" },
  { id: "eighties", label: "80s & 90s", emoji: "📻", description: "Nostalgia hits" },
  { id: "hiphop", label: "Hip-hop", emoji: "🎙️", description: "Old-school to current" },
  { id: "edm", label: "EDM", emoji: "🔊", description: "Big-room, festival" },
  { id: "afro", label: "Afrobeats", emoji: "🥁", description: "Modern African pop" },
  { id: "jazz", label: "Jazz / Lounge", emoji: "🎷", description: "Background, dinner" },
];

export type ExtraOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

export const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "wireless_mic", label: "Wireless mic for speeches", description: "Toasts, MC, ceremony", emoji: "🎤" },
  { id: "first_dance", label: "First-dance coordination", description: "Pre-event planning call", emoji: "💃" },
  { id: "karaoke", label: "Karaoke segment", description: "1–2 hours of singalong", emoji: "🎶" },
  { id: "photo_booth", label: "Photo booth", description: "Branded prints + props", emoji: "📸" },
  { id: "outdoor_power", label: "Outdoor power", description: "Generator-ready setup", emoji: "⚡" },
  { id: "branded_booth", label: "Branded DJ booth", description: "Your logo on the front", emoji: "🪧" },
  { id: "late_night", label: "Late-night extension", description: "Past 02:00 closing", emoji: "🌙" },
  { id: "uplighting", label: "Uplighting / room wash", description: "Coloured wall lighting", emoji: "🌈" },
  { id: "english_speaking", label: "English-speaking DJ", description: "International guests", emoji: "🌍" },
  { id: "sober_curated", label: "Family-friendly playlist", description: "No explicit lyrics", emoji: "🎈" },
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
    label: "Tight",
    range: "Up to DKK 6,500",
    rangeMinor: [0, 650000],
    description: "Solo DJ, compact setup, shorter set",
    illustration: "tight",
  },
  {
    id: "comfortable",
    label: "Comfortable",
    range: "DKK 6,500 – 12,000",
    rangeMinor: [650000, 1200000],
    description: "Most bookings — full evening, full kit",
    illustration: "comfortable",
  },
  {
    id: "premium",
    label: "Premium",
    range: "DKK 12,000 +",
    rangeMinor: [1200000, Number.MAX_SAFE_INTEGER],
    description: "Top-tier DJ, large rig, MC, custom lighting",
    illustration: "premium",
  },
];

export const TOTAL_QUESTION_STEPS = 8;
