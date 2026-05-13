import { useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Phone,
  Sparkles,
  HandshakeIcon,
  ChevronRight,
  Search,
  Star,
  ShieldCheck,
  BadgeCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { cn } from "@/lib/utils";

/* ====================================================================== */
/* Shared content                                                          */
/* ====================================================================== */

type EventType = {
  id: "wedding" | "birthday" | "corporate" | "other";
  label: string;
  blurb: string;
  available: boolean;
  Icon: React.FC<{ active: boolean }>;
  accent: string;
};

const EVENT_TYPES: EventType[] = [
  {
    id: "wedding",
    label: "Bryllup",
    blurb: "Ceremoni, middag, første dans og dansefest.",
    available: true,
    Icon: WeddingIcon,
    accent: "text-rose-700 bg-rose-100",
  },
  {
    id: "birthday",
    label: "Fødselsdag",
    blurb: "Runde fødselsdage, jubilæer og andre milepæle.",
    available: false,
    Icon: BirthdayIcon,
    accent: "text-amber-700 bg-amber-100",
  },
  {
    id: "corporate",
    label: "Firmaevent",
    blurb: "Julefrokoster, sommerfester, jubilæer og konferencer.",
    available: false,
    Icon: CorporateIcon,
    accent: "text-sky-700 bg-sky-100",
  },
  {
    id: "other",
    label: "Andet",
    blurb: "Privatfest, konfirmation, byfest eller noget helt fjerde.",
    available: false,
    Icon: OtherIcon,
    accent: "text-emerald-700 bg-emerald-100",
  },
];

const LEDE_HEADLINE = "Lad os finde den rette løsning til jeres bryllup.";
const LEDE_BODY =
  "Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til dit event? Fortæl os lidt mere om festen, så ringer vi dig op og hjælper med at finde den rette løsning.";

const STEPS: Array<{
  title: string;
  body: string;
  Icon: React.FC<{ className?: string }>;
  Illustration: React.FC<{ className?: string }>;
}> = [
  {
    title: "I fortæller om eventet",
    body: "Kort formular om dato, gæster og ønsker. Cirka 2 minutter.",
    Icon: ClipboardList,
    Illustration: IllustrationFormFill,
  },
  {
    title: "Vi ringer dig op",
    body: "En rådgiver med erfaring ringer typisk inden for et par timer.",
    Icon: Phone,
    Illustration: IllustrationPhoneCall,
  },
  {
    title: "Vi finder løsningen",
    body: "Baseret på samtalen anbefaler vi den rette DJ til jeres event.",
    Icon: Sparkles,
    Illustration: IllustrationRecommendation,
  },
  {
    title: "I booker, hvis det passer",
    body: "Alt gennem platformen med kontrakt og betalingsgaranti.",
    Icon: HandshakeIcon,
    Illustration: IllustrationBooking,
  },
];

/* ====================================================================== */
/* Top-level: switch between three variants                                */
/* ====================================================================== */

export function PersonalAdvicePage() {
  useDocumentHead({
    title: "Personlig rådgivning · DJConnect",
    description:
      "Få personlig rådgivning til dit event. Vi ringer dig op og hjælper med at finde den rette DJ-løsning.",
    canonical: "/personal-advice",
  });

  const [searchParams] = useSearchParams();
  const variant = (searchParams.get("v") ?? "1") as "1" | "2" | "3";

  return (
    <>
      {variant === "2" ? (
        <VariantEditorial />
      ) : variant === "3" ? (
        <VariantQuiz />
      ) : (
        <VariantHero />
      )}
      <VariantSwitcher current={variant} />
    </>
  );
}

function VariantSwitcher({ current }: { current: "1" | "2" | "3" }) {
  const options: Array<{ key: "1" | "2" | "3"; label: string }> = [
    { key: "1", label: "1 · Hero" },
    { key: "2", label: "2 · Editorial" },
    { key: "3", label: "3 · Quiz" },
  ];
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-lg backdrop-blur">
        <span className="px-2 text-xs font-medium text-muted-foreground">Variant</span>
        {options.map((o) => (
          <Link
            key={o.key}
            to={`/personal-advice?v=${o.key}`}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              current === o.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* VARIANT 1 — Hero (mimics the Massage screenshot)                        */
/* ====================================================================== */

function VariantHero() {
  const navigate = useNavigate();
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Soft pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(244,114,182,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.25) 0%, transparent 45%)",
          }}
        />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Personlig rådgivning til jeres bryllup
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-white/80 md:text-lg">
              Vi ringer dig op og hjælper med at finde den rette DJ-løsning.
            </p>

            {/* Trustpilot-style badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-1.5 py-0.5 font-semibold text-white">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-white" />
                ))}
              </span>
              <span className="text-white/90">
                <strong className="font-semibold">4,9</strong> · 1.230+ tilfredse kunder
              </span>
            </div>

            {/* Pill "search-bar" CTA */}
            <div className="mx-auto mt-8 max-w-xl">
              <button
                type="button"
                onClick={() => navigate("/personal-advice/wedding")}
                className="group flex w-full items-center gap-3 rounded-full border border-white/20 bg-white/95 p-1.5 pl-5 text-left shadow-2xl transition hover:bg-white"
              >
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-sm text-slate-700 md:text-base">
                  Fortæl os om jeres bryllup — vi hjælper dig videre
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition group-hover:bg-emerald-600">
                  Start <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <p className="mt-3 text-xs text-white/60">
                Cirka 2 minutter · Ingen forpligtelser · Ingen betaling før alt er aftalt
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip (white card overlapping hero) */}
      <section className="container -mt-10 md:-mt-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-1 overflow-hidden rounded-2xl border bg-card shadow-xl sm:grid-cols-3">
          <TrustItem Icon={BadgeCheck} label="Kvalitetsgaranti" />
          <TrustItem Icon={ShieldCheck} label="Forsikret" />
          <TrustItem Icon={Users} label="Professionelle DJs" />
        </div>
      </section>

      {/* Event type selector */}
      <section className="container py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Hvilken slags event handler det om?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Vælg en kategori for at komme i gang. Andre eventtyper er på vej.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EVENT_TYPES.map((et) => (
              <EventTile key={et.id} type={et} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — illustrated */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mx-auto inline-block h-1 w-12 rounded-full bg-rose-500" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Sådan fungerer personlig rådgivning
            </h2>
            <p className="mt-3 text-balance text-sm text-muted-foreground md:text-base">
              Professionel hjælp til at vælge den rette DJ — fra brief til
              booket dato. Ingen forpligtelser undervejs.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className="grid h-36 w-36 place-items-center rounded-full bg-sky-50 ring-1 ring-sky-100">
                  <s.Illustration className="h-24 w-24" />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-100">
                    {i + 1}
                  </span>
                  Step {i + 1}
                </div>
                <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = "/personal-advice/wedding")}
              className="gap-1.5 bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
            >
              Start med bryllup
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({
  Icon,
  label,
}: {
  Icon: React.FC<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-5 text-center">
      <Icon className="h-6 w-6 text-emerald-600" />
      <span className="text-sm font-semibold text-foreground md:text-base">
        {label}
      </span>
    </div>
  );
}

