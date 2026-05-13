import { Filter, X } from "lucide-react";
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
import { WeddingDJsHero } from "@/components/wedding/WeddingDJsHero";
import { WeddingDJsBelowContent } from "@/components/wedding/WeddingDJsBelowContent";
import { SetupSizePicker } from "@/components/wedding/SetupSizePicker";
import { useWeddingDJsListing } from "@/hooks/useWeddingDJsListing";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { CANONICAL_PATH, HERO_IMAGE } from "@/lib/weddingDJsContent";
import { mockDJs } from "@/data/mock";
import type { DJProfileWithRelations } from "@/types/domain";

// Dummy wedding DJs only used in this design test page so the grid shows
// two full rows of 4 cards. Cloned from the real wedding-tagged DJs with
// distinct identities and photos.
const dummyDJTemplates: Array<{
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
    username: "emil-baun",
    stage_name: "DJ Emil Baun",
    tagline: "Roligt om aftenen, peak om natten — et bryllup bygget med jer",
    base_location: "Roskilde",
    rating_average: 4.8,
    rating_count: 47,
    price_from_minor: 580000,
    is_featured: false,
    photo: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1600",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
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

const dummyDJs: DJProfileWithRelations[] = dummyDJTemplates.map((t, i) => ({
  ...baseTemplate,
  id: `dummy-dj-${i + 1}`,
  user_id: `dummy-user-${i + 1}`,
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
    id: `dummy-user-${i + 1}`,
    full_name: t.stage_name,
    avatar_url: t.avatar,
    city: t.base_location,
  },
  equipment_photos: [
    {
      ...baseTemplate.equipment_photos[0],
      id: `dummy-photo-${i + 1}`,
      dj_profile_id: `dummy-dj-${i + 1}`,
      url: t.photo,
    },
  ],
}));

export function WeddingDJsPage() {
  useDocumentHead({
    title: "Wedding DJs · DJConnect",
    description:
      "Book a verified wedding DJ in Denmark. Compare DJs by setup, city and availability.",
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

  // Dummy DJs are appended in this design-test variant only.
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
            Variant A · Horizontal filters · 4-column grid · padded with 5 dummy DJ cards
          </span>
        </div>
      </div>
      <WeddingDJsHero />

      {/* PRIMARY: horizontal filter bar */}
      <section className="container py-6 sm:py-8">
        <div className="sticky top-16 z-20 -mx-4 mb-4 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Refine
            </span>

            <Input
              placeholder="City"
              value={filters.city ?? ""}
              onChange={(e) => update({ city: e.target.value || undefined })}
              className="h-9 w-32 rounded-full text-xs"
            />

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
          ) : availableWithDummies.length === 0 && unavailableDJs.length === 0 ? (
            <EmptyState
              title="No DJs match your filters"
              description="Try loosening some filters or expanding your location."
              action={<Button onClick={clearAllFilters}>Clear filters</Button>}
            />
          ) : (
            <div className="space-y-10">
              {availableWithDummies.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      </section>

      <WeddingDJsBelowContent />
    </div>
  );
}
