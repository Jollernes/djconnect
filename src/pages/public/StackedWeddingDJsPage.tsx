import { useEffect, type ComponentType } from "react";
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
import { EmptyState } from "@/components/common/EmptyState";
import { EventDJsListingHero } from "@/components/event-djs/EventDJsListingHero";
import { EventDJsBelowContent } from "@/components/event-djs/EventDJsBelowContent";
import { SetupSizePicker } from "@/components/wedding/SetupSizePicker";
import { useEventDJsListing } from "@/hooks/useEventDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_LISTING_CONFIG } from "@/lib/eventDJsContent";
import { openBrowseDJsGate } from "@/components/event-djs/BrowseDJsGate";
import { StackedDJCardA } from "@/components/event-djs/stacked/StackedDJCardA";
import { StackedDJCardB } from "@/components/event-djs/stacked/StackedDJCardB";
import { StackedDJCardC } from "@/components/event-djs/stacked/StackedDJCardC";
import { DensityToggle } from "@/components/event-djs/stacked/DensityToggle";
import { useStackedDensity, type Density } from "@/components/event-djs/stacked/density";
import type { DJProfileWithRelations } from "@/types/domain";

type CardComponent = ComponentType<{
  dj: DJProfileWithRelations;
  eventTypeId?: string;
  unavailable?: { reason: string; subReason?: string } | null;
  density?: Density;
}>;

type Variant = {
  letter: "A" | "B" | "C";
  label: string;
  description: string;
  Card: CardComponent;
};

const VARIANTS: Record<"a" | "b" | "c", Variant> = {
  a: {
    letter: "A",
    label: "Variant A — Comparison row",
    description: "Booking.com / Thumbtack-style compact rows. Dense facts + locked price block.",
    Card: StackedDJCardA,
  },
  b: {
    letter: "B",
    label: "Variant B — Editorial showcase",
    description: "Airbnb / Patreon-style. Tall hero photos, serif headlines, vibe-first.",
    Card: StackedDJCardB,
  },
  c: {
    letter: "C",
    label: "Variant C — Media reel",
    description: "Three-photo strip + waveform mix preview. Treats DJs like creators.",
    Card: StackedDJCardC,
  },
};

const config = EVENT_LISTING_CONFIG.wedding;

/**
 * Stacked / one-card-per-row mock-ups of `/wedding-djs`. Same filter bar,
 * same gate, same real-DJ data — only the card layout changes per variant.
 */
export function StackedWeddingDJsPage({ variant }: { variant: "a" | "b" | "c" }) {
  const v = VARIANTS[variant];
  useDocumentHead({
    title: `[${v.letter}] ${config.metaTitle}`,
    description: config.metaDescription,
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
  const [density, setDensity] = useStackedDensity();

  useEffect(() => {
    if (!city) openBrowseDJsGate({ eventTypeId: config.id });
  }, [city]);

  const Card = v.Card;
  const skeletonHeight =
    density === "compact" ? "h-[120px]" : density === "comfortable" ? "h-[200px]" : "h-[300px]";

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50">
      <EventDJsListingHero config={config} />

      {/* Tiny variant ribbon so it's clear which mock-up you're looking at */}
      <div className="border-y bg-amber-50/60">
        <div className="container flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-xs">
          <span className="font-semibold uppercase tracking-[0.18em] text-amber-700">
            Mock-up · stacked rows
          </span>
          <span className="font-medium text-foreground">{v.label}</span>
          <span className="text-muted-foreground">{v.description}</span>
          <span className="ml-auto flex items-center gap-2 text-muted-foreground">
            Compare:
            <a
              href="/wedding-djs-stacked-a"
              className={variant === "a" ? "font-semibold text-foreground" : "hover:underline"}
            >
              A
            </a>
            <a
              href="/wedding-djs-stacked-b"
              className={variant === "b" ? "font-semibold text-foreground" : "hover:underline"}
            >
              B
            </a>
            <a
              href="/wedding-djs-stacked-c"
              className={variant === "c" ? "font-semibold text-foreground" : "hover:underline"}
            >
              C
            </a>
            <span>·</span>
            <a href="/wedding-djs" className="hover:underline">
              Current grid
            </a>
            {variant === "b" && (
              <>
                <span>·</span>
                <a
                  href="/wedding-djs-stacked-b-explore"
                  className="font-medium text-amber-700 hover:underline"
                >
                  Explore B variants →
                </a>
              </>
            )}
          </span>
        </div>
      </div>

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
                    openBrowseDJsGate({ eventTypeId: config.id, city, date: selectedDate })
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
              <DensityToggle value={density} onChange={setDensity} />
              <Select
                value={filters.sortBy ?? "relevance"}
                onValueChange={(val) => update({ sort: val === "relevance" ? undefined : val })}
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

        {/* Listings — stacked, one per row, matching filter-bar width */}
        <div>
          {loading ? (
            <div className={density === "compact" ? "space-y-2" : "space-y-4"}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={`${skeletonHeight} w-full`} />
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
                <div className={density === "compact" ? "space-y-2" : "space-y-4"}>
                  {availableDJs.map((dj) => (
                    <Card key={dj.id} dj={dj} eventTypeId={config.id} density={density} />
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
                  <div className={density === "compact" ? "space-y-2" : "space-y-4"}>
                    {unavailableDJs.map((u) => (
                      <Card
                        key={u.dj.id}
                        dj={u.dj}
                        eventTypeId={config.id}
                        density={density}
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
