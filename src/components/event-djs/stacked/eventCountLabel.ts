/**
 * Returns the Danish label for the event-count KPI tile based on which
 * listing the customer is browsing. Defaults to a neutral "events" so the
 * tile still reads correctly when no event context is known.
 */
export function eventCountLabel(eventTypeId?: string): string {
  switch (eventTypeId) {
    case "wedding":
      return "bryllupper";
    case "birthday":
      return "fester";
    case "corporate_event":
    case "corporate_party":
      return "events";
    case "private_party":
      return "fester";
    case "other":
    default:
      return "events";
  }
}

const EVENTS_BUCKET_TO_COUNT: Record<string, string> = {
  "0-10": "5+",
  "10-50": "30+",
  "51-100": "80+",
  "100+": "150+",
};

/**
 * Maps the events_performed bucket field into a single short display
 * number for the KPI tile. Returns the raw bucket as fallback so the tile
 * still has *some* value rather than collapsing.
 */
export function eventCountValue(bucket: string | null | undefined): string {
  if (!bucket) return "—";
  return EVENTS_BUCKET_TO_COUNT[bucket] ?? bucket;
}
