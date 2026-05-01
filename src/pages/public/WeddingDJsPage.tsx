import { useMemo } from "react";
import { Filter, X, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { WeddingDJsHero } from "@/components/wedding/WeddingDJsHero";
import { WeddingDJsBelowContent } from "@/components/wedding/WeddingDJsBelowContent";
import { SetupSizePicker } from "@/components/wedding/SetupSizePicker";
import { useWeddingDJsListing } from "@/hooks/useWeddingDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import {
  CANONICAL_PATH,
  HERO_IMAGE,
  faq,
  totalWeddingDJs,
  weddingPricing,
} from "@/lib/weddingDJsContent";

export function WeddingDJsPage() {
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
  } = useWeddingDJsListing();

  const jsonLd = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://djconnect.example";
    const pricing = weddingPricing;
    return [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Wedding DJ booking — DJConnect",
        serviceType: "Wedding DJ",
        category: "Wedding entertainment",
        provider: { "@type": "Organization", name: "DJConnect", url: origin },
        areaServed: { "@type": "Country", name: "Denmark" },
        offers: pricing
          ? {
              "@type": "AggregateOffer",
              priceCurrency: "DKK",
              lowPrice: Math.round(pricing.min / 100),
              highPrice: Math.round(pricing.max / 100),
              offerCount: totalWeddingDJs,
            }
          : undefined,
        url: `${origin}${CANONICAL_PATH}`,
        description:
          "Book verified, equipment-checked wedding DJs in Denmark. Escrow-protected payment, written contract, and a music planner included with every booking.",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DJConnect", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: "Wedding DJs",
            item: `${origin}${CANONICAL_PATH}`,
          },
        ],
      },
    ];
  }, []);

  useDocumentHead({
    title: "Wedding DJs in Denmark · Verified, escrow-protected · DJConnect",
    description:
      "Book a verified wedding DJ in Denmark. Equipment-checked, reference-verified, escrow-protected payment, written contract, and a music planner included. From DKK 7,500.",
    canonical: CANONICAL_PATH,
    image: HERO_IMAGE,
    jsonLd,
  });

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50">
      <WeddingDJsHero />

      {/* PRIMARY: filter sidebar + DJ listing grid */}
      <section className="container py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              {loading
                ? "Searching…"
                : `${availableDJs.length} wedding DJ${availableDJs.length === 1 ? "" : "s"} available`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {!loading && unavailableDJs.length > 0 ? (
                <>
                  {unavailableDJs.length} more {unavailableDJs.length === 1 ? "DJ" : "DJs"}{" "}
                  {selectedDate ? "are booked or don't fit your event" : "don't fit a wedding"} —
                  shown below as not available.
                </>
              ) : (
                <>All photos, sets, and pricing tailored to weddings.</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="DJ name, bio, or location"
                value={filters.query ?? ""}
                onChange={(e) => update({ q: e.target.value || undefined })}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.sortBy ?? "relevance"}
              onValueChange={(v) => update({ sort: v === "relevance" ? undefined : v })}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price (low–high)</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="most_reviewed">Most reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 self-start rounded-xl border bg-card p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" /> Filters
              </h3>
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
                onChange={(e) => update({ city: e.target.value || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="date-filter">Wedding date</Label>
              <Input
                id="date-filter"
                type="date"
                className="mt-1"
                value={sidebarDate}
                onChange={(e) => update({ date: e.target.value || undefined })}
              />
            </div>

            <div>
              <Label>Setup size</Label>
              <div className="mt-1">
                <SetupSizePicker
                  value={(filters.setupSize as "small" | "medium" | "large" | undefined) ?? null}
                  onChange={(next) => update({ setupSize: next ?? undefined })}
                />
              </div>
            </div>

            <div>
              <Label>Minimum rating</Label>
              <Select
                value={String(filters.minRating ?? "__any")}
                onValueChange={(v) => update({ minRating: v === "__any" ? undefined : v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
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
                placeholder="e.g. 15000"
                value={filters.maxPriceMinor ? Math.round(filters.maxPriceMinor / 100) : ""}
                onChange={(e) =>
                  update({
                    maxPrice: e.target.value ? String(Number(e.target.value) * 100) : undefined,
                  })
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              You're browsing wedding DJs only. Switch event from the banner above to change context.
            </p>
          </aside>

          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
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
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {availableDJs.map((dj) => (
                      <DJCard key={dj.id} dj={dj} eventTypeId="wedding" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
                    No wedding DJs available with these filters
                    {selectedDate ? " on this date" : ""}. Try {selectedDate ? "another date or " : ""}
                    loosening your filters — or look at the unavailable DJs below to get a feel for who's
                    out there.
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
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {unavailableDJs.map((u) => (
                        <DJCard
                          key={u.dj.id}
                          dj={u.dj}
                          eventTypeId="wedding"
                          unavailable={{ reason: u.reason, subReason: u.subReason }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <WeddingDJsBelowContent />
    </div>
  );
}