function EventTile({ type }: { type: EventType }) {
  const navigate = useNavigate();
  const Icon = type.Icon;
  const disabled = !type.available;
  return (
    <motion.button
      type="button"
      onClick={() => {
        if (!disabled && type.id === "wedding") navigate("/personal-advice/wedding");
      }}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-2xl border bg-card/40 p-5 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-border/40 opacity-70"
          : "border-border/60 hover:border-foreground/40 hover:bg-card/60 hover:shadow-md",
      )}
      aria-disabled={disabled}
    >
      {disabled && (
        <span className="absolute right-3 top-3 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Kommer snart
        </span>
      )}
      <div className={cn("grid h-16 w-16 place-items-center rounded-full", type.accent)}>
        <Icon active={!disabled} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold">{type.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{type.blurb}</p>
      </div>
      {!disabled && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
          Start
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </motion.button>
  );
}

/* ====================================================================== */
/* VARIANT 2 — Editorial / quiet long-form                                  */
/* ====================================================================== */

function VariantEditorial() {
  const navigate = useNavigate();
  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700">
            Personlig Rådgivning
          </div>
          <h1 className="mt-4 text-balance font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            {LEDE_HEADLINE}
          </h1>
          <p className="mt-5 text-balance text-lg leading-relaxed text-muted-foreground">
            {LEDE_BODY}
          </p>

          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vælg eventtype
            </p>
            <ul className="mt-3 divide-y divide-border/60 border-y border-border/60">
              {EVENT_TYPES.map((et) => (
                <EventRow
                  key={et.id}
                  type={et}
                  onSelect={() => {
                    if (et.available && et.id === "wedding")
                      navigate("/personal-advice/wedding");
                  }}
                />
              ))}
            </ul>
          </div>

          <div className="mt-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sådan foregår det
            </h2>

            <ol className="mt-6 space-y-6">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative flex gap-5 pb-2"
                >
                  <div className="flex flex-col items-center">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {i + 1}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="-mt-0.5 pb-6">
                    <p className="flex items-center gap-2 text-base font-semibold">
                      <s.Icon className="h-4 w-4 text-rose-700" />
                      {s.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="mt-14 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Kom i gang
            </p>
            <p className="mt-1 text-base font-semibold">
              Vi tager den hårde del — du tager beslutningerne.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/personal-advice/wedding")}
              className="mt-4 gap-1.5"
            >
              Start brylluprådgivning
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Cirka 2 minutter · Ingen forpligtelser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({
  type,
  onSelect,
}: {
  type: EventType;
  onSelect: () => void;
}) {
  const Icon = type.Icon;
  const disabled = !type.available;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-4 py-4 text-left transition-colors",
          disabled
            ? "cursor-not-allowed opacity-70"
            : "hover:bg-muted/30",
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("grid h-12 w-12 place-items-center rounded-full", type.accent)}>
            <Icon active={!disabled} />
          </div>
          <div>
            <p className="text-base font-semibold">{type.label}</p>
            <p className="text-xs text-muted-foreground">{type.blurb}</p>
          </div>
        </div>
        {disabled ? (
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Kommer snart
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700">
            Start <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </li>
  );
}

/* ====================================================================== */
/* VARIANT 3 — Quiz-style                                                   */
/* ====================================================================== */

function VariantQuiz() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-background">
      {/* Question hero */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700">
            <Phone className="h-4 w-4" />
            En rådgiver ringer dig op — typisk inden for 2 timer
          </div>
          <h1 className="mt-6 text-balance font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Vi ringer dig op og finder den rette DJ til jeres fest
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til
            dit event? Fortæl os lidt mere om festen, så ringer vi dig op og
            hjælper med at finde den rette løsning.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:gap-5">
          {EVENT_TYPES.map((et, i) => (
            <QuizTile
              key={et.id}
              type={et}
              delay={i * 0.05}
              onSelect={() => {
                if (et.available && et.id === "wedding")
                  navigate("/personal-advice/wedding");
              }}
            />
          ))}
        </div>
      </section>

      {/* How it works — horizontal pipeline */}
      <section className="container pb-20 md:pb-28">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-card/40 p-6 md:p-10">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              Sådan foregår det
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fra brief til booket DJ — fire enkle skridt.
            </p>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="relative rounded-2xl border bg-background p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {i + 1}
                  </span>
                  <s.Icon className="h-4 w-4 text-rose-700" />
                </div>
                <p className="mt-3 text-base font-semibold leading-snug">
                  {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {/* chevron connector */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground md:flex"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function QuizTile({
  type,
  delay,
  onSelect,
}: {
  type: EventType;
  delay: number;
  onSelect: () => void;
}) {
  const Icon = type.Icon;
  const disabled = !type.available;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-4 rounded-3xl border bg-card/70 p-8 text-center shadow-sm transition-colors md:p-10",
        disabled
          ? "cursor-not-allowed opacity-65"
          : "hover:border-foreground/40 hover:shadow-xl",
      )}
    >
      {disabled && (
        <span className="absolute right-3 top-3 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Kommer snart
        </span>
      )}
      <div className={cn("grid h-20 w-20 place-items-center rounded-full", type.accent)}>
        <Icon active={!disabled} />
      </div>
      <div>
        <p className="text-lg font-bold md:text-xl">{type.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
          {type.blurb}
        </p>
      </div>
      {!disabled && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-transform group-hover:translate-y-0.5">
          Vælg <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </motion.button>
  );
}

/* ====================================================================== */
/* Animated event icons (inline SVGs)                                       */
/* ====================================================================== */

function WeddingIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      animate={active ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <motion.circle
        cx="13"
        cy="21"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        animate={active ? { rotate: [0, 4, 0, -4, 0] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "13px 21px" }}
      />
      <motion.circle
        cx="23"
        cy="21"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        animate={active ? { rotate: [0, -4, 0, 4, 0] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "23px 21px" }}
      />
      <motion.path
        d="M18 4 L18 9 M16 6.5 L20 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.7 }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
    </motion.svg>
  );
}

function BirthdayIcon({ active }: { active: boolean }) {
  return (
    <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="6" y="18" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="23" x2="30" y2="23" stroke="currentColor" strokeWidth="1.5" />
      <line x1="18" y1="12" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.path
        d="M18 6 Q20 9 18 12 Q16 9 18 6 Z"
        fill="currentColor"
        animate={active ? { scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] } : undefined}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "18px 9px" }}
      />
    </motion.svg>
  );
}

