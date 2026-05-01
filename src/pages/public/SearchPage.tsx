import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DJCard } from "@/components/common/DJCard";
import { EmptyState } from "@/components/common/EmptyState";
import { EventContextBanner } from "@/components/common/EventContextBanner";
import { EventContextModal } from "@/components/common/EventContextModal";
import { useEventContext } from "@/hooks/useEventContext";
import { SETUP_SIZES } from "@/lib/constants";
import { useDJs } from "@/hooks/useDJs";
import type { SearchFilters } from "@/types/domain";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { eventTypeId, set: setEventType } = useEventContext();

  const filters = useMemo<SearchFilters>(() => {
    const eventTypes = eventTypeId ? [eventTypeId] : [];
    return {
      query: params.get("q") ?? undefined,
      city: params.get("city") ?? undefined,
      date: params.get("date") ?? undefined,
      eventTypes,
      setupSize: params.get("setupSize") ?? undefined,
      minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
      maxPriceMinor: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      sortBy: (params.get("sort") as SearchFilters["sortBy"]) ?? "relevance",
    };
  }, [params, eventTypeId]);

  const { djs, loading } = useDJs(filters);

  function update(patch: Record<string, string | string[] | undefined>) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length === 0) next.delete(k);
        else next.set(k, v.join(","));
      } else if (!v) {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setParams(next);
  }

  function clearAllFilters() {
    const next = new URLSearchParams();
    if (eventTypeId) next.set("eventType", eventTypeId);
    setParams(next);
  }

  // First-visit picker: if user lands on /search with no event context, prompt once.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDismissed, setPickerDismissed] = useState(false);
  useEffect(() => {
    if (!eventTypeId && !pickerDismissed) {
      const timer = setTimeout(() => setPickerOpen(true), 250);
      return () => clearTimeout(timer);
    }
  }, [eventTypeId, pickerDismissed]);

  const activeCount =
    (filters.city ? 1 : 0) +
    (filters.setupSize ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxPriceMinor ? 1 : 0);

  return (
    <div className="container py-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Browse DJs</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Searching…" : `${djs.length} verified DJ${djs.length === 1 ? "" : "s"} available`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="DJ name, bio, or location"
              value={filters.query ?? ""}
              onChange={(e) => update({ q: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={filters.sortBy} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price (low–high)</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="most_reviewed">Most reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EventContextBanner
        eventTypeId={eventTypeId}
        onChange={setEventType}
        variant="search"
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4" /> Filters
            </h2>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="city-filter">Location</Label>
            <Input
              id="city-filter"
              className="mt-1"
              placeholder="City or region"
              value={filters.city ?? ""}
              onChange={(e) => update({ city: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="date-filter">Available on</Label>
            <Input
              id="date-filter"
              type="date"
              className="mt-1"
              value={filters.date ?? ""}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>

          <div>
            <Label>Setup size</Label>
            <Select
              value={filters.setupSize ?? ""}
              onValueChange={(v) => update({ setupSize: v === "__any" ? undefined : v })}
            >
              <SelectTrigger className="mt-1"><SelectValue placeholder="Any size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any size</SelectItem>
                {SETUP_SIZES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label} — {s.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Minimum rating</Label>
            <Select
              value={String(filters.minRating ?? "")}
              onValueChange={(v) => update({ minRating: v === "__any" ? undefined : v })}
            >
              <SelectTrigger className="mt-1"><SelectValue placeholder="Any rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any rating</SelectItem>
                <SelectItem value="4">4★ and up</SelectItem>
                <SelectItem value="4.5">4.5★ and up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="max-price">Max price (DKK)</Label>
            <Input
              id="max-price"
              type="number"
              className="mt-1"
              placeholder="e.g. 10000"
              value={filters.maxPriceMinor ? Math.round(filters.maxPriceMinor / 100) : ""}
              onChange={(e) => update({ maxPrice: e.target.value ? String(Number(e.target.value) * 100) : undefined })}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            The event type is set above and applies to every DJ shown. Tap "Change event" to switch.
          </p>
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full" />
              ))}
            </div>
          ) : djs.length === 0 ? (
            <EmptyState
              title="No DJs match your filters"
              description="Try loosening some filters or expanding your location."
              action={<Button onClick={clearAllFilters}>Clear filters</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {djs.map((dj) => (
                <DJCard key={dj.id} dj={dj} eventTypeId={eventTypeId || undefined} />
              ))}
            </div>
          )}
        </div>
      </div>

      <EventContextModal
        open={pickerOpen}
        onOpenChange={(o) => {
          setPickerOpen(o);
          if (!o) setPickerDismissed(true);
        }}
        value={eventTypeId}
        onSelect={setEventType}
        onBrowseAll={() => setPickerDismissed(true)}
      />
    </div>
  );
}
