import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Heart,
  ShieldCheck,
  Speaker,
  Clock,
  Award,
  Disc3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Equalizer } from "@/components/common/Equalizer";
import { useDocumentHead } from "@/hooks/useDocumentHead";

/**
 * Standalone visual mock-up of a compact, booking-focused public DJ
 * profile. Built to match an attached reference design so the client can
 * evaluate the direction. This page is intentionally self-contained (no
 * data fetching) and does not replace the live {@link DJProfilePage}.
 */

const heroImages = [
  "/dj-photos/mockup-hero-disco.png",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1600",
];
const AVATAR_IMAGE = "/dj-photos/mockup-avatar-dj.png";

const galleryCategories = [
  {
    label: "Bryllup",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800",
  },
  {
    label: "Udstyr",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800",
  },
  {
    label: "Se alle",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
  },
];

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

  const [heroIndex, setHeroIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goToHero = (index: number) => {
    const count = heroImages.length;
    setHeroIndex(((index % count) + count) % count);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) goToHero(heroIndex - 1);
    else if (delta < -50) goToHero(heroIndex + 1);
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          {/* Left: hero + identity */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-full">
              <div
                className="group relative overflow-hidden rounded-2xl shadow-sm"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                >
                  {heroImages.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`DJ Flashback ${i + 1}`}
                      className="aspect-[16/10] w-full shrink-0 object-cover"
                      draggable={false}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goToHero(heroIndex - 1)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
                  aria-label="Forrige billede"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToHero(heroIndex + 1)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
                  aria-label="Næste billede"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                  {heroImages.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => goToHero(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === heroIndex
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/60 hover:bg-white/80"
                      }`}
                      aria-label={`Gå til billede ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <img
                  src={AVATAR_IMAGE}
                  alt="DJ Flashback"
                  className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-md"
                />
              </div>
            </div>

            <div className="mt-14 grid w-full grid-cols-3 gap-3">
              {galleryCategories.map((category) => (
                <button
                  key={category.label}
                  type="button"
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm"
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-2 text-center text-sm font-semibold text-white">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
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

            <div className="relative mt-5 w-full overflow-hidden rounded-xl border bg-[hsl(222_47%_10%)] px-3 py-2 text-white">
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
              <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Equalizer bars={4} className="h-3 text-amber-300" />
                  <span>LIVE på DJConnect</span>
                </span>
                <Separator orientation="vertical" className="hidden h-3 bg-white/30 sm:block" />
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-300" /> 100+ events
                </span>
                <Separator orientation="vertical" className="hidden h-3 bg-white/30 sm:block" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Svarer &lt; 2 timer
                </span>
                <Separator orientation="vertical" className="hidden h-3 bg-white/30 sm:block" />
                <span className="inline-flex items-center gap-1">
                  <Disc3 className="h-3.5 w-3.5 animate-spin-slow" style={{ animationDuration: "8s" }} />
                  10+ års erfaring
                </span>
              </div>
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

            <section>
              <h2 className="text-xl font-bold text-foreground">
                Min tilgang til jeres fest
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Jeg starter altid med en snak om jeres aften — stemning,
                gæster og de sange, der betyder noget for jer. Ud fra det
                bygger jeg et forløb, der passer til programmet: rolig
                velkomst, energi under middagen og et dansegulv, der er fyldt
                fra første til sidste nummer.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Jeg læser rummet løbende og justerer musikken efter, hvordan
                gæsterne reagerer — så I kan slappe af og nyde festen, mens
                jeg holder gang i den.
              </p>
            </section>

            <hr className="my-8 border-border" />

            <section>
              <h2 className="text-xl font-bold text-foreground">
                Om DJ Flashback
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Med over 10 års erfaring bag pulten har jeg spillet til alt
                fra intime bryllupper til store firmafester. Jeg medbringer et
                komplet, mobilt anlæg med professionelt lyd- og lysudstyr og
                sørger for en diskret opsætning, så I ikke skal tænke på det
                tekniske.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Jeg er baseret i København og kører gerne i hele landet.
                Fleksibel, verificeret og altid klar med en plan B — så jeres
                fest er i trygge hænder hele vejen.
              </p>
            </section>

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
