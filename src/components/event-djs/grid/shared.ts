import type { DJProfileWithRelations } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

const GENRE_POOLS = [
  "Pop, House, R&B",
  "House, Disco, Pop",
  "Open Format, Top 40",
  "80s, 90s, Disco",
  "Afro House, Tech, Pop",
  "Latin, Pop, Reggaeton",
];

export function genresFor(dj: DJProfileWithRelations): string {
  const seed = dj.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GENRE_POOLS[seed % GENRE_POOLS.length]!;
}

const DA_EVENT_LABELS: Record<string, string> = {
  wedding: "Bryllup",
  birthday: "Fest",
  corporate_event: "Firmaevent",
  corporate_party: "Firmafest",
  private_party: "Privatfest",
  other: "Studentergilde",
};

export function eventTypesLine(dj: DJProfileWithRelations, max = 3): string {
  return dj.event_types
    .slice(0, max)
    .map((t) => DA_EVENT_LABELS[t.id] || t.label)
    .join(", ");
}

export function priceFromLabel(dj: DJProfileWithRelations): string {
  if (dj.price_on_request || !dj.price_from_minor) return "Pris på forespørgsel";
  return `Fra ${formatCurrency(dj.price_from_minor, dj.currency)}`;
}

export function priceRangeLabel(dj: DJProfileWithRelations): string {
  if (dj.price_on_request || !dj.price_from_minor) return "Pris på forespørgsel";
  const upper = Math.round((dj.price_from_minor * 1.85) / 100) * 100;
  return `Fra ${formatCurrency(dj.price_from_minor, dj.currency)} – ${formatCurrency(upper, dj.currency)}`;
}

/**
 * Deterministic photo-count hint per DJ so the counter pill / "+N
 * fotos" label reads consistently across renders.
 */
export function photoCountFor(dj: DJProfileWithRelations): number {
  const realCount = dj.equipment_photos.length;
  if (realCount >= 6) return realCount;
  const seed = dj.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 6 + (seed % 7); // 6..12
}

export function djHref(dj: DJProfileWithRelations, eventTypeId?: string): string {
  return eventTypeId
    ? `/djs/${dj.username}?eventType=${eventTypeId}`
    : `/djs/${dj.username}`;
}

/** N deterministic thumbnail URLs sourced from `dj.equipment_photos`,
 * falling back to the hero photo if fewer than N photos exist. Defaults
 * to 3 thumbs to match the existing card layouts. */
export function thumbnailsFor(dj: DJProfileWithRelations, count = 3): string[] {
  const photos = dj.equipment_photos.map((p) => p.url).filter(Boolean);
  if (photos.length >= count) return photos.slice(0, count);
  const fallback = photos[0] || dj.profile.avatar_url || "";
  const out = [...photos];
  while (out.length < count) out.push(fallback);
  return out;
}
