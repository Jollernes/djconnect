import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDJs } from "@/hooks/useDJs";
import { mockBookings } from "@/data/mock";
import type { DJProfileWithRelations, SearchFilters } from "@/types/domain";

export type UnavailableEntry = {
  dj: DJProfileWithRelations;
  reason: string;
  subReason?: string;
};

/**
 * Listing hook for an event-specific DJ page. Splits the real DJ catalog
 * into "available for this event/date" and "not available, here's why",
 * driven by URL filters and the supplied `eventTypeId`.
 */
export function useEventDJsListing(eventTypeId: string, eventLabelLower: string) {
  const [params, setParams] = useSearchParams();

  const selectedDate = params.get("date") ?? undefined;

  const filters = useMemo<SearchFilters>(
    () => ({
      query: params.get("q") ?? undefined,
      city: params.get("city") ?? undefined,
      setupSize: params.get("setupSize") ?? undefined,
      minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
      maxPriceMinor: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      sortBy: (params.get("sort") as SearchFilters["sortBy"]) ?? "relevance",
    }),
    [params],
  );

  const { djs: rawDJs, loading } = useDJs(filters);

  const { availableDJs, unavailableDJs } = useMemo(() => {
    const formatDate = (iso: string) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };
    const blocking = new Set(["confirmed", "pending"]);
    const available: DJProfileWithRelations[] = [];
    const unavailable: UnavailableEntry[] = [];
    // "other" is the catch-all listing — show every DJ in the catalog
    // (no DJ explicitly tags themselves with the "other" event id).
    const isCatchAll = eventTypeId === "other";
    for (const dj of rawDJs) {
      const matchesEvent =
        isCatchAll || dj.event_types.some((et) => et.id === eventTypeId);
      const hasConflict = selectedDate
        ? mockBookings.some(
            (b) =>
              b.dj_profile_id === dj.id &&
              blocking.has(b.status) &&
              b.event_date === selectedDate,
          )
        : false;
      if (!matchesEvent) {
        unavailable.push({
          dj,
          reason: `Not a ${eventLabelLower} specialist`,
          subReason: `DJ doesn't list ${eventLabelLower} as one of their events`,
        });
      } else if (hasConflict && selectedDate) {
        unavailable.push({
          dj,
          reason: `Booked on ${formatDate(selectedDate)}`,
          subReason: "Try another date or pick another DJ",
        });
      } else {
        available.push(dj);
      }
    }
    return { availableDJs: available, unavailableDJs: unavailable };
  }, [rawDJs, selectedDate, eventTypeId, eventLabelLower]);

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    setParams(next);
  }

  function clearAllFilters() {
    setParams(new URLSearchParams());
  }

  const activeCount =
    (filters.city ? 1 : 0) +
    (filters.setupSize ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxPriceMinor ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (filters.query ? 1 : 0);

  return {
    filters,
    selectedDate,
    sidebarDate: selectedDate ?? "",
    availableDJs,
    unavailableDJs,
    loading,
    update,
    clearAllFilters,
    activeCount,
  };
}
