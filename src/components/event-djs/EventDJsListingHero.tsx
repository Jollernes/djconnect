import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EventContextModal } from "@/components/common/EventContextModal";
import { useEventContext } from "@/hooks/useEventContext";
import type { EventListingConfig } from "@/lib/eventDJsContent";
import { slugForEventType } from "@/lib/eventDJsContent";

export function EventDJsListingHero({ config }: { config: EventListingConfig }) {
  const { set: setEventType } = useEventContext();
  const [switchOpen, setSwitchOpen] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Preserve city + date across event switches so the customer doesn't have
  // to re-enter them when jumping between event listings.
  function carriedParams(): string {
    const next = new URLSearchParams();
    const city = params.get("city");
    const date = params.get("date");
    if (city) next.set("city", city);
    if (date) next.set("date", date);
    const s = next.toString();
    return s ? `?${s}` : "";
  }

  return (
    <>
      <section className="border-b bg-white">
        <div className="container py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex items-center gap-4 sm:gap-5">
              <img
                src={config.heroImage}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                loading="eager"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {config.heroEyebrow}
                </p>
                <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  {config.heroTitle}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  {config.heroLede}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSwitchOpen(true)}
              className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
            >
              Switch event
            </button>
          </div>
        </div>
      </section>
      <EventContextModal
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        value={config.id}
        onSelect={(id) => {
          setEventType(id);
          if (!id) return;
          if (id !== config.id) navigate(`/${slugForEventType(id)}${carriedParams()}`);
        }}
        onBrowseAll={() => navigate(`/${config.slug}${carriedParams()}`)}
        title="Switch event"
        description="Browsing for a different event will change the DJ profiles you see."
      />
    </>
  );
}
