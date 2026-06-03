import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar as CalendarIcon, Shield, CalendarCheck2, Sparkles } from "lucide-react";
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

const VARIANTS = [
  { id: "a", label: "A · Centreret spotlight" },
  { id: "b", label: "B · Split / video venstre" },
  { id: "c", label: "C · Søg-først solnedgang" },
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
    </div>
  );
}