function CorporateIcon({ active }: { active: boolean }) {
  const cells = useMemo(() => {
    return [0, 1, 2].flatMap((row) =>
      [0, 1, 2].map((col) => ({ row, col, delay: (row + col) * 0.15 })),
    );
  }, []);
  return (
    <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="7" y="10" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      {cells.map(({ row, col, delay }) => (
        <motion.rect
          key={`${row}-${col}`}
          x={11 + col * 5}
          y={14 + row * 5}
          width="3"
          height="3"
          fill="currentColor"
          animate={active ? { opacity: [0.3, (row + col) % 2 === 0 ? 1 : 0.5, 0.3] } : { opacity: 0.6 }}
          transition={{ duration: 2.4, repeat: Infinity, delay }}
        />
      ))}
      <motion.path
        d="M18 10 L18 4 L24 5.5 L18 7"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.8 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
}

function OtherIcon({ active }: { active: boolean }) {
  return (
    <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <motion.circle
        cx="18"
        cy="18"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        animate={active ? { rotate: [0, 360] } : undefined}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "18px 18px" }}
      />
      <line x1="8" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="18" y1="8" x2="18" y2="28" stroke="currentColor" strokeWidth="1.2" />
      <line x1="11" y1="11" x2="25" y2="25" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="11" x2="11" y2="25" stroke="currentColor" strokeWidth="1" />
      <line x1="18" y1="5" x2="18" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </motion.svg>
  );
}

