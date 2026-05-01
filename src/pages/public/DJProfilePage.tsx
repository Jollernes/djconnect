import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Shield,
  Music4,
  Users,
  Calendar as CalendarIcon,
  Star,
  Heart,
  Share2,
  Headphones,
  Speaker,
  Mic2,
  Lightbulb,
  Sparkles,
  MessageCircle,
  Clock,
  Languages,
  Check,
  Award,
  Disc3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "@/components/common/StarRating";
import { ProfileGallery } from "@/components/common/ProfileGallery";
import { EventContextBanner } from "@/components/common/EventContextBanner";
import { useEventContext } from "@/hooks/useEventContext";
import { Equalizer } from "@/components/common/Equalizer";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { DJCard } from "@/components/common/DJCard";
import { useDJ, useDJs } from "@/hooks/useDJs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockReviews } from "@/data/mock";

export function DJProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { dj, reviews: liveReviews, loading } = useDJ(username ?? "");
  const { djs: allDJs } = useDJs();
  const { eventTypeId, set: setEventType } = useEventContext();
  const [favourited, setFavourited] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const bookHref = eventTypeId
    ? `/book/${dj?.username}?eventType=${eventTypeId}`
    : `/book/${dj?.username}`;

  const galleryImages = useMemo(() => {
    if (!dj) return [];
    const equip = dj.equipment_photos.map((p) => ({
      id: p.id,
      url: p.url,
      alt: `${dj.stage_name} live setup`,
    }));
    if (dj.profile.avatar_url) {
      equip.push({
        id: "avatar",
        url: dj.profile.avatar_url,
        alt: dj.stage_name,
      });
    }
    return equip;
  }, [dj]);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-2/3" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Skeleton className="aspect-[5/4] w-full" />
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
          </div>
        </div>
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

  const reviews = liveReviews.length
    ? liveReviews
    : mockReviews.filter((r) => r.dj_profile_id === dj.id);
  const similarDJs = allDJs.filter((d) => d.id !== dj.id).slice(0, 3);
  const longBio = (dj.bio?.length ?? 0) > 280;
  const equipmentLines = dj.equipment_description
    .split(/[,.·]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50 pb-28">
      <div className="container pt-6 sm:pt-10">
        {/* Headline strip */}
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {dj.stage_name}
            </h1>
            {dj.tagline && (
              <p className="mt-1 max-w-2xl text-pretty text-base text-muted-foreground">
                {dj.tagline}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {dj.rating_average.toFixed(2)}
                <span className="text-muted-foreground">
                  · {dj.rating_count} reviews
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-600" />
                Verified DJ
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {dj.base_location}
              </span>
              {dj.is_featured && (
                <Badge variant="accent" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Top-rated
                </Badge>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5 underline underline-offset-4">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={
                "gap-1.5 underline underline-offset-4 " +
                (favourited ? "text-rose-500" : "")
              }
              onClick={() => setFavourited((f) => !f)}
            >
              <Heart className={"h-4 w-4 " + (favourited ? "fill-current" : "")} />
              <span className="hidden sm:inline">{favourited ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </div>

        {eventTypeId && (
          <EventContextBanner
            eventTypeId={eventTypeId}
            onChange={setEventType}
            variant="profile"
            className="mb-4"
          />
        )}

        {/* Photo collage */}
        <ProfileGallery images={galleryImages} />

        {/* Festive ribbon — neon strip with equalizer + signal pills */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border bg-[hsl(222_47%_10%)] px-4 py-3 text-white sm:px-6">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(90deg, hsla(21,90%,53%,0.55) 0%, hsla(280,85%,60%,0.45) 35%, hsla(199,89%,60%,0.4) 65%, hsla(21,90%,53%,0.55) 100%)",
              backgroundSize: "200% 100%",
              animation: "marquee 14s linear infinite",
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Equalizer bars={4} className="h-4 text-amber-300" />
              <span>LIVE on DJConnect</span>
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-300" /> {dj.events_performed} events performed
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Replies within 2h
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Disc3 className="h-4 w-4 animate-spin-slow" style={{ animationDuration: "8s" }} />
              {dj.years_experience} yrs experience
            </span>
          </div>
        </div>
      </div>

      <div className="container mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Main column */}
        <div className="min-w-0 space-y-10">
          {/* Hosted by */}
          <section className="flex items-start justify-between gap-6 border-b pb-8">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Hosted by {dj.profile.full_name?.split(" ")[0] ?? dj.stage_name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Professional DJ · {dj.years_experience} years on the decks · Travels up to{" "}
                {dj.travel_radius_km}km
              </p>
            </div>
            <Avatar className="h-16 w-16 ring-2 ring-white sm:h-20 sm:w-20">
              <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
              <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </section>

          {/* Highlight stats */}
          <section className="grid gap-4 border-b pb-10 sm:grid-cols-2">
            <Highlight
              icon={<Sparkles className="h-5 w-5" />}
              title="Top-rated on DJConnect"
              body={`${dj.rating_count} reviews averaging ${dj.rating_average.toFixed(1)}★ — guests consistently call out the energy on the dancefloor.`}
            />
            <Highlight
              icon={<Shield className="h-5 w-5" />}
              title="Background-verified"
              body="ID + business documents reviewed by DJConnect. Payments held in escrow until 24h after your event."
            />
            <Highlight
              icon={<MessageCircle className="h-5 w-5" />}
              title="Quick to respond"
              body="Replies to booking requests within 2 hours on average — you'll hear back fast."
            />
            <Highlight
              icon={<Music4 className="h-5 w-5" />}
              title="Reads the room"
              body="Builds the night with you in advance, then adapts live. Smooth handovers between speeches, dinner, and dancing."
            />
          </section>

          {/* About */}
          <section>
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">About this DJ</h2>
            <p
              className={
                "whitespace-pre-line text-[15px] leading-relaxed text-foreground/85 " +
                (longBio && !aboutExpanded ? "line-clamp-5" : "")
              }
            >
              {dj.bio}
            </p>
            {longBio && (
              <button
                type="button"
                onClick={() => setAboutExpanded((e) => !e)}
                className="mt-2 text-sm font-medium underline underline-offset-4"
              >
                {aboutExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </section>

          <Separator />

          {/* What's included / equipment */}
          <section>
            <h2 className="mb-1 text-xl font-semibold sm:text-2xl">What's included</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Everything {dj.profile.full_name?.split(" ")[0] ?? "your DJ"} brings to your event.
            </p>
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {equipmentLines.slice(0, 8).map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-700">
                    {iconForLine(i)}
                  </span>
                  <span className="text-[15px] leading-snug">{line}</span>
                </div>
              ))}
            </div>
            {dj.equipment_description && equipmentLines.length === 0 && (
              <p className="text-muted-foreground">{dj.equipment_description}</p>
            )}
          </section>

          <Separator />

          {/* Genres / event types */}
          <section>
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Perfect for</h2>
            <div className="flex flex-wrap gap-2">
              {dj.event_types.map((et) => (
                <Badge
                  key={et.id}
                  variant="outline"
                  className="rounded-full border-foreground/15 bg-white px-4 py-1.5 text-sm font-medium"
                >
                  {et.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* Live mix tile — festive */}
          <section className="relative overflow-hidden rounded-3xl border bg-[hsl(222_47%_10%)] p-6 text-white sm:p-8">
            <div className="absolute inset-0 hero-gradient opacity-50" />
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur">
                  <Headphones className="h-3.5 w-3.5" /> Sample mix
                </div>
                <h3 className="text-xl font-semibold sm:text-2xl">
                  60-minute wedding warm-up set
                </h3>
                <p className="mt-1 max-w-md text-sm text-white/75">
                  A taste of how {dj.stage_name} builds the room from welcome drinks to the first dance.
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                className="gap-2 shadow-lg shadow-black/30"
                aria-label="Play sample mix"
              >
                <Disc3 className="h-5 w-5 animate-spin-slow" />
                Play preview
              </Button>
            </div>
            <Waveform />
          </section>

          {/* Notable */}
          {dj.notable_clients && (
            <section>
              <h2 className="mb-2 text-xl font-semibold sm:text-2xl">Notable events & clients</h2>
              <p className="text-[15px] leading-relaxed text-foreground/85">{dj.notable_clients}</p>
            </section>
          )}

          <Separator />

          {/* Availability */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl">Availability</h2>
              <span className="text-sm text-muted-foreground">Tap a date to start booking</span>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-white">
              <AvailabilityCalendar bookedDates={[]} blockedDates={[]} />
            </div>
          </section>

          <Separator />

          {/* Reviews */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-semibold sm:text-2xl">
                {dj.rating_average.toFixed(2)} · {dj.rating_count} reviews
              </h2>
            </div>
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="This DJ is new to the platform — be the first to book."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {reviews.slice(0, 6).map((review) => (
                  <Card key={review.id} className="border-none shadow-none">
                    <CardContent className="space-y-3 p-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {String(review.customer_id).slice(-2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">Verified guest</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                      <StarRating value={review.rating} size="sm" />
                      <p className="text-[15px] leading-relaxed">{review.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* FAQ */}
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Things to know</h2>
            <Accordion type="multiple" className="rounded-2xl border bg-white">
              <AccordionItem value="cancel" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Cancellation policy
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Free cancellation up to 30 days before the event. 50% refund 14–30 days before.
                  Within 14 days, the booking is non-refundable so the DJ can hold the date.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="travel" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Travel & logistics
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Travels up to {dj.travel_radius_km}km from {dj.base_location}. Travel beyond that
                  can be quoted on request. Standard setup is 90 minutes; pack-down is 45 minutes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="venue" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Venue requirements
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Needs a 3m×2m flat surface near a 230V outlet, plus access for a small load-in.
                  Can scale the rig up or down to suit any venue.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment" className="px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Payment & protection
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Pay securely through DJConnect. Funds are held in escrow and only released to the
                  DJ 24 hours after the event — so you're protected if anything goes wrong.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Sticky booking sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Card className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-2xl font-semibold">
                      {dj.price_on_request
                        ? "On request"
                        : dj.price_from_minor
                        ? formatCurrency(dj.price_from_minor, dj.currency)
                        : "—"}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">/ event</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {dj.rating_average.toFixed(2)}
                    <span className="text-muted-foreground/70">
                      · {dj.rating_count}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
                  <div className="border-r p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Event type
                    </div>
                    <div className="mt-1 text-sm font-medium">Wedding · 6h</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Guests
                    </div>
                    <div className="mt-1 text-sm font-medium">Up to 250</div>
                  </div>
                </div>

                <Button asChild variant="accent" size="lg" className="w-full text-base shadow-lg">
                  <Link to={bookHref}>Request booking</Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  You won't be charged yet — quote first, then secure payment.
                </p>

                <Separator />

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <span>Payment held securely in escrow until 24h after your event.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-foreground/70" />
                    <span>Average response time: under 2 hours.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Languages className="mt-0.5 h-4 w-4 text-foreground/70" />
                    <span>Speaks Danish & English fluently.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CalendarIcon className="mt-0.5 h-4 w-4 text-foreground/70" />
                    <span>Free cancellation up to 30 days before the event.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <p className="mt-4 px-2 text-xs text-muted-foreground">
              Report this profile · Last updated {formatDate(dj.updated_at)}
            </p>
          </div>
        </aside>
      </div>

      {/* Similar DJs */}
      {similarDJs.length > 0 && (
        <section className="container mt-16">
          <h2 className="mb-5 text-xl font-semibold sm:text-2xl">More DJs you might love</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similarDJs.map((d) => (
              <DJCard key={d.id} dj={d} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold">
              {dj.price_on_request
                ? "On request"
                : dj.price_from_minor
                ? formatCurrency(dj.price_from_minor, dj.currency)
                : "—"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {dj.rating_average.toFixed(2)} · {dj.rating_count} reviews
            </div>
          </div>
          <Button asChild variant="accent" size="lg" className="shadow-lg">
            <Link to={bookHref}>Request booking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Highlight({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 text-amber-700">
        {icon}
      </span>
      <div>
        <div className="text-base font-semibold">{title}</div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function iconForLine(i: number) {
  const icons = [
    <Music4 key="m" className="h-5 w-5" />,
    <Speaker key="sp" className="h-5 w-5" />,
    <Lightbulb key="l" className="h-5 w-5" />,
    <Mic2 key="mc" className="h-5 w-5" />,
    <Disc3 key="d" className="h-5 w-5" />,
    <Headphones key="h" className="h-5 w-5" />,
    <Sparkles key="s" className="h-5 w-5" />,
    <Check key="c" className="h-5 w-5" />,
    <Users key="u" className="h-5 w-5" />,
  ];
  return icons[i % icons.length];
}

function Waveform() {
  const bars = Array.from({ length: 56 });
  return (
    <div className="relative mt-6 flex h-24 items-end gap-[3px] sm:h-28">
      {bars.map((_, i) => {
        const h = 14 + Math.abs(Math.sin(i * 0.42)) * 70 + (i % 7) * 4;
        return (
          <span
            key={i}
            className="block w-[5px] rounded-sm bg-gradient-to-t from-amber-400 via-rose-400 to-violet-400"
            style={{
              height: `${Math.min(100, h)}%`,
              animation: "eq-bounce 1.2s ease-in-out infinite",
              animationDelay: `${(i * 0.05) % 1.4}s`,
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
}
