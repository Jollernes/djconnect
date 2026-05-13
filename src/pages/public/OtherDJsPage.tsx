import { EventDJsListingPage } from "@/pages/public/EventDJsListingPage";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";

export function OtherDJsPage() {
  return <EventDJsListingPage config={EVENT_LISTING_CONFIG.other} />;
}