/* ====================================================================== */
/* Cartoon-style illustrations for Variant 1                                */
/* ====================================================================== */

function IllustrationFormFill({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Person */}
      <circle cx="42" cy="38" r="14" fill="#fbcfe8" />
      <path d="M40 30 Q42 25 50 26 Q56 28 56 36 Q56 42 50 44 Q44 44 40 42 Z" fill="#1f2937" />
      <rect x="30" y="52" width="32" height="34" rx="6" fill="#3b82f6" />
      {/* Clipboard */}
      <rect x="62" y="50" width="38" height="50" rx="4" fill="#fff" stroke="#1f2937" strokeWidth="2" />
      <rect x="74" y="44" width="14" height="10" rx="2" fill="#1f2937" />
      <line x1="68" y1="62" x2="94" y2="62" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="68" y1="72" x2="94" y2="72" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="68" y1="82" x2="88" y2="82" stroke="#cbd5e1" strokeWidth="2" />
      {/* Pen */}
      <line x1="100" y1="88" x2="110" y2="98" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M108 96 L114 102 L116 100 L110 94 Z" fill="#f59e0b" />
    </svg>
  );
}

function IllustrationPhoneCall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Advisor */}
      <circle cx="42" cy="40" r="16" fill="#fed7aa" />
      <path d="M40 28 Q42 22 52 22 Q60 24 60 34 Q60 42 52 46 Q44 46 40 42 Z" fill="#1f2937" />
      <rect x="28" y="56" width="32" height="34" rx="6" fill="#10b981" />
      {/* Headset */}
      <path d="M28 38 Q28 24 42 24 Q56 24 56 38" stroke="#1f2937" strokeWidth="3" fill="none" />
      <rect x="26" y="36" width="6" height="10" rx="2" fill="#1f2937" />
      <rect x="54" y="36" width="6" height="10" rx="2" fill="#1f2937" />
      {/* Phone & customer */}
      <rect x="76" y="48" width="22" height="36" rx="4" fill="#fff" stroke="#1f2937" strokeWidth="2" />
      <rect x="80" y="54" width="14" height="22" rx="1" fill="#dbeafe" />
      <circle cx="87" cy="80" r="2" fill="#1f2937" />
      {/* Sound waves */}
      <path d="M64 56 Q70 56 70 62" stroke="#10b981" strokeWidth="2" fill="none" />
      <path d="M62 50 Q72 50 72 62" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M60 44 Q74 44 74 62" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.4" />
    </svg>
  );
}

