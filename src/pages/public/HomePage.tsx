import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, PartyPopper, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS } from "@/lib/djStandardSettings";
import { useDJs } from "@/hooks/useDJs";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { mockDJs } from "@/data/mock";
import { HomeDJCard, HomeDJCardSkeleton } from "@/components/home/HomeDJCard";
import { PackageGuide } from "@/components/home/PackageGuide";
import { TrustSection } from "@/components/home/TrustSection";
import { DJRecruitment } from "@/components/home/DJRecruitment";

const HERO_IMAGE = "/hero-dj-scene.jpg";

const SEARCH_EVENT_TYPES: { id: string; label: string; path: string }[] = [
  { id: "wedding", label: "Bryllup", path: "/wedding-djs" },
  { id: "corporate_party", label: "Firmafest", path: "/corporate-djs" },
  { id: "birthday", label: "Fødselsdag", path: "/birthday-djs" },
  { id: "private_party", label: "Voksenfest", path: "/other-djs" },
  { id: "other", label: "Anden fest", path: "/other-djs" },
];

const CATEGORIES: { label: string; description: string; path: string; image: string }[] = [
  {
    label: "Bryllupper",
    description: "Fra første dans til sidste sang",
    path: "/wedding-djs",
    image: "/dj-photos/mockup-hero-disco.png",
  },
  {
    label: "Firmafester",
    description: "Julefrokoster, sommerfester og jubilæer",
    path: "/corporate-djs",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=70",
  },
  {
    label: "Fødselsdage",
    description: "Runde dage og store fejringer",
    path: "/birthday-djs",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=70",
  },
  {
    label: "Voksenfester",
    description: "Private fester med fyldt dansegulv",
    path: "/other-djs",
    image: "/dj-photos/flashback/setup-3.png",
  },
];

export function HomePage() {
  useDocumentHead({
    title: "DJConnect – Find og book den perfekte DJ til din fest",
    description:
      "Find verificerede DJs med eget lyd- og lysanlæg i hele Danmark. Gennemsigtige priser og sikker booking til bryllupper, firmafester og fødselsdage.",
    canonical: "/",
  });

  const { djs, loading } = useDJs({ sortBy: "relevance" });
  // When no live DJ accounts can be loaded (backend unavailable or no
  // approved DJs yet), fall back to the seeded demo DJs so the
  // homepage never shows an empty marketplace.
  const listing = (!loading && djs.length === 0 ? mockDJs.filter((d) => d.verification_status === "approved") : djs)
    .slice(0, 6);

  return (
    <div className="bg-white">
      <Hero />
      <EventCategories />

      <section className="container py-16 sm:py-24">
        <SectionHeading
          title="Find DJs i hele Danmark"
          subtitle="Verificerede DJs med eget mobilt diskotek – lyd og lys er altid inkluderet."
          cta={{ to: "/search", label: "Se alle DJs" }}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <HomeDJCardSkeleton key={i} />)
            : listing.map((dj) => <HomeDJCard key={dj.id} dj={dj} />)}
        </div>
      </section>

      <PackageGuide />
      <TrustSection />
      <DJRecruitment />
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  cta,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  cta?: { to: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      }
    >
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">{subtitle}</p>}
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-accent"
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
      <div className="container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Kun DJs med eget lyd- og lysanlæg
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Find og book den perfekte DJ til din fest
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Sammenlign verificerede DJs i hele Danmark, se priser og anmeldelser, og book trygt – med lyd og lys
            inkluderet.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>
              <strong className="font-semibold text-slate-900">4,8 ud af 5</strong> fra over 250 anmeldelser
            </span>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-xl shadow-slate-900/10">
            <img
              src={HERO_IMAGE}
              alt="DJ spiller til bryllupsfest med gæster på dansegulvet"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
          <div className="absolute -bottom-5 left-4 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">Over 240 fester</div>
              <div className="text-slate-500">booket gennem DJConnect</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}

function HeroSearch() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (date) params.set("date", date);
    const match = SEARCH_EVENT_TYPES.find((t) => t.id === eventType);
    if (match) {
      params.set("eventType", match.id);
      navigate(`${match.path}?${params.toString()}`);
      return;
    }
    const qs = params.toString();
    navigate(`/search${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Søg efter DJ"
      className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 md:grid-cols-[1fr_1fr_1fr_auto] md:gap-0 md:rounded-full"
    >
      <SearchField label="Hvor" icon={MapPin}>
        <Select value={region || undefined} onValueChange={setRegion}>
          <SelectTrigger className="h-auto border-0 p-0 text-left text-sm font-medium text-slate-900 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Vælg region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <SearchField label="Hvornår" icon={CalendarDays} divider>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Dato for festen"
          className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
        />
      </SearchField>

      <SearchField label="Type fest" icon={PartyPopper} divider>
        <Select value={eventType || undefined} onValueChange={setEventType}>
          <SelectTrigger className="h-auto border-0 p-0 text-left text-sm font-medium text-slate-900 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Vælg type fest" />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_EVENT_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <Button
        type="submit"
        variant="accent"
        className="h-14 rounded-2xl px-8 text-base font-semibold shadow-md md:m-1 md:h-auto md:rounded-full"
      >
        <Search className="h-5 w-5" />
        Find DJ
      </Button>
    </form>
  );
}

function SearchField({
  label,
  icon: Icon,
  divider,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-slate-50 md:rounded-full md:px-6" +
        (divider ? " md:border-l md:border-slate-200" : "")
      }
    >
      <Icon className="h-5 w-5 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Event categories ---------- */

function EventCategories() {
  return (
    <section className="container pt-16 sm:pt-24">
      <SectionHeading title="Hvad skal du fejre?" subtitle="Find DJs med erfaring fra netop din type fest." />
      <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            to={c.path}
            className="group relative block w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-100 sm:w-auto"
          >
            <div className="aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5]">
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="text-xl font-semibold">{c.label}</h3>
              <p className="mt-1 text-sm text-white/80">{c.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                Se DJs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
