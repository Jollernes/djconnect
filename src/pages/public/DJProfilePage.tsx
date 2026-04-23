import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Shield, Music4, Users, Calendar as CalendarIcon, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";
import { PhotoGallery } from "@/components/common/PhotoGallery";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { useDJ } from "@/hooks/useDJs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockReviews } from "@/data/mock";

export function DJProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { dj, reviews: liveReviews, loading } = useDJ(username ?? "");
  const [favourited, setFavourited] = useState(false);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (!dj) {
    return (
      <div className="container py-16">
        <EmptyState
          title="DJ not found"
          description="This profile may have been removed or is pending verification."
          action={
            <Button asChild>
              <Link to="/search">Browse other DJs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const reviews = liveReviews.length ? liveReviews : mockReviews.filter((r) => r.dj_profile_id === dj.id);

  return (
    <div className="container py-8 pb-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
              <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold">{dj.stage_name}</h1>
                <Badge variant="success" className="gap-1">
                  <Shield className="h-3.5 w-3.5" /> Verified DJ
                </Badge>
                {dj.is_featured && <Badge variant="accent">Featured</Badge>}
              </div>
              {dj.tagline && <p className="mt-1 text-lg text-muted-foreground">{dj.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <StarRating value={dj.rating_average} showValue reviewCount={dj.rating_count} />
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {dj.base_location} · Travels up to {dj.travel_radius_km}km
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Favourite"
              onClick={() => setFavourited((f) => !f)}
              className={favourited ? "text-destructive" : ""}
            >
              <Heart className={favourited ? "fill-current" : ""} />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard icon={<Music4 className="h-4 w-4" />} label="Experience" value={`${dj.years_experience} yrs`} />
            <StatCard icon={<CalendarIcon className="h-4 w-4" />} label="Events performed" value={dj.events_performed} />
            <StatCard icon={<Users className="h-4 w-4" />} label="Setup size" value={dj.setup_size} capitalize />
            <StatCard icon={<Star className="h-4 w-4" />} label="Rating" value={`${dj.rating_average.toFixed(1)}/5`} />
          </div>

          <section>
            <h2 className="mb-2 text-xl font-semibold">About</h2>
            <p className="whitespace-pre-line text-muted-foreground">{dj.bio}</p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">Event types</h2>
            <div className="flex flex-wrap gap-2">
              {dj.event_types.map((et) => (
                <Badge key={et.id} variant="secondary">{et.label}</Badge>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">Equipment & setup</h2>
            <p className="text-muted-foreground">{dj.equipment_description}</p>
            {dj.equipment_photos.length > 0 && (
              <div className="mt-4">
                <PhotoGallery images={dj.equipment_photos.map((p) => ({ id: p.id, url: p.url }))} />
              </div>
            )}
          </section>

          {dj.notable_clients && (
            <section>
              <h2 className="mb-2 text-xl font-semibold">Notable events & clients</h2>
              <p className="text-muted-foreground">{dj.notable_clients}</p>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reviews</h2>
              {reviews.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <StarRating value={dj.rating_average} showValue reviewCount={dj.rating_count} />
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="This DJ is new to the platform — be the first to book." />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm">{review.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <div className="text-sm text-muted-foreground">Starting price</div>
                <div className="text-2xl font-semibold">
                  {dj.price_on_request
                    ? "Price on request"
                    : dj.price_from_minor
                    ? formatCurrency(dj.price_from_minor, dj.currency)
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Final price depends on event length, travel, and extras.
                </p>
              </div>
              <Separator />
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link to={`/book/${dj.username}`}>Request booking</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Payment held securely in escrow until after your event.
              </p>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-semibold">Availability</h3>
                <AvailabilityCalendar bookedDates={[]} blockedDates={[]} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 shadow-lg lg:hidden">
        <div className="container flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">From</div>
            <div className="text-lg font-semibold">
              {dj.price_on_request
                ? "Quote on request"
                : dj.price_from_minor
                ? formatCurrency(dj.price_from_minor, dj.currency)
                : "—"}
            </div>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link to={`/book/${dj.username}`}>Request booking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, capitalize }: { icon: React.ReactNode; label: string; value: string; capitalize?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">{icon}</span>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