function IllustrationRecommendation({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* DJ booth */}
      <rect x="20" y="60" width="80" height="40" rx="4" fill="#1f2937" />
      <rect x="30" y="68" width="60" height="22" rx="2" fill="#374151" />
      <circle cx="44" cy="79" r="6" fill="#f43f5e" />
      <circle cx="76" cy="79" r="6" fill="#f43f5e" />
      <line x1="44" y1="73" x2="44" y2="79" stroke="#fff" strokeWidth="1.5" />
      <line x1="76" y1="73" x2="76" y2="79" stroke="#fff" strokeWidth="1.5" />
      {/* DJ */}
      <circle cx="60" cy="40" r="14" fill="#fef3c7" />
      <path d="M58 30 Q60 24 68 25 Q74 27 74 35 Q74 42 68 44 Q62 44 58 42 Z" fill="#1f2937" />
      <rect x="48" y="54" width="24" height="14" rx="4" fill="#8b5cf6" />
      {/* Headphones */}
      <path d="M48 36 Q48 26 60 26 Q72 26 72 36" stroke="#1f2937" strokeWidth="3" fill="none" />
      <rect x="46" y="34" width="5" height="9" rx="2" fill="#f43f5e" />
      <rect x="69" y="34" width="5" height="9" rx="2" fill="#f43f5e" />
      {/* Sparkles */}
      <path d="M14 22 L18 22 M16 20 L16 24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <path d="M104 32 L108 32 M106 30 L106 34" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="98" cy="14" r="2" fill="#f59e0b" />
    </svg>
  );
}

function IllustrationBooking({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Document with check */}
      <rect x="22" y="22" width="60" height="76" rx="4" fill="#fff" stroke="#1f2937" strokeWidth="2" />
      <line x1="30" y1="40" x2="74" y2="40" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="30" y1="50" x2="68" y2="50" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="30" y1="60" x2="74" y2="60" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="30" y1="70" x2="60" y2="70" stroke="#cbd5e1" strokeWidth="2" />
      {/* Stamp / check circle */}
      <circle cx="86" cy="80" r="20" fill="#10b981" />
      <path d="M76 80 L84 88 L98 72" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Handshake hint */}
      <rect x="30" y="80" width="20" height="14" rx="2" fill="#f59e0b" opacity="0.7" />
    </svg>
  );
}
