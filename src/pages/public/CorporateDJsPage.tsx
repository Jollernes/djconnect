import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { CORPORATE_THEME } from "@/components/event-djs/grid/eventThemes";
import { SoftWeddingListingPage } from "@/pages/public/WeddingDJsPage";

/**
 * Corporate-party listings (`/corporate-djs`). Mirrors `/wedding-djs`
 * — shared `EventDJsListingPage` scaffolding + Soft Wedding · Stats
 * · Inline · Colour card layout — with the BryllupsDJ hallmark +
 * "brylluper" stat swapped out for the FirmaDJ / "firmaevents"
 * pair from `CORPORATE_THEME`, and the price-includes line dialled
 * to the typical corporate slot length (4 hours).
 */
export function CorporateDJsPage() {
  return (
    <SoftWeddingListingPage
      config={EVENT_LISTING_CONFIG.corporate_party}
      eventTheme={CORPORATE_THEME}
    />
  );
}
