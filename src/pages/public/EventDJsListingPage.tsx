import { useEffect } from "react";
import { Filter, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DJCard } from "@/components/common/DJCard";
import { EmptyState } from "@/components/common/EmptyState";
import { EventDJsListingHero } from "@/components/event-djs/EventDJsListingHero";
import { EventDJsBelowContent } from "@/components/event-djs/EventDJsBelowContent";
import { SetupSizePicker } from "@/components/wedding/SetupSizePicker";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import type { EventListingConfig } from "@/lib/eventDJsContent";
import { openBrowseDJsGate } from "@/components/event-djs/BrowseDJsGate";

/**
 * Shared listing page for an event-specific DJ search. The same layout
 * (hero + horizontal filter bar + 4-col grid + below-content) is used
 * for every event type — only the config and the underlying event-type
 * filter change.
 */
export function EventDJsListingPage({ config }: { config: EventListingConfig }) {
  useDocumentHead({
    title: config.metaTitle,
    description: config.metaDescription,
    canonical: config.canonical,
    image: config.heroImage,
  });

  const {
    filters,
    sidebarDate,
    availableDJs,
    unavailableDJs,
    loading,
    update,
    clearAllFilters,
    activeCount,
    selectedDate,
  } = useEventDJsListing(config.id, config.label.toLowerCase());

  const city = filters.city;

  // If someone lands here without going through the Browse-DJs gate (no
  // city set), open the gate pre-filled with the event so they're funnelled
  // through it.
  useEffect(() => {
    if (!city) {
      openBrowseDJsGate({ eventTypeId: config.id });
    }
  }, [city, config.id]);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50">
      <EventDJsListingHero config={config} />

      {/* PRIMARY: horizontal filter bar */}
      <section className="container py-6 sm:py-8" id="top">
        <div className="sticky top-16 z-20 -mx-4 mb-4 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Refine
            </span>

            {city ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 pl-2.5 pr-1.5 py-1 text-xs">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{city}</span>
                <button
                  type="button"
                  onClick={() =>
                    openBrowseDJsGate({
                      eventTypeId: config.id,
                      city,
                      date: selectedDate,
                    })
                  }
                  className="ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Change
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => openBrowseDJsGate({ eventTypeId: config.id })}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <MapPin className="h-3.5 w-3.5" /> Pick a city
              </button>
            )}

            <Input
              type="date"
              value={sidebarDate}
              onChange={(e) => update({ date: e.target.value || undefined })}
              className="h-9 w-40 rounded-full text-xs"
            />

            <SetupSizePicker
              value={(filters.setupSize as "small" | "medium" | "large" | undefined) ?? null}
              onChange={(next) => update({ setupSize: next ?? undefined })}
            />

            <div className="ml-auto flex items-center gap-2">
              <Select
                value={filters.sortBy ?? "relevance"}
                onValueChange={(v) => update({ sort: v === "relevance" ? undefined : v })}
              >
                <SelectTrigger className="h-9 w-44 rounded-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort: Relevance</SelectItem>
                  <SelectItem value="price_asc">Price (low–high)</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="most_reviewed">Most reviewed</SelectItem>
                </SelectContent>
              </Select>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Listings — 4-col grid */}
        <div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full" />
              ))}
            </div>
          ) : availableDJs.length === 0 && unavailableDJs.length === 0 ? (
            <EmptyState
              title="No DJs match your filters"
              description="Try loosening some filters or expanding your location."
              action={<Button onClick={clearAllFilters}>Clear filters</Button>}
            />
          ) : (
            <div className="space-y-10">
              {availableDJs.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableDJs.map((dj) => (
                    <DJCard key={dj.id} dj={dj} eventTypeId={config.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
                  {config.emptyHint}
                  {selectedDate ? " on this date" : ""}.
                </div>
              )}

              {unavailableDJs.length > 0 && (
                <div>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold text-muted-foreground sm:text-lg">
                      Not available{selectedDate ? " for this date" : ""}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {unavailableDJs.length} {unavailableDJs.length === 1 ? "DJ" : "DJs"}
                    </span>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {unavailableDJs.map((u) => (
                      <DJCard
                        key={u.dj.id}
                        dj={u.dj}
                        eventTypeId={config.id}
                        unavailable={{ reason: u.reason, subReason: u.subReason }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <EventDJsBelowContent config={config} />
    </div>
  );
}
