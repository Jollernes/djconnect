import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Phone,
  Sparkles,
  HandshakeIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";

/**
 * Personlig Rådgivning landing page.
 *
 * The customer first picks an event type before entering a flow. Only
 * Bryllup is currently functional; Fødselsdag / Firmaevent / Andet
 * surface a "kommer snart" notice. The page also explains the four-step
 * process so customers know what they're signing up for.
 *
 * Hosted in the public site layout so the active header tab stays
 * visible.
 */

type EventType = {
  id: "wedding" | "birthday" | "corporate" | "other";
  label: string;
  blurb: string;
  available: boolean;
  /** Animated illustration component. */
  Icon: React.FC<{ active: boolean }>;
  /** Accent class used for the icon halo. */
  haloClass: string;
};

const EVENT_TYPES: EventType[] = [
  {
    id: "wedding",
    label: "Bryllup",
    blurb: "Ceremoni, middag, første dans og dansefest.",
    available: true,
    Icon: WeddingIcon,
    haloClass: "bg-rose-100 text-rose-700",
  },
  {
    id: "birthday",
    label: "Fødselsdag",
    blurb: "Runde fødselsdage, jubilæer og andre milepæle.",
    available: false,
    Icon: BirthdayIcon,
    haloClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "corporate",
    label: "Firmaevent",
    blurb: "Julefrokoster, sommerfester, jubilæer og konferencer.",
    available: false,
    Icon: CorporateIcon,
    haloClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "other",
    label: "Andet",
    blurb: "Privatfest, konfirmation, byfest eller noget helt fjerde.",
    available: false,
    Icon: OtherIcon,
    haloClass: "bg-emerald-100 text-emerald-700",
  },
];

const STEPS: Array<{ title: string; body: string; Icon: React.FC<{ className?: string }> }> = [
  {
    title: "I fortæller om eventet",
    body: "Kort formular om dato, gæster og ønsker. Cirka 2 minutter.",
    Icon: ClipboardList,
  },
  {
    title: "Vi ringer dig op",
    body: "En rådgiver med erfaring ringer typisk inden for et par timer.",
    Icon: Phone,
  },
  {
    title: "Vi finder løsningen",
    body: "Baseret på samtalen anbefaler vi den rette DJ til jeres event.",
    Icon: Sparkles,
  },
  {
    title: "I booker, hvis det passer",
    body: "Alt gennem platformen med kontrakt og betalingsgaranti.",
    Icon: HandshakeIcon,
  },
];

export function PersonalAdvicePage() {
  useDocumentHead({
    title: "Personlig rådgivning · DJConnect",
    description:
      "Få personlig rådgivning til dit event. Vi ringer dig op og hjælper med at finde den rette DJ-løsning.",
    canonical: "/personal-advice",
  });

  const navigate = useNavigate();

  function handleSelect(eventType: EventType) {
    if (!eventType.available) return;
    if (eventType.id === "wedding") navigate("/personal-advice/wedding");
  }

  return (
    <div className="bg-gradient-to-b from-rose-50/30 via-background to-background">
      <div className="container py-10 md:py-14">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Lede */}
          <header className="space-y-4 text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <Sparkles className="h-3 w-3" />
              Personlig rådgivning
            </p>
            <h1 className="mx-auto max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Lad os finde den rette løsning til jeres bryllup.
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-muted-foreground">
              Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til
              dit event? Fortæl os lidt mere om festen, så ringer vi dig op og
              hjælper med at finde den rette løsning.
            </p>
          </header>

          {/* Event selector */}
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                Hvilken slags event handler det om?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vælg en kategori for at komme i gang.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {EVENT_TYPES.map((et) => (
                <EventCard
                  key={et.id}
                  type={et}
                  onSelect={() => handleSelect(et)}
                />
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                Sådan foregår det
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fire skridt fra brief til booket DJ. Ingen forpligtelser
                undervejs.
              </p>
            </div>

            <ol className="grid gap-4 md:grid-cols-2">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card/40 p-5"
                >
                  <div className="flex flex-col items-center">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {i + 1}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-base font-semibold">
                      <s.Icon className="h-4 w-4 text-rose-700" />
                      {s.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* Footer CTA */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Button
              size="lg"
              onClick={() => navigate("/personal-advice/wedding")}
              className="gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:from-rose-600 hover:to-rose-700"
            >
              Start med bryllup
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Cirka 2 minutter. Ingen forpligtelser. Ingen betaling før alt er aftalt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Event card with hover animation                                       */
/* -------------------------------------------------------------------- */

function EventCard({
  type,
  onSelect,
}: {
  type: EventType;
  onSelect: () => void;
}) {
  const Icon = type.Icon;
  const disabled = !type.available;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={
        "group relative flex flex-col items-center gap-3 rounded-2xl border bg-card/40 p-5 text-left transition-colors " +
        (disabled
          ? "cursor-not-allowed border-border/40 opacity-70"
          : "border-border/60 hover:border-foreground/40 hover:bg-card/60")
      }
      aria-disabled={disabled}
    >
      {disabled && (
        <span className="absolute right-3 top-3 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Kommer snart
        </span>
      )}
      <div
        className={
          "grid h-16 w-16 place-items-center rounded-full " + type.haloClass
        }
      >
        <Icon active={!disabled} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold">{type.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{type.blurb}</p>
      </div>
      {!disabled && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 opacity-0 transition-opacity group-hover:opacity-100">
          Start
          <ChevronRight className="h-3 w-3" />
        </span>
      )}
    </motion.button>
  );
}

/* -------------------------------------------------------------------- */
/* Animated event icons (inline SVGs with framer-motion)                 */
/* -------------------------------------------------------------------- */

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
      {/* Two interlocked rings */}
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
      {/* Tiny sparkle */}
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
    <motion.svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
    >
      {/* Cake */}
      <rect x="6" y="18" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="6" y1="23" x2="30" y2="23" stroke="currentColor" strokeWidth="1.5" />
      {/* Candle */}
      <line x1="18" y1="12" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Flame */}
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
  return (
    <motion.svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
    >
      {/* Building */}
      <rect x="7" y="10" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      {/* Windows */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <motion.rect
            key={`${row}-${col}`}
            x={11 + col * 5}
            y={14 + row * 5}
            width="3"
            height="3"
            fill="currentColor"
            animate={
              active
                ? {
                    opacity: [
                      0.3,
                      ((row + col) % 2 === 0 ? 1 : 0.5),
                      0.3,
                    ],
                  }
                : { opacity: 0.6 }
            }
            transition={{ duration: 2.4, repeat: Infinity, delay: (row + col) * 0.15 }}
          />
        )),
      )}
      {/* Flag */}
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
    <motion.svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
    >
      {/* Disco ball / sparkle cluster */}
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
      {/* Stand */}
      <line x1="18" y1="5" x2="18" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </motion.svg>
  );
}
