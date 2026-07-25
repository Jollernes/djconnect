import { EventDJsListingPage } from "@/pages/public/EventDJsListingPage";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { GridCardV23SoftWedding, SoftWeddingMobileRow } from "@/components/event-djs/grid/V23SoftWedding";
import {
  WEDDING_THEME,
  type EventTheme,
} from "@/components/event-djs/grid/eventThemes";
import { formatDanishDate } from "@/lib/formatDanishDate";
import type { DJProfileWithRelations } from "@/types/domain";
import type { EventListingConfig } from "@/lib/eventDJsContent";

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
/** Shared renderer for the live event-DJs browse pages. Drops a
 * Soft Wedding · Stats · Inline · Colour card into the listing
 * grid, with the hallmark badge + "events-played" stat swapped
 * out per `eventTheme` (BryllupsDJ / FødselsdagsDJ / FirmaDJ /
 * EventDJ). Card layout, colourway, and editorial hero treatment
 * are identical across event types so the marketplace reads as a
 * single surface. */
/** Per-DJ hero photo overrides for the live `/wedding-djs` cards,
 * keyed by DJ username. Applied to both the mobile row and the desktop
 * editorial card so the visible listings use the supplied portraits. */
const WEDDING_HERO_OVERRIDES: Record<string, string> = {
  "alex-holm": "/dj-photos/wedding-hero-1.png",
  "mia-sorensen": "/dj-photos/wedding-hero-3.png",
  "flashback-mobildiskotek": "/dj-photos/wedding-hero-2.png",
};

export function renderSoftWeddingCard(
  eventTheme: EventTheme,
  priceIncludes?: string[],
  heroOverrides?: Record<string, string>,
) {
  return function renderCard({
    dj,
    eventTypeId,
    selectedDate,
    unavailable,
  }: {
    dj: DJProfileWithRelations;
    eventTypeId: string;
    selectedDate?: string;
    unavailable?: { reason: string; subReason?: string } | null;
  }) {
    return (
      <>
        {/* Mobile: compact horizontal row */}
        <div className="md:hidden">
          <SoftWeddingMobileRow
            dj={dj}
            eventTypeId={eventTypeId}
            eventTheme={eventTheme}
            heroOverrides={heroOverrides}
            availabilityDate={formatDanishDate(selectedDate)}
            selectedDate={selectedDate}
            unavailable={unavailable}
          />
        </div>
        {/* Desktop: full editorial card */}
        <div className="hidden md:block">
          <GridCardV23SoftWedding
            dj={dj}
            eventTypeId={eventTypeId}
            density="4"
            tint="none"
            heroGrayscale={0}
            avatarGrayscale={false}
            bioLines={3}
            heroOverrides={heroOverrides}
            showWeddingsPlayed
            hideEventTypes
            hideStarRating
            showRegion
            showSeeProfileCta
            priceIncludes={priceIncludes ?? eventTheme.defaultPriceIncludes}
            statStyle="inline"
            ctaProminence="filled"
            availabilityDate={formatDanishDate(selectedDate)}
            selectedDate={selectedDate}
            eventTheme={eventTheme}
            unavailable={unavailable}
          />
        </div>
      </>
    );
  };
}

/** Shared scaffold used by the four live event-DJs browse pages.
 * Picks the listing config + event-theme pack from a single call
 * site so each page becomes a 1-line component. */
export function SoftWeddingListingPage({
  config,
  eventTheme,
  priceIncludes,
  heroOverrides,
}: {
  config: EventListingConfig;
  eventTheme: EventTheme;
  priceIncludes?: string[];
  heroOverrides?: Record<string, string>;
}) {
  return (
    <EventDJsListingPage
      config={config}
      renderCard={renderSoftWeddingCard(eventTheme, priceIncludes, heroOverrides)}
    />
  );
}

export function WeddingDJsPage() {
  return (
    <SoftWeddingListingPage
      config={EVENT_LISTING_CONFIG.wedding}
      eventTheme={WEDDING_THEME}
      heroOverrides={WEDDING_HERO_OVERRIDES}
    />
  );
}
