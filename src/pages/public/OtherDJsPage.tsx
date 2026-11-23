import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { OTHER_THEME } from "@/components/event-djs/grid/eventThemes";
import { SoftWeddingListingPage } from "@/pages/public/WeddingDJsPage";

/**
 * Catch-all "Other" event listings (`/other-djs` or whichever slug
 * the config defines). Mirrors `/wedding-djs` — shared
 * `EventDJsListingPage` scaffolding + Soft Wedding · Stats ·
 * Inline · Colour card layout — with the BryllupsDJ hallmark +
 * "brylluper" stat swapped out for the EventDJ / "events" pair
 * from `OTHER_THEME`. The price-includes line stays at the generic
 * 4-hour slot.
 */
export function OtherDJsPage() {
  return (
    <SoftWeddingListingPage
      config={EVENT_LISTING_CONFIG.other}
      eventTheme={OTHER_THEME}
    />
  );
}
