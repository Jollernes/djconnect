import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Share2,
  Heart,
  ShieldCheck,
  Speaker,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";

/**
 * Standalone visual mock-up of a compact, booking-focused public DJ
 * profile. Built to match an attached reference design so the client can
 * evaluate the direction. This page is intentionally self-contained (no
 * data fetching) and does not replace the live {@link DJProfilePage}.
 */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600";
const AVATAR_IMAGE =
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800";

type Package = {
  title: string;
  description: string;
  priceLabel: string;
  duration: string;
  image: string;
};

const packages: Package[] = [
  {
    title: "Festpakke",
    description: "5 timers DJ, lyd og lys til de fleste fester.",
    priceLabel: "Fra 7.500 kr.",
    duration: "5 timer",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200",
  },
  {
    title: "Middag + fest",
    description: "Mikrofon, middagsstemning og dansegulv senere på aftenen.",
    priceLabel: "Fra 9.500 kr.",
    duration: "7 timer",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200",
  },
  {
    title: "Stor firmafest",
    description: "Større lyd/lys og mere energi til firmakunder og større venues.",
    priceLabel: "Fra 12.500 kr.",
    duration: "7+ timer",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200",
  },
];

type Review = {
  name: string;
  meta: string;
  time: string;
  body: string;
  avatar: string;
};

const reviews: Review[] = [
  {
    name: "Sofie M.",
    meta: "Bryllup · København",
    time: "2 uger siden",
    body: "Fantastisk fra start til slut! Fik dansegulvet fyldt hele natten.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
  },
  {
    name: "Anders L.",
    meta: "Firmafest · Frederiksberg",
    time: "1 måned siden",
    body: "Professionel, fleksibel og læser rummet helt perfekt.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
  },
  {
    name: "Camilla K.",
    meta: "Privatfest · Valby",
    time: "1 måned siden",
    body: "Bedste DJ til vores fødselsdag. Kan varmt anbefales!",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
  },
];

type Trust = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
};

const trustFeatures: Trust[] = [
  {
    icon: ShieldCheck,
    title: "Verificeret DJ",
    description: "DJ'er verificeret af DJConnect. ID og baggrund tjekket.",
  },
  {
    icon: Speaker,
    title: "Udstyr verificeret",
    description: "Professionelt lyd- og lysudstyr, tjekket af DJConnect.",
  },
  {
    icon: Clock,
    title: "Svarer hurtigt",
    description: "Svarer typisk inden for 2 timer.",
  },
  {
    icon: Heart,
    title: "Erfaring med",
    description: "Bryllup, firmafest og privatfest.",
  },
];

export function CompactBookingProfileMockup() {
  useDocumentHead({
    title: "DJ Flashback — mockup",
    description: "Kompakt booking-fokuseret DJ-profil mockup.",
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          {/* Left: hero + identity */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-full">
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={HERO_IMAGE}
                  alt="DJ Flashback live"
                  className="aspect-[5/4] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <img
                  src={AVATAR_IMAGE}
                  alt="DJ Flashback"
                  className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-md"
                />
              </div>
            </div>

            <h1 className="mt-14 text-3xl font-bold tracking-tight text-foreground">
              DJ Flashback
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Open-format DJ for weddings, corporate events and private parties.
              I build the night around your guests and the energy on the
              dancefloor.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              <span className="font-semibold">4.90</span>
              <span className="text-muted-foreground">· 87 anmeldelser</span>
              <span className="text-muted-foreground">· DJ i København</span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Leveres på din lokation
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Del profil"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Gem DJ"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: packages + reviews + trust */}
          <div>
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.title}
                  className="flex items-stretch gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="h-28 w-40 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex flex-col justify-center py-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {pkg.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                    <p className="mt-3 text-sm text-foreground">
                      <span className="font-semibold">{pkg.priceLabel}</span>
                      <span className="text-muted-foreground"> / event</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {pkg.duration}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Du kan sende en forespørgsel for at tilpasse eller ændre pakken.
            </p>

            <hr className="my-8 border-border" />

            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-foreground text-foreground" />
              <h2 className="text-xl font-bold text-foreground">
                4.90 · 87 anmeldelser
              </h2>
            </div>

            <div className="relative mt-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {review.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {review.meta}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-foreground text-foreground"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review.time}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted sm:flex"
                aria-label="Flere anmeldelser"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {trustFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {feature.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6">
        <div className="container">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 px-6 py-4 shadow-lg backdrop-blur">
            <div>
              <p className="text-lg text-foreground">
                <span className="font-bold">Fra 7.500 kr.</span>{" "}
                <span className="text-sm text-muted-foreground">/ event</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Gratis afbestilling inden for vilkår
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Button
                asChild
                size="lg"
                className="bg-accent px-8 text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/book/flashback-mobildiskotek">Tjek dato</Link>
              </Button>
              <span className="mt-1 text-xs text-muted-foreground">
                Du betaler ikke endnu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
