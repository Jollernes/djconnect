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
  Check,
  X,
  MapPin,
  Star,
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
  // Hero cluster: prefer featured DJs, then top up with the rest so we
  // always have up to 4 cards for social proof.
  const heroDJs = [...featured, ...djs.filter((d) => !d.is_featured)].slice(0, 4);
  // Desktop hero grid: 5 DJ cards shown between the search bar and headline.
  const heroGridDJs = [...featured, ...djs.filter((d) => !d.is_featured)].slice(0, 5);

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

      {/* Desktop-only: DJ grid below the hero */}
      <DesktopBelowHero gridDJs={heroGridDJs} />

      {/* Mobile-only: white-background content below video hero */}
      <MobileHeroContent heroDJs={heroDJs} featured={featured} />

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

        {/* Feature pills — horizontal scroll */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.7}
          className="-mx-5 mt-4 flex gap-2.5 overflow-x-auto px-5 pb-1 scrollbar-hide"
        >
          {HERO_FEATURES.map(({ label, Icon }) => (
            <span
              key={label}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border border-border/60 bg-white px-3.5 py-2 text-sm font-medium text-foreground/80 shadow-sm"
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

/* ---------- Desktop-only DJ grid below the hero ---------- */

function DesktopBelowHero({ gridDJs }: { gridDJs: DJProfileWithRelations[] }) {
  if (gridDJs.length < 5) return null;
  return (
    <div className="hidden bg-background pb-12 pt-14 md:block">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-5 gap-5">
          {gridDJs.map((dj, i) => (
            <motion.div
              key={dj.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              <HomeDJCard dj={dj} density="5" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile-only hero content (white background below video) ---------- */

function MobileHeroContent({
  heroDJs,
  featured,
}: {
  heroDJs: DJProfileWithRelations[];
  featured: DJProfileWithRelations[];
}) {
  const topDJs = featured.length > 0 ? featured : heroDJs.slice(0, 3);

  return (
    <div className="relative md:hidden">
      {/* Top-vurderede DJs — white bg */}
      {topDJs.length > 0 && (
        <div className="bg-background px-5 pt-6 pb-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.4}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-foreground">Top-vurderede DJs</h2>
              <Link
                to="/search"
                className="text-xs font-semibold text-accent hover:underline"
              >
                Se alle →
              </Link>
            </div>
            <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide">
              {topDJs.map((dj) => {
                const heroImage = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url;
                const reviews = dj.reviews ?? [];
                const avgRating = reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
                  : null;
                const eventLabel = dj.event_types[0]?.label
                  ? `${dj.event_types[0].label.toUpperCase()}-DJ`
                  : "DJ";
                return (
                  <Link
                    key={dj.id}
                    to={`/djs/${dj.username}`}
                    className="group relative w-[70vw] max-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={dj.stage_name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Intet foto
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className="rounded-md bg-gray-900/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {eventLabel}
                        </span>
                      </div>
                      {avgRating && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-gray-900/70 px-2 py-0.5">
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span className="text-[11px] font-semibold text-white">{avgRating}</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-semibold text-white">{dj.stage_name}</p>
                        <p className="text-xs text-white/70">{dj.profile.city ?? "Danmark"}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
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
