import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  CalendarCheck2,
  Sparkles,
  Shield,
  Users,
  Headphones,
  Speaker,
  Heart,
  Cake,
  Briefcase,
  PartyPopper,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MapPin,
  Star,
  BadgeCheck,
  Music,
} from "lucide-react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS } from "@/lib/djStandardSettings";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { GridCardV23SoftWedding } from "@/components/event-djs/grid/V23SoftWedding";
import { priceFromLabel } from "@/components/event-djs/grid/shared";
import { NEUTRAL_THEME } from "@/components/event-djs/grid/eventThemes";
import { useDJs } from "@/hooks/useDJs";
import type { DJProfileWithRelations } from "@/types/domain";

const marqueeItems = [
  "Bryllupper",
  "Fødselsdagsfester",
  "Firmaarrangementer",
  "Private fester",
  "Produktlanceringer",
  "Brandaktiveringer",
  "Sommerfester",
  "Klubaftener",
  "Festivaler",
  "Galaer",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Homepage listing card. A smaller, event-neutral take on the
 * `/wedding-djs` Soft Wedding card: the BryllupsDJ hallmark is
 * dropped, the warm wedding wash is removed (raw colour photo), and
 * the palette + CTA switch to the DJConnect brand accent instead of
 * rose-gold. `density` lets the same card ride both the wide
 * featured grid (`"4"`) and the tight 5-up hero grid (`"5"`). */
function HomeDJCard({
  dj,
  density,
}: {
  dj: DJProfileWithRelations;
  density: "4" | "5";
}) {
  return (
    <GridCardV23SoftWedding
      dj={dj}
      density={density}
      tint="none"
      heroGrayscale={0}
      avatarGrayscale={false}
      bioLines={2}
      fontStyle="sans"
      hideHallmark
      hideStarRating={false}
      showRegion
      showSeeProfileCta
      statStyle="inline"
      ctaProminence="filled"
      ctaLabel="Se profil"
      colourway="dj"
      eventTheme={NEUTRAL_THEME}
    />
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { djs } = useDJs({ sortBy: "relevance" });
  const featured = djs.filter((d) => d.is_featured).slice(0, 3);
  // Top-rated carousel below the hero: highest-rated DJs first.
  const topRatedDJs = [...djs]
    .sort((a, b) => b.rating_average - a.rating_average)
    .slice(0, 8);

  const [eventType, setEventType] = useState<string>("");
  const [region, setRegion] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    // Event-type subpages: route to dedicated landing page when one exists.
    const eventLandingPaths: Record<string, string> = {
      wedding: "/wedding-djs",
    };
    if (eventType && eventLandingPaths[eventType]) {
      const qs = params.toString();
      navigate(`${eventLandingPaths[eventType]}${qs ? `?${qs}` : ""}`);
      return;
    }
    if (eventType) params.set("eventType", eventType);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <>
      {/* Mobile-only: full-bleed video hero with headline + search */}
      <MobileHeroV2
        navigate={navigate}
        eventType={eventType}
        setEventType={setEventType}
        region={region}
        setRegion={setRegion}
        onSubmit={submit}
      />

      {/* Desktop-only: full-bleed image hero with headline + search */}
      <DesktopHeroV2
        navigate={navigate}
        eventType={eventType}
        setEventType={setEventType}
        region={region}
        setRegion={setRegion}
        onSubmit={submit}
      />

      {/* Popular event types — image chips under the search/trust area */}
      <PopularEventTypes navigate={navigate} />

      {/* Compact interactive "how it works" strip */}
      <HowItWorksMini navigate={navigate} />

      {/* Top-rated DJs carousel */}
      <TopRatedDJs djs={topRatedDJs} />

      <Marquee />

      {featured.length > 0 && (
        <section className="container py-20">
          <RevealHeader
            eyebrow="Fremhævet"
            title="Månedens bedst bedømte DJs"
            subtitle="Håndplukkede, verificerede og elsket af deres kunder."
            cta={{ href: "/search", label: "Se alle DJs →" }}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((dj, i) => (
              <motion.div
                key={dj.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
              >
                <HomeDJCard dj={dj} density="4" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <HowItWorks />

      <Stats />

      <Testimonials />

      <DJCta />
    </>
  );
}

/* ---------- Desktop-only image hero (headline + search) ---------- */

// Hero background video. To revert to the previous clip, set this back to
// "/hero-dj.mp4" (poster "/hero-dj-poster.jpg").
const HERO_VIDEO_SRC = "/hero-dj-alt.mp4";
const HERO_VIDEO_POSTER = "/hero-dj-poster.jpg";

const HERO_TRUST = ["Interviewede DJs", "Udstyr verificeret", "Lyd & lys", "Tryg booking"];

function RegionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-10">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Vælg region" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {REGIONS.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const HERO_FEATURES: { label: string; Icon: LucideIcon }[] = [
  { label: "Top-vurderede DJs", Icon: Star },
  { label: "Udstyr verificeret", Icon: Shield },
  { label: "240+ events", Icon: Users },
  { label: "Personlig hjælp", Icon: Headphones },
  { label: "Lyd & lys", Icon: Speaker },
];

function DesktopHeroV2({
  navigate,
  eventType,
  setEventType,
  region,
  setRegion,
  onSubmit,
}: {
  navigate: ReturnType<typeof useNavigate>;
  eventType: string;
  setEventType: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const [mode, setMode] = useState<"offers" | "browse">("offers");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "browse") {
      onSubmit(e);
      return;
    }
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (region) params.set("region", region);
    const qs = params.toString();
    navigate(`/get-offers${qs ? `?${qs}` : ""}`);
  }

  return (
    <section className="relative hidden overflow-hidden bg-background md:block">
      {/* Hero image + headline */}
      <div className="relative">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <video
            className="h-full w-full object-cover object-right"
            src={HERO_VIDEO_SRC}
            poster={HERO_VIDEO_POSTER}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-fuchsia-950/40 to-black/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-44 text-center text-white">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.1}
            className="text-5xl font-bold leading-[1.05] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] lg:text-7xl"
          >
            Den letteste måde
            <br />
            at booke en <span className="text-accent">DJ</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.25}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/85"
          >
            Vælg selv blandt top-vurderede DJs eller få 3 tilbud fra
            interviewede, udstyrs-verificerede DJs til bryllup, fødselsdag,
            privatfest eller firmaevent.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.4}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-white/80"
          >
            {HERO_TRUST.map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-accent" />}
                {t}
              </span>
            ))}
          </motion.div>

        </div>

        {/* Curved white bottom of the hero image */}
        <div
          aria-hidden
          className="absolute inset-x-0 -bottom-px z-[5] h-16 rounded-t-[100%] bg-background"
        />
      </div>

      {/* Search card — mode tabs sit inside the top of the card so the
          two buttons read as one unit with the search menu. */}
      <div className="relative z-20 -mt-24 mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.6}
          className="overflow-hidden rounded-3xl bg-white text-foreground shadow-2xl ring-1 ring-black/5"
        >
          {/* Mode tabs — full-width segmented row across the top of the card */}
          <div className="flex border-b border-border/60">
            {([
              { id: "offers", label: "Få 3 tilbud", Icon: CalendarCheck2 },
              { id: "browse", label: "Browse DJs", Icon: Users },
            ] as const).map(({ id, label, Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-accent" : "")} />
                  {label}
                  {active && (
                    <motion.span
                      layoutId="hero-mode-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-[1fr_1fr_auto] items-end gap-4 p-6"
          >
            <div className="min-w-0">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Hvilken fest holder du?
              </label>
              <EventTypePicker value={eventType} onChange={setEventType} />
            </div>
            <div className="min-w-0">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Region</label>
              <RegionPicker value={region} onChange={setRegion} />
            </div>
            <div className="flex flex-col items-center">
              <Button type="submit" variant="accent" size="lg" className="w-full glow-accent">
                {mode === "offers" ? (
                  <>Få 3 tilbud <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <><Search className="h-4 w-4" /> Browse DJs</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.7}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 pb-2"
        >
          {HERO_FEATURES.map(({ label, Icon }) => (
            <span
              key={label}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-white px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Mobile-only image/video hero (headline + search) ---------- */

function MobileHeroV2({
  navigate,
  eventType,
  setEventType,
  region,
  setRegion,
  onSubmit,
}: {
  navigate: ReturnType<typeof useNavigate>;
  eventType: string;
  setEventType: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const [mode, setMode] = useState<"offers" | "browse">("offers");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "browse") {
      onSubmit(e);
      return;
    }
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (region) params.set("region", region);
    const qs = params.toString();
    navigate(`/get-offers${qs ? `?${qs}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-background md:hidden">
      <div className="relative">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <video
            className="h-full w-full object-cover object-right"
            src={HERO_VIDEO_SRC}
            poster={HERO_VIDEO_POSTER}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-fuchsia-950/40 to-black/85" />
        </div>

        <div className="relative z-10 px-5 pt-16 pb-24 text-center text-white">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.1}
            className="text-[2.15rem] font-bold leading-[1.08] tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]"
          >
            Den letteste måde
            <br />
            at booke en <span className="text-accent">DJ</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.25}
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/85"
          >
            Vælg selv blandt top-vurderede DJs eller få 3 tilbud fra
            interviewede, udstyrs-verificerede DJs til bryllup, fødselsdag,
            privatfest eller firmaevent.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.4}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs font-medium text-white/80"
          >
            {HERO_TRUST.map((t, i) => (
              <span key={t} className="flex items-center gap-2.5">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-accent" />}
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Curved white bottom of the hero */}
        <div
          aria-hidden
          className="absolute inset-x-0 -bottom-px z-[5] h-10 rounded-t-[100%] bg-background"
        />
      </div>

      {/* Search card — tabs + stacked fields */}
      <div className="relative z-20 -mt-12 px-5">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.55}
          className="overflow-hidden rounded-3xl bg-white text-foreground shadow-2xl ring-1 ring-black/5"
        >
          {/* Mode tabs */}
          <div className="flex border-b border-border/60">
            {([
              { id: "offers", label: "Få 3 tilbud", Icon: CalendarCheck2 },
              { id: "browse", label: "Browse DJs", Icon: Users },
            ] as const).map(({ id, label, Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-accent" : "")} />
                  {label}
                  {active && (
                    <motion.span
                      layoutId="mobile-hero-mode-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Hvilken fest holder du?
                </label>
                <EventTypePicker value={eventType} onChange={setEventType} />
              </div>
              <div className="min-w-0">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Region</label>
                <RegionPicker value={region} onChange={setRegion} />
              </div>
            </div>
            <Button type="submit" variant="accent" size="lg" className="w-full glow-accent">
              {mode === "offers" ? (
                <>Få 3 tilbud <ArrowRight className="h-4 w-4" /></>
              ) : (
                <><Search className="h-4 w-4" /> Browse DJs</>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Feature pills — wrap into rows (no horizontal scroll) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.7}
          className="mt-4 flex flex-wrap justify-center gap-2"
        >
          {HERO_FEATURES.map(({ label, Icon }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm"
            >
              <Icon className="h-3.5 w-3.5 text-accent" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Popular event types (image chips) ---------- */

const POPULAR_EVENT_TYPES: { id: string; label: string; Icon: LucideIcon; image: string }[] = [
  {
    id: "wedding",
    label: "Bryllup",
    Icon: Heart,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "birthday",
    label: "Fødselsdag",
    Icon: Cake,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "corporate_party",
    label: "Firmafest",
    Icon: PartyPopper,
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "private_party",
    label: "Privatfest",
    Icon: Users,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "corporate_party",
    label: "Julefrokost",
    Icon: Sparkles,
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "other",
    label: "Anden fest",
    Icon: Music,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=500&q=60",
  },
];

function PopularEventTypes({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  function go(id: string) {
    if (id === "wedding") {
      navigate("/wedding-djs");
      return;
    }
    navigate(`/search?eventType=${id}`);
  }

  return (
    <section id="populaere-festtyper" className="scroll-mt-24 bg-background pt-10 md:pt-12">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <h2 className="mb-4 text-lg font-bold text-foreground md:text-xl">Populære festtyper</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
          {POPULAR_EVENT_TYPES.map((ev) => (
            <button
              key={ev.label}
              type="button"
              onClick={() => go(ev.id)}
              className="group flex flex-col text-left"
            >
              <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
                <img
                  src={ev.image}
                  alt={ev.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5">
                  <ev.Icon className="h-3.5 w-3.5 text-accent" />
                </span>
              </div>
              <span className="mt-2 text-sm font-semibold text-foreground group-hover:text-accent">
                {ev.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Compact interactive "how it works" strip ---------- */

const HOW_IT_WORKS_STEPS: {
  title: string;
  shortText: string;
  panelText: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Vælg fest og område",
    shortText: "Fortæl os, hvad du holder, og hvor festen er.",
    panelText:
      "Fortæl os, hvad du holder — bryllup, fødselsdag, firmafest eller andet — samt dato og område, så vi kan finde de rette DJs.",
    Icon: Sparkles,
  },
  {
    title: "Få tilbud eller browse DJs",
    shortText: "Få 3 relevante tilbud eller vælg selv blandt profiler.",
    panelText:
      "Vælg selv blandt top-vurderede DJs, eller få 3 tilbud fra DJs, der matcher festtype, dato og område.",
    Icon: Users,
  },
  {
    title: "Book trygt",
    shortText: "Verificerede DJs, udstyr og personlig hjælp.",
    panelText:
      "Book med ro i maven: verificerede DJs og udstyr, ægte anmeldelser og personlig hjælp hele vejen.",
    Icon: Shield,
  },
];

function HowItWorksMini({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [active, setActive] = useState(1);

  const stepCtas: {
    label: string;
    variant: "accent" | "outline";
    onClick: () => void;
  }[][] = [
    [],
    [
      { label: "Få 3 tilbud", variant: "accent", onClick: () => navigate("/get-offers") },
      { label: "Browse DJs", variant: "outline", onClick: () => navigate("/search") },
    ],
    [
      { label: "Læs om tryg booking", variant: "accent", onClick: () => navigate("/how-it-works") },
    ],
  ];

  const ActiveIcon = HOW_IT_WORKS_STEPS[active].Icon;
  const ctas = stepCtas[active];

  return (
    <section className="bg-background pt-8 md:pt-10">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <div className="rounded-3xl border border-accent/10 bg-[#FFF8F3] px-4 py-6 shadow-sm md:px-8 md:py-8">
        <div className="md:text-center">
          <h2 className="text-lg font-bold text-foreground md:text-xl">Sådan fungerer det</h2>
          <p className="mt-1 text-sm text-foreground/60">Tre enkle trin fra festidé til booking</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 md:gap-4">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const isActive = i === active;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-expanded={isActive}
                className={cn(
                  "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-sm transition md:p-4",
                  isActive
                    ? "border-accent/60 shadow-md"
                    : "border-border/70 hover:border-accent/40 hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-accent transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition md:h-9 md:w-9",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    <step.Icon className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                    Trin {i + 1}
                  </span>
                </span>
                <span className="text-[13px] font-bold leading-tight text-foreground md:text-[15px]">
                  {step.title}
                </span>
                <span className="hidden text-xs leading-snug text-foreground/60 sm:block">
                  {step.shortText}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex gap-4 overflow-hidden rounded-2xl border border-border/70 bg-white p-5 shadow-sm md:p-6"
          >
            <span className="hidden w-1 shrink-0 rounded-full bg-accent sm:block" />
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <ActiveIcon className="h-[18px] w-[18px]" />
                </span>
                <p className="text-base font-bold text-foreground">
                  Trin {active + 1}: {HOW_IT_WORKS_STEPS[active].title}
                </p>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/70">
                {HOW_IT_WORKS_STEPS[active].panelText}
              </p>
              {ctas.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ctas.map((c) => (
                    <Button
                      key={c.label}
                      type="button"
                      variant={c.variant}
                      size="sm"
                      onClick={c.onClick}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- Top-rated DJs carousel (compact horizontal cards) ---------- */

const DA_EVENT_LABELS: Record<string, string> = {
  wedding: "Bryllup",
  birthday: "Fødselsdag",
  corporate_event: "Firmaevent",
  corporate_party: "Firmafest",
  private_party: "Privatfest",
  other: "Fest",
};

function HomeDJCardV2({ dj }: { dj: DJProfileWithRelations }) {
  const photo = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url ?? "";
  const verified = dj.verification_status === "approved";
  const rating = dj.rating_average > 0 ? dj.rating_average.toFixed(1).replace(".", ",") : null;
  const tags = dj.event_types
    .slice(0, 2)
    .map((t) => `${DA_EVENT_LABELS[t.id] ?? t.label}-DJ`);

  return (
    <div className="relative flex h-full gap-3 rounded-2xl border border-border/70 bg-white p-3 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        aria-label="Gem DJ"
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full text-foreground/60 transition hover:bg-muted hover:text-foreground"
      >
        <Heart className="h-4 w-4" />
      </button>

      <Link to={`/djs/${dj.username}`} className="shrink-0">
        <div className="h-28 w-24 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-28">
          {photo ? (
            <img
              src={photo}
              alt={dj.stage_name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[11px] text-muted-foreground">
              Intet foto
            </div>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pr-7">
        <div className="flex items-center gap-1.5">
          <Link
            to={`/djs/${dj.username}`}
            className="truncate text-[15px] font-bold text-foreground hover:text-accent"
          >
            {dj.stage_name}
          </Link>
          {verified && <BadgeCheck className="h-4 w-4 shrink-0 text-amber-500" />}
        </div>

        {rating && (
          <div className="mt-0.5 flex items-center gap-1 text-[13px]">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(dj.rating_average)
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted",
                  )}
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">{rating}</span>
            <span className="text-muted-foreground">({dj.rating_count})</span>
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/70"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {priceFromLabel(dj)}
          </span>
          <Button asChild variant="outline" size="sm" className="h-8 shrink-0">
            <Link to={`/djs/${dj.username}`}>Se profil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TopRatedDJs({ djs }: { djs: DJProfileWithRelations[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (djs.length === 0) return null;

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
  }

  return (
    <section className="bg-background py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground md:text-xl">Top-vurderede DJs</h2>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Forrige"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-foreground/70 shadow-sm transition hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Næste"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-foreground/70 shadow-sm transition hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="scrollbar-elegant -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:px-0"
        >
          {djs.map((dj) => (
            <div
              key={dj.id}
              className="w-[86vw] max-w-[360px] flex-shrink-0 snap-start sm:w-[360px]"
            >
              <HomeDJCardV2 dj={dj} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type EventTypeOption = { id: string; label: string; Icon: LucideIcon; tint: string; description: string };

const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { id: "wedding", label: "Bryllup", Icon: Heart, tint: "from-rose-500/15 to-rose-500/5 text-rose-600", description: "Ceremoni & reception" },
  { id: "birthday", label: "Fødselsdag", Icon: Cake, tint: "from-amber-500/15 to-amber-500/5 text-amber-600", description: "Mærkedagsfester" },
  { id: "corporate_event", label: "Firma", Icon: Briefcase, tint: "from-sky-500/15 to-sky-500/5 text-sky-600", description: "Konferencer & lanceringer" },
  { id: "corporate_party", label: "Firmafest", Icon: PartyPopper, tint: "from-violet-500/15 to-violet-500/5 text-violet-600", description: "Sommer & jul" },
  { id: "private_party", label: "Privat", Icon: Users, tint: "from-emerald-500/15 to-emerald-500/5 text-emerald-600", description: "Jubilæer & mere" },
  { id: "other", label: "Andet", Icon: Sparkles, tint: "from-pink-500/15 to-pink-500/5 text-pink-600", description: "Alt muligt andet" },
];

export function EventTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = EVENT_TYPE_OPTIONS.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm transition",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          open ? "border-accent ring-2 ring-accent/30" : "border-input hover:border-foreground/30",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected ? (
            <>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br", selected.tint)}>
                <selected.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate font-medium">{selected.label}</span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">Alle begivenhedstyper</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Ryd begivenhedstype"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-30 mt-2 origin-top rounded-xl border bg-popover p-2 shadow-2xl ring-1 ring-black/5 sm:min-w-[22rem]"
            role="listbox"
          >
            <div className="mb-1.5 flex items-center justify-between px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Vælg din begivenhed</span>
              {selected && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-[10px] font-medium text-foreground hover:text-accent"
                >
                  Ryd
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {EVENT_TYPE_OPTIONS.map((option, i) => {
                const isSelected = option.id === value;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.16 }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "group relative flex flex-col items-center gap-1 rounded-lg border bg-background px-1.5 py-2 text-center transition",
                      isSelected
                        ? "border-accent ring-2 ring-accent/40 shadow-sm"
                        : "border-border hover:border-foreground/20 hover:shadow-sm",
                    )}
                  >
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br", option.tint)}>
                      <option.Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight">{option.label}</span>
                    {isSelected && (
                      <span className="absolute right-1 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Marquee() {
  const track = [...marqueeItems, ...marqueeItems];
  return (
    <div className="-mt-px overflow-hidden border-y bg-background py-5">
      <div className="flex w-max items-center gap-12 marquee-track whitespace-nowrap text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RevealHeader({
  eyebrow,
  title,
  subtitle,
  cta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
      >
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
      </motion.div>
      {cta && (
        <Button asChild variant="link" className="px-0 text-accent">
          <Link to={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Søg",
      body: "Filtrér efter begivenhedstype, by, dato, budget og opsætningsstørrelse. Se alle verificerede DJs, der passer.",
    },
    {
      icon: CalendarCheck2,
      title: "Book",
      body: "Betal sikkert via Stripe. Pengene står i depot indtil 24 timer efter begivenheden og frigives derefter til din DJ.",
    },
    {
      icon: Sparkles,
      title: "Fejr",
      body: "Din DJ ankommer med et komplet mobilt diskotek. Du får aftenen. Vi klarer resten.",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-muted/50 py-24">
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at top, hsla(21,90%,53%,0.12), transparent 60%)" }} />
      <div className="container relative">
        <RevealHeader eyebrow="Sådan fungerer det" title="Tre trin fra søgning til dansegulvet" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="relative h-full overflow-hidden border-white/50 bg-background/80 backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-accent">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-5xl font-semibold text-muted-foreground/20">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const display = useTransform(spring, (v) => `${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  return (
    <motion.span ref={ref}>{display}</motion.span>
  );
}

function Stats() {
  const items = [
    { label: "Verificerede DJs", to: 124, suffix: "+" },
    { label: "Bookede begivenheder", to: 3400, suffix: "+" },
    { label: "Gns. bedømmelse", to: 48, suffix: "/50" },
    { label: "Dækkede byer", to: 42, suffix: "" },
  ];
  return (
    <section className="container py-24">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="rounded-2xl border bg-card p-8"
          >
            <div className="text-4xl font-semibold tracking-tight">
              <CountUp to={stat.to} suffix={stat.suffix} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote:
        "Vi bookede Alex til vores bryllup — hele dansegulvet var fyldt hele aftenen. Opsætningen så utrolig professionel ud, og bookingen var problemfri.",
      author: "Sara",
      role: "Bryllup, København",
    },
    {
      quote:
        "At arrangere den årlige firmafest plejede at være et mareridt. DJConnect gjorde det til 5 minutters arbejde, og DJ'en var fantastisk.",
      author: "Tom",
      role: "CFO, Acme A/S",
    },
    {
      quote:
        "Som DJ er dette den første platform, der behandler os som professionelle. Rene bookinger, fair gebyrer, hurtige udbetalinger.",
      author: "Mia",
      role: "DJ, København",
    },
  ];
  return (
    <section className="bg-muted/40 py-24">
      <div className="container">
        <RevealHeader eyebrow="Hvad folk siger" title="Elsket af både værter &amp; DJs" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {quotes.map((t, i) => (
            <motion.figure
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border bg-background p-8 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" /></svg>
                ))}
              </div>
              <blockquote className="text-base leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <div className="font-medium">{t.author}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function DJCta() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div aria-hidden className="absolute inset-0 hero-gradient" style={{ opacity: 0.9 }} />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container relative py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-2xl flex-col items-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent ring-4 ring-accent/10">
            <Users className="h-7 w-7" />
          </span>
          <h2 className="mt-6 text-4xl font-semibold sm:text-5xl">Er du professionel DJ?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
Bliv en del af de verificerede DJs, der tjener en stabil indkomst på bookinger. Vi håndterer betalinger, kontrakter og markedsføring — du fokuserer på musikken.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8 glow-accent">
            <Link to="/signup/dj">Bliv DJ →</Link>
          </Button>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-primary-foreground/70">
            <span>10% platformsgebyr</span>
            <span>·</span>
            <span>Udbetaling 24 timer efter begivenhed</span>
            <span>·</span>
            <span>Ingen eksklusivitet</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
