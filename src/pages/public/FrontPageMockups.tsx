import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar as CalendarIcon, Shield, CalendarCheck2, Sparkles, Star, ArrowRight, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HeroDJCluster } from "@/components/common/HeroDJCluster";
import { EventTypePicker } from "@/pages/public/HomePage";
import { useDJs } from "@/hooks/useDJs";
import type { DJProfileWithRelations } from "@/types/domain";

const HEADLINE_LEAD = "Hver god aften";
const HEADLINE_HIGHLIGHT = "starter med en DJ.";
const SUBTITLE =
  "Book interviewede, udstyrsverificerede DJs til bryllupper, fødselsdage og firmaarrangementer. De medbringer lyd, lys og energi — du tager dig af gæsterne.";

type SearchState = {
  eventType: string;
  setEventType: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function SearchForm({ state, className }: { state: SearchState; className?: string }) {
  return (
    <form
      onSubmit={state.onSubmit}
      className={cn(
        "grid gap-3 rounded-2xl bg-background p-4 text-foreground shadow-2xl ring-1 ring-black/10 sm:grid-cols-[1fr_1fr_1fr_auto]",
        className,
      )}
    >
      <div className="min-w-0 text-left">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Begivenhedstype</label>
        <EventTypePicker value={state.eventType} onChange={state.setEventType} />
      </div>
      <div className="min-w-0 text-left">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Lokation</label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="By" value={state.city} onChange={(e) => state.setCity(e.target.value)} />
        </div>
      </div>
      <div className="min-w-0 text-left">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Dato</label>
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" type="date" value={state.date} onChange={(e) => state.setDate(e.target.value)} />
        </div>
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="accent" size="lg" className="w-full glow-accent">
          <Search className="h-4 w-4" /> Søg
        </Button>
      </div>
    </form>
  );
}

function TrustBadges({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const text = tone === "light" ? "text-white/85" : "text-foreground/75";
  const icon = tone === "light" ? "text-white" : "text-accent";
  return (
    <div className={cn("flex flex-wrap gap-x-7 gap-y-2 text-sm", text, className)}>
      <span className="flex items-center gap-2">
        <Shield className={cn("h-4 w-4", icon)} /> Alle DJs interviewet &amp; verificeret
      </span>
      <span className="flex items-center gap-2">
        <CalendarCheck2 className={cn("h-4 w-4", icon)} /> Tilgængelighed i realtid
      </span>
      <span className="flex items-center gap-2">
        <Sparkles className={cn("h-4 w-4", icon)} /> Sikre Stripe-deponeringsbetalinger
      </span>
    </div>
  );
}

function Eyebrow({ className }: { className?: string }) {
  return (
    <span className={cn("text-xs font-semibold uppercase tracking-[0.24em]", className)}>
      Verificerede DJs · Mobilt diskotek · Betalt via Stripe
    </span>
  );
}

/* --------------------------- Variant A: Centreret spotlight --------------------------- */

function VariantA({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#1b2150_0%,#0c1030_55%,#070a1c_100%)] py-20 text-white">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="container relative mx-auto max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Eyebrow className="text-cyan-300/80" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6 }}
          className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          {HEADLINE_LEAD}{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            {HEADLINE_HIGHLIGHT}
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mx-auto mt-5 max-w-xl text-lg text-white/75"
        >
          {SUBTITLE}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <HeroDJCluster djs={heroDJs} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.6 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <SearchForm state={state} className="ring-cyan-400/20" />
          <TrustBadges tone="light" className="mt-6 justify-center" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------- Variant B: Split, video til venstre --------------------------- */

function VariantB({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  return (
    <section className="relative overflow-hidden bg-[#0f0f11] py-20 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 flex justify-center lg:order-1"
          >
            <HeroDJCluster djs={heroDJs} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <Eyebrow className="text-amber-300/80" />
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
              {HEADLINE_LEAD}{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                {HEADLINE_HIGHLIGHT}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/70">{SUBTITLE}</p>
            <TrustBadges tone="light" className="mt-7" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12"
        >
          <SearchForm state={state} className="ring-amber-400/20" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------- Variant C: Søg-først solnedgang --------------------------- */

function VariantC({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#c026d3_0%,#f43f5e_45%,#fb923c_100%)] py-20 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/10" />
      <div className="container relative mx-auto max-w-4xl text-center">
        <Eyebrow className="text-white/85" />
        <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {HEADLINE_LEAD} {HEADLINE_HIGHLIGHT}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="mx-auto mt-9 max-w-2xl"
        >
          <SearchForm state={state} className="ring-white/30" />
          <p className="mx-auto mt-4 max-w-lg text-base text-white/85">{SUBTITLE}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.24, duration: 0.6 }}
          className="mt-14 flex justify-center"
        >
          <HeroDJCluster djs={heroDJs} />
        </motion.div>

        <TrustBadges tone="light" className="mt-10 justify-center" />
      </div>
    </section>
  );
}

/* --------------------------- Variant D: Lys split (hvid) --------------------------- */

function VariantD({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  return (
    <section className="relative overflow-hidden bg-white py-20 text-foreground">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Eyebrow className="text-accent" />
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl">
              {HEADLINE_LEAD}{" "}
              <span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">{HEADLINE_HIGHLIGHT}</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">{SUBTITLE}</p>
            <TrustBadges tone="dark" className="mt-7" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex justify-center"
          >
            <HeroDJCluster djs={heroDJs} />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-12">
          <SearchForm state={state} className="border border-slate-200 ring-slate-200/60" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------- Variant E: Blød off-white centreret --------------------------- */

function VariantE({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#fdf2f8_100%)] py-20 text-foreground">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="container relative mx-auto max-w-3xl text-center">
        <Eyebrow className="text-slate-500" />
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-5 max-w-2xl text-5xl font-semibold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl"
        >
          {HEADLINE_LEAD}{" "}
          <span className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
            {HEADLINE_HIGHLIGHT}
          </span>
        </motion.h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">{SUBTITLE}</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <HeroDJCluster djs={heroDJs} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="mx-auto mt-12 max-w-2xl">
          <SearchForm state={state} className="border border-slate-200/80 ring-pink-200/40" />
          <TrustBadges tone="dark" className="mt-6 justify-center" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------- Variant F: Lys split + flydende kort --------------------------- */

function fCompactPrice(dj: DJProfileWithRelations): string {
  if (dj.price_on_request || dj.price_from_minor == null) return "Forespørg";
  const kr = Math.round(dj.price_from_minor / 100);
  if (kr >= 1000) {
    const k = kr / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k kr.`;
  }
  return `${kr} kr.`;
}

function fHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function fResponseTime(id: string): string {
  return ["~30 min", "~1 t", "~2 t", "~3 t"][fHash(id) % 4];
}

function fAvailability(id: string): string {
  const d = new Date();
  d.setDate(d.getDate() + ((fHash(id) % 28) + 5));
  return new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long" }).format(d);
}

function FAvatar({ dj, className }: { dj: DJProfileWithRelations; className?: string }) {
  const src = dj.profile.avatar_url ?? dj.equipment_photos[0]?.url ?? undefined;
  return src ? (
    <img src={src} alt={dj.stage_name} loading="lazy" className={cn("rounded-full object-cover", className)} />
  ) : (
    <span className={cn("flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground", className)}>
      {dj.stage_name.charAt(0)}
    </span>
  );
}

function VariantF({ heroDJs, state }: { heroDJs: DJProfileWithRelations[]; state: SearchState }) {
  const navigate = useNavigate();
  const cardTop = heroDJs[1] ?? heroDJs[0];
  const cardBottom = heroDJs[2] ?? heroDJs[0];
  const avatars = heroDJs.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] py-16 text-foreground">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/5 blur-3xl" />
      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left column */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <div className="flex -space-x-2">
                {avatars.map((dj) => (
                  <FAvatar key={dj.id} dj={dj} className="h-6 w-6 ring-2 ring-white" />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600">Brugt af 240+ par &amp; firmaer i 2026</span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl">
              {HEADLINE_LEAD}
              <br />
              <span className="text-accent">{HEADLINE_HIGHLIGHT}</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-600">{SUBTITLE}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="accent" size="lg" className="glow-accent" onClick={() => navigate("/get-offers")}>
                Få 3 tilbud på 24 timer <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="bg-white" onClick={() => navigate("/wedding-djs")}>
                <BarChart3 className="h-4 w-4" /> Browse alle DJs
              </Button>
            </div>

            <TrustBadges tone="dark" className="mt-7" />
          </motion.div>

          {/* Right column: video + floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative mx-auto w-full max-w-[340px]"
          >
            <HeroDJCluster djs={heroDJs} />

            {/* Floating card — top left */}
            <div className="absolute -left-6 top-6 z-20 w-52 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:-left-12">
              <div className="flex items-center gap-2.5">
                <FAvatar dj={cardTop} className="h-9 w-9" />
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900">{cardTop.stage_name}</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    {cardTop.base_location}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {cardTop.rating_average.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-100 px-2 py-1.5">
                  <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-400">Fra</span>
                  <span className="block text-sm font-bold text-slate-900">{fCompactPrice(cardTop)}</span>
                </div>
                <div className="rounded-lg bg-slate-100 px-2 py-1.5">
                  <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-400">Svar</span>
                  <span className="block text-sm font-bold text-slate-900">{fResponseTime(cardTop.id)}</span>
                </div>
              </div>
            </div>

            {/* Floating card — bottom right */}
            <div className="absolute -right-4 bottom-8 z-20 w-56 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:-right-10">
              <div className="flex items-center gap-2.5">
                <FAvatar dj={cardBottom} className="h-9 w-9" />
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{cardBottom.stage_name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {cardBottom.base_location} · {cardBottom.events_performed} events
                  </span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-100 px-2.5 py-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Ledig {fAvailability(cardBottom.id)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-width search bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-12">
          <SearchForm state={state} className="border border-slate-200 ring-slate-200/60" />
        </motion.div>
      </div>
    </section>
  );
}

const VARIANTS = [
  { id: "a", label: "A · Centreret spotlight" },
  { id: "b", label: "B · Split / video venstre" },
  { id: "c", label: "C · Søg-først solnedgang" },
  { id: "d", label: "D · Lys split" },
  { id: "e", label: "E · Blød off-white" },
  { id: "f", label: "F · Lys split + flydende kort" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

export function FrontPageMockups() {
  const navigate = useNavigate();
  const { djs } = useDJs({ sortBy: "relevance" });
  const featured = djs.filter((d) => d.is_featured).slice(0, 3);
  const heroDJs = [...featured, ...djs.filter((d) => !d.is_featured)].slice(0, 4);

  const [variant, setVariant] = useState<VariantId>("a");
  const [eventType, setEventType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    const eventLandingPaths: Record<string, string> = { wedding: "/wedding-djs" };
    if (eventType && eventLandingPaths[eventType]) {
      const qs = params.toString();
      navigate(`${eventLandingPaths[eventType]}${qs ? `?${qs}` : ""}`);
      return;
    }
    if (eventType) params.set("eventType", eventType);
    navigate(`/search?${params.toString()}`);
  }

  const state: SearchState = { eventType, setEventType, city, setCity, date, setDate, onSubmit };

  return (
    <div>
      <div className="sticky top-0 z-40 border-b border-white/10 bg-background/95 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Forside-mockups</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">— samme videoer, tekst &amp; søgning, tre layouts</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  variant === v.id
                    ? "bg-accent text-accent-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {v.label}
              </button>
            ))}
            <Link
              to="/"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Nuværende forside
            </Link>
          </div>
        </div>
      </div>

      {variant === "a" && <VariantA heroDJs={heroDJs} state={state} />}
      {variant === "b" && <VariantB heroDJs={heroDJs} state={state} />}
      {variant === "c" && <VariantC heroDJs={heroDJs} state={state} />}
      {variant === "d" && <VariantD heroDJs={heroDJs} state={state} />}
      {variant === "e" && <VariantE heroDJs={heroDJs} state={state} />}
      {variant === "f" && <VariantF heroDJs={heroDJs} state={state} />}
    </div>
  );
}
