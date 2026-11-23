import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { BIRTHDAY_THEME } from "@/components/event-djs/grid/eventThemes";
import { SoftWeddingListingPage } from "@/pages/public/WeddingDJsPage";

/**
 * Birthday listings (`/birthday-djs`). Mirrors `/wedding-djs` —
 * shared `EventDJsListingPage` scaffolding + Soft Wedding · Stats
 * · Inline · Colour card layout — with the BryllupsDJ hallmark
 * + "brylluper" stat swapped out for the FødselsdagsDJ /
 * "fødselsdage" pair from `BIRTHDAY_THEME`, and the price-includes
 * line dialled to the typical birthday slot length (4 hours).
 */
export function BirthdayDJsPage() {
  return (
    <SoftWeddingListingPage
      config={EVENT_LISTING_CONFIG.birthday}
      eventTheme={BIRTHDAY_THEME}
    />
  );
}
