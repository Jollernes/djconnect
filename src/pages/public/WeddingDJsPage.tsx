import { EventDJsListingPage } from "@/pages/public/EventDJsListingPage";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";

/**
 * Wedding listings (`/wedding-djs`) — Browse DJ flow when the user
 * picks the Wedding event type. Uses the shared `EventDJsListingPage`
 * scaffolding (hero, filter bar, grid, below-content) but overrides
 * the card slot with the Soft Wedding · Stats · Inline · Colour
 * design from `/wedding-djs-curved-sweep`: full-colour hero with the
 * BryllupsDJ hallmark + carved avatar, inline stat row, dynamic
 * "Åben d. <dato>" availability hint when the customer has picked
 * a date, and a prominent filled "Se profil & kontakt DJen" CTA.
 *
 * The Soft Wedding · Triptych backup design is preserved as a tab on
 * `/wedding-djs-curved-sweep?variant=soft-wedding-triptych` so it can
 * be swapped in later without re-implementing it.
 */
export function WeddingDJsPage() {
  return (
    <EventDJsListingPage
      config={EVENT_LISTING_CONFIG.wedding}
      renderCard={({ dj, eventTypeId, selectedDate, unavailable }) => (
        <GridCardV23SoftWedding
          dj={dj}
          eventTypeId={eventTypeId}
          density="4"
          tint="none"
          heroGrayscale={0}
          avatarGrayscale={false}
          bioLines={3}
          showWeddingsPlayed
          hideEventTypes
          hideStarRating
          showRegion
          showSeeProfileCta
          priceIncludes={["5 timer inkl. lyd & lys"]}
          statStyle="inline"
          ctaProminence="filled"
          availabilityDate={formatDanishDate(selectedDate)}
          unavailable={unavailable}
        />
      )}
    />
  );
}

/** Format an ISO date (`2025-06-14`) as `d. 14. juni 2025` for the
 *  availability hint. Returns `undefined` when no date is selected
 *  so the card omits the hint and lets the CTA own the full footer. */
function formatDanishDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `d. ${d.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}
