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
import { useWeddingDJsListing } from "@/hooks/useWeddingDJsListing";
import { SETUP_SIZES } from "@/lib/constants";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { CANONICAL_PATH, HERO_IMAGE } from "@/lib/weddingDJsContent";
import { mockDJs } from "@/data/mock";
import type { DJProfileWithRelations } from "@/types/domain";

// Dummy DJs only used in this design test page so we can preview a 4-column grid
// padded with extra cards. Cloned from a real wedding-tagged DJ with new identities.
const dummyTemplates: Array<{
  username: string;
  stage_name: string;
  tagline: string;
  base_location: string;
  rating_average: number;
  rating_count: number;
  price_from_minor: number;
  is_featured: boolean;
  photo: string;
  avatar: string;
}> = [
  {
    username: "lasse-bredahl",
    stage_name: "DJ Lasse Bredahl",
    tagline: "Storgods-bryllupper og strand-receptioner — fra ceremoni til closer",
    base_location: "Aarhus",
    rating_average: 4.85,
    rating_count: 41,
    price_from_minor: 720000,
    is_featured: false,
    photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600",
    avatar: "https://images.unsplash.com/photo-1539571696857-5a6d61b7b3a4?q=80&w=400",
  },
  {
    username: "ida-wedding",
    stage_name: "DJ Ida",
    tagline: "Personlige bryllupper, første dans og blandet musiksmag",
    base_location: "Copenhagen",
    rating_average: 4.92,
    rating_count: 58,
    price_from_minor: 540000,
    is_featured: true,
    photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1600",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  },
  {
    username: "mikkel-norgaard",
    stage_name: "DJ Mikkel Nørgaard",
    tagline: "Live mix, vinyl-sæt og en ægte fest fra første dans til lukketid",
    base_location: "Odense",
    rating_average: 4.7,
    rating_count: 36,
    price_from_minor: 620000,
    is_featured: false,
    photo: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
  },
  {
    username: "freya-soundwave",
    stage_name: "Freya Soundwave",
    tagline: "Sange du elsker, blandet ind i sange du ikke vidste du elskede",
    base_location: "Copenhagen",
    rating_average: 4.95,
    rating_count: 72,
    price_from_minor: 690000,
    is_featured: true,
    photo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
  },
];

const baseTemplate = mockDJs[0];

const dummyDJs: DJProfileWithRelations[] = dummyTemplates.map((t, i) => ({
  ...baseTemplate,
  id: `dummyb-dj-${i + 1}`,
  user_id: `dummyb-user-${i + 1}`,
  username: t.username,
  stage_name: t.stage_name,
  tagline: t.tagline,
  base_location: t.base_location,
  rating_average: t.rating_average,
  rating_count: t.rating_count,
  price_from_minor: t.price_from_minor,
  price_on_request: false,
  is_featured: t.is_featured,
  profile: {
    ...baseTemplate.profile,
    id: `dummyb-user-${i + 1}`,
    full_name: t.stage_name,
    avatar_url: t.avatar,
    city: t.base_location,
  },
  equipment_photos: [
    {
      ...baseTemplate.equipment_photos[0],
      id: `dummyb-photo-${i + 1}`,
      dj_profile_id: `dummyb-dj-${i + 1}`,
      url: t.photo,
    },
  ],
}));

export function WeddingDJsTestBPage() {
  useDocumentHead({
    title: "[Test B] Wedding DJs · Sidebar · 4-col · DJConnect",
    description: "Design test variant — sidebar filters with a 4-column DJ grid.",
    canonical: CANONICAL_PATH,
    image: HERO_IMAGE,
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
  } = useWeddingDJsListing();

  // Append dummies in this design-test variant only.
  const availableWithDummies = [...availableDJs, ...dummyDJs];

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50">
      <div className="border-b bg-amber-50/70">
        <div className="container py-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-amber-800">
            Design test
          </span>
          <span className="mx-2 text-amber-700/70">·</span>
          <span className="text-amber-800">
            Variant B · Sidebar filters · 4-column grid · padded with 4 dummy DJ cards
          </span>
        </div>
      </div>
      <WeddingDJsHero />

      {/* PRIMARY: filter sidebar + DJ listing grid (4-col) */}
      <section className="container py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              {loading
                ? "Searching…"
                : `${availableWithDummies.length} wedding DJ${availableWithDummies.length === 1 ? "" : "s"} available`}
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
              <Label htmlFor="tb-city">Location</Label>
              <Input
                id="tb-city"
                className="mt-1"
                placeholder="City or region"
                value={filters.city ?? ""}
                onChange={(e) => update({ city: e.target.value || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="tb-date">Wedding date</Label>
              <Input
                id="tb-date"
                type="date"
                className="mt-1"
                value={sidebarDate}
                onChange={(e) => update({ date: e.target.value || undefined })}
              />
            </div>

            <div>
              <Label>Setup size</Label>
              <Select
                value={filters.setupSize ?? "__any"}
                onValueChange={(v) => update({ setupSize: v === "__any" ? undefined : v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any">Any size</SelectItem>
                  {SETUP_SIZES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} — {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="tb-max-price">Max price (DKK)</Label>
              <Input
                id="tb-max-price"
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full" />
                ))}
              </div>
            ) : availableWithDummies.length === 0 && unavailableDJs.length === 0 ? (
              <EmptyState
                title="No DJs match your filters"
                description="Try loosening some filters or expanding your location."
                action={<Button onClick={clearAllFilters}>Clear filters</Button>}
              />
            ) : (
              <div className="space-y-10">
                {availableWithDummies.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {availableWithDummies.map((dj) => (
                      <DJCard key={dj.id} dj={dj} eventTypeId="wedding" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
                    No wedding DJs available with these filters
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
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
