import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarCheck2,
  Sparkles,
  Shield,
  Users,
  Headphones,
  Disc3,
  Speaker,
  Zap,
  Heart,
  Cake,
  Briefcase,
  PartyPopper,
  ChevronDown,
  Check,
  X,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { DJCard } from "@/components/common/DJCard";
import { Equalizer } from "@/components/common/Equalizer";
import { HeroDJCluster } from "@/components/common/HeroDJCluster";
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

export function HomePage() {
  const navigate = useNavigate();
  const { djs } = useDJs({ sortBy: "relevance" });
  const featured = djs.filter((d) => d.is_featured).slice(0, 3);
  // Hero cluster: prefer featured DJs, then top up with the rest so we
  // always have up to 4 cards for social proof.
  const heroDJs = [...featured, ...djs.filter((d) => !d.is_featured)].slice(0, 4);

  const [eventType, setEventType] = useState<string>("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date) params.set("date", date);
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
      <Hero heroDJs={heroDJs} eventType={eventType} setEventType={setEventType} city={city} setCity={setCity} date={date} setDate={setDate} onSubmit={submit} />

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
                <DJCard dj={dj} />
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

type HeroProps = {
  heroDJs: DJProfileWithRelations[];
  eventType: string;
  setEventType: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function Hero({ heroDJs, eventType, setEventType, city, setCity, date, setDate, onSubmit }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden text-primary-foreground hero-gradient">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <div aria-hidden className="absolute inset-0 noise-overlay" />

      <FloatingIcons />

      <div className="container relative py-8 md:py-24">
        <div className="grid items-center gap-6 md:gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Video cluster — first on mobile (order-first), normal position on lg */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative -order-1 -mx-4 sm:-mx-6 md:mx-0 lg:order-none"
          >
            <div aria-hidden className="absolute -inset-4 rounded-3xl bg-accent/20 blur-2xl hidden md:block" />
            <HeroDJCluster djs={heroDJs} className="relative mx-auto md:max-w-[300px] max-w-[280px]" />
          </motion.div>

          {/* Text column — centered on mobile, left-aligned on desktop */}
          <div className="text-center md:text-left">
            {/* Eyebrow: badge-pill on mobile, inline on desktop */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground/80 backdrop-blur-sm md:rounded-none md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
              <Equalizer bars={4} className="h-3.5" barClassName="bg-accent" />
              Verificerede DJs · Mobilt diskotek · Betalt via Stripe
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.1}
              className="mt-5 text-3xl font-semibold text-balance leading-[1.08] tracking-tight sm:text-5xl md:mt-6 lg:text-[4.25rem]"
            >
              Hver god aften{" "}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-accent via-orange-300 to-pink-300 bg-clip-text text-transparent">starter med en DJ.</span>
                <motion.span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-1 w-full origin-left rounded-full bg-accent/70"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.25}
              className="mx-auto mt-4 max-w-sm text-base text-primary-foreground/80 sm:text-xl md:mx-0 md:mt-6 md:max-w-xl"
            >
              Book interviewede, udstyrsverificerede DJs til bryllupper, fødselsdage og firmaarrangementer.
              De medbringer lyd, lys og energi — du tager dig af gæsterne.
            </motion.p>
          </div>
        </div>

        {/* Mobile: compact search pill */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.4}
          className="mt-8 md:hidden"
        >
          <MobileSearchPill
            eventType={eventType}
            setEventType={setEventType}
            city={city}
            setCity={setCity}
            date={date}
            setDate={setDate}
            onSubmit={onSubmit}
          />
        </motion.div>

        {/* Desktop: inline 4-col form */}
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.4}
          onSubmit={onSubmit}
          className="mt-10 hidden gap-3 rounded-2xl border border-white/10 bg-background p-4 text-foreground shadow-2xl ring-1 ring-accent/10 md:grid md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Begivenhedstype</label>
            <EventTypePicker value={eventType} onChange={setEventType} />
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Lokation</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="By"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Dato</label>
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="accent" size="lg" className="w-full glow-accent">
              <Search className="h-4 w-4" /> Søg
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.55}
          className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-primary-foreground/80 md:mt-8 md:justify-start"
        >
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Alle DJs interviewet &amp; verificeret</span>
          <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-accent" /> Tilgængelighed i realtid</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Sikre Stripe-deponeringsbetalinger</span>
        </motion.div>
      </div>

      <svg aria-hidden viewBox="0 0 1440 80" className="block w-full text-background" preserveAspectRatio="none">
        <path d="M0 32 C 240 80 480 0 720 32 C 960 64 1200 8 1440 40 L 1440 80 L 0 80 Z" fill="currentColor" />
      </svg>
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

type MobileSearchProps = {
  eventType: string;
  setEventType: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function MobileSearchPill({ eventType, setEventType, city, setCity, date, setDate, onSubmit }: MobileSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const selected = EVENT_TYPE_OPTIONS.find((o) => o.id === eventType);
  const hasFilters = Boolean(eventType || city || date);
  const summary: string[] = [];
  if (selected) summary.push(selected.label);
  if (city) summary.push(city);
  if (date) {
    const d = new Date(date + "T00:00:00");
    summary.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    onSubmit(e);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-full bg-white p-2 pl-5 text-left text-foreground shadow-2xl ring-1 ring-black/5 transition active:scale-[0.99]"
      >
        <Search className="h-4 w-4 shrink-0 text-foreground" />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">
            {hasFilters ? summary.join(" · ") : "Find din DJ"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {hasFilters ? "Tryk for at justere" : "Enhver begivenhed · hvor som helst · enhver dato"}
          </span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-md transition group-active:scale-95">
          <Search className="h-4 w-4" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Søg DJs"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl bg-background text-foreground shadow-2xl"
            >
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/25" aria-hidden />
              <div className="flex items-center justify-between px-5 pb-3 pt-2">
                <h2 className="text-base font-semibold">Find din DJ</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                  aria-label="Luk søgning"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-32 pt-2"
              >
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hvad er anledningen?
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {EVENT_TYPE_OPTIONS.map((option) => {
                      const isSelected = option.id === eventType;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setEventType(isSelected ? "" : option.id)}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-xl border bg-background px-3 py-2.5 text-left transition active:scale-[0.98]",
                            isSelected
                              ? "border-accent ring-2 ring-accent/40 shadow-sm"
                              : "border-border hover:border-foreground/20",
                          )}
                        >
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br", option.tint)}>
                            <option.Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-[13px] font-semibold leading-tight">{option.label}</span>
                          {isSelected && (
                            <span className="absolute right-2 top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded-full bg-accent text-accent-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hvor?
                  </h3>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 rounded-xl pl-10 text-base"
                      placeholder="By eller region"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoFocus={!eventType && !city && !date}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hvornår?
                  </h3>
                  <div className="relative">
                    <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 rounded-xl pl-10 text-base"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </form>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t bg-background px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
                <button
                  type="button"
                  onClick={() => {
                    setEventType("");
                    setCity("");
                    setDate("");
                  }}
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Ryd alt
                </button>
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                  className="h-12 flex-1 rounded-xl glow-accent"
                >
                  <Search className="h-4 w-4" /> Søg DJs
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FloatingIcons() {
  const items = [
    { Icon: Headphones, className: "left-[6%] top-[22%]", size: "h-12 w-12", delay: "0s", duration: "7s" },
    { Icon: Disc3, className: "right-[10%] top-[14%]", size: "h-16 w-16", delay: "1.2s", duration: "9s" },
    { Icon: Speaker, className: "right-[18%] bottom-[18%]", size: "h-14 w-14", delay: "0.6s", duration: "8s" },
    { Icon: Zap, className: "left-[14%] bottom-[20%]", size: "h-10 w-10", delay: "1.8s", duration: "6.5s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      {items.map(({ Icon, className, size, delay, duration }, i) => (
        <span
          key={i}
          className={`absolute ${className} text-accent/60`}
          style={{ animation: `float-slow ${duration} ease-in-out infinite`, animationDelay: delay }}
        >
          <Icon className={size} />
        </span>
      ))}
      <span
        aria-hidden
        className="absolute right-[3%] top-[58%] text-accent/20"
        style={{ animation: "spin-slow 40s linear infinite" }}
      >
        <Disc3 className="h-52 w-52" />
      </span>
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
