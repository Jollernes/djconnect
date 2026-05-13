import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Phone,
  Sparkles,
  HandshakeIcon,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { cn } from "@/lib/utils";

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
    id: "corporate",
    label: "Firmaevent",
    blurb: "Julefrokoster, sommerfester, jubilæer og konferencer.",
    available: false,
    Icon: CorporateIcon,
    accent: "text-sky-700 bg-sky-100",
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
    id: "other",
    label: "Andet",
    blurb: "Privatfest, konfirmation, byfest eller noget helt fjerde.",
    available: false,
    Icon: OtherIcon,
    accent: "text-emerald-700 bg-emerald-100",
  },
];

const STEPS: Array<{
  title: string;
  body: string;
  Icon: React.FC<{ className?: string }>;
}> = [
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-background">
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700">
            <Phone className="h-4 w-4" />
            En rådgiver ringer dig op — typisk inden for 2 timer
          </div>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Lad os finde den rette løsning til jeres fest
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til
            dit event? Fortæl os lidt mere om festen, så ringer vi dig op og
            hjælper med at finde den rette løsning.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Helt gratis
            <span className="text-muted-foreground/40">·</span>
            Ingen forpligtelser
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

/* Animated event icons */

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
  const cells = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({ row, col, delay: (row + col) * 0.15 })),
  );
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
