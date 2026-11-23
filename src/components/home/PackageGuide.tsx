import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  Home,
  Lightbulb,
  Sparkles,
  Tent,
  Users,
  UtensilsCrossed,
  Warehouse,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageId = "small" | "medium" | "large";

type Option = { id: string; label: string; hint?: string; Icon: LucideIcon; points: number };

type Question = { id: string; title: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "guests",
    title: "Hvor mange gæster?",
    options: [
      { id: "lt50", label: "Op til 50", Icon: Users, points: 0 },
      { id: "50-120", label: "50–120", Icon: Users, points: 2 },
      { id: "120-250", label: "120–250", Icon: Users, points: 4 },
      { id: "250+", label: "Over 250", Icon: Users, points: 6 },
    ],
  },
  {
    id: "venue",
    title: "Hvor skal festen holdes?",
    options: [
      { id: "home", label: "Privat hjem", hint: "Stue, have eller kælder", Icon: Home, points: 0 },
      { id: "restaurant", label: "Restaurant", hint: "Eller mindre selskabslokale", Icon: UtensilsCrossed, points: 1 },
      { id: "hall", label: "Festsal", hint: "Hotel, kro eller forsamlingshus", Icon: Building2, points: 2 },
      { id: "barn", label: "Telt eller lade", hint: "Store, åbne rum", Icon: Warehouse, points: 2 },
    ],
  },
  {
    id: "setting",
    title: "Inde eller ude?",
    options: [
      { id: "indoor", label: "Indendørs", Icon: Home, points: 0 },
      { id: "outdoor", label: "Udendørs", hint: "Eller i telt", Icon: Tent, points: 2 },
    ],
  },
  {
    id: "lights",
    title: "Hvilken stemning med lys?",
    options: [
      { id: "subtle", label: "Diskret stemningslys", hint: "Hyggeligt og afdæmpet", Icon: Lightbulb, points: 0 },
      { id: "party", label: "Festlys med farver", hint: "Lys der følger musikken", Icon: Sparkles, points: 1 },
      { id: "show", label: "Fuldt lysshow", hint: "Effekter, røg og moving heads", Icon: Zap, points: 3 },
    ],
  },
];

const PACKAGES: Record<
  PackageId,
  { name: string; guests: string; sound: number; light: number; reach: number; includes: string[]; explanation: string }
> = {
  small: {
    name: "Lille",
    guests: "Op til ca. 60 gæster",
    sound: 1,
    light: 1,
    reach: 1,
    includes: ["2 højttalere", "DJ-pult og mikrofon", "Diskret stemningslys"],
    explanation: "Perfekt til den mindre fest, hvor der skal være god lyd uden at fylde for meget.",
  },
  medium: {
    name: "Mellem",
    guests: "Ca. 60–150 gæster",
    sound: 2,
    light: 2,
    reach: 2,
    includes: ["2 kraftige højttalere + subwoofer", "Trådløs mikrofon til taler", "Farvet festlys til dansegulvet"],
    explanation: "Det mest populære valg – nok kraft til et fyldt dansegulv, også når bassen skal mærkes.",
  },
  large: {
    name: "Stor",
    guests: "150+ gæster",
    sound: 3,
    light: 3,
    reach: 3,
    includes: ["Kraftigt anlæg med flere subwoofere", "Moving heads, effekter og røgmaskine", "Egnet til telt og udendørs"],
    explanation: "Til de store fester, festsale og telte, hvor lyden skal nå ud til alle, og lyset skal skabe et show.",
  },
};

const PACKAGE_ORDER: PackageId[] = ["small", "medium", "large"];

function recommend(answers: Record<string, string>): PackageId {
  let score = 0;
  for (const q of QUESTIONS) {
    score += q.options.find((o) => o.id === answers[q.id])?.points ?? 0;
  }
  if (answers.guests === "250+" || score >= 8) return "large";
  if (score >= 3) return "medium";
  return "small";
}

export function PackageGuide() {
  const [answers, setAnswers] = useState<Record<string, string>>({
    guests: "50-120",
    venue: "hall",
    setting: "indoor",
    lights: "party",
  });
  const recommended = recommend(answers);
  const pkg = PACKAGES[recommended];

  return (
    <section id="pakkeguide" className="scroll-mt-20 border-y border-slate-100 bg-slate-50 py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Pakkeguide</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Hvilken DJ-pakke passer til din fest?
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Svar på fire hurtige spørgsmål, så anbefaler vi den rette lyd- og lyspakke. Ingen teknisk viden kræves.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {QUESTIONS.map((q, qi) => (
              <fieldset key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <legend className="sr-only">{q.title}</legend>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {qi + 1}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{q.title}</h3>
                </div>
                <div
                  className={cn(
                    "mt-4 grid gap-2",
                    q.options.length === 2 ? "grid-cols-2" : q.options.length === 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
                  )}
                >
                  {q.options.map((o) => {
                    const active = answers[q.id] === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                        className={cn(
                          "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all",
                          active
                            ? "border-slate-900 bg-slate-900 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-400",
                        )}
                      >
                        <o.Icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-500")} />
                        <span className="text-sm font-semibold">{o.label}</span>
                        {o.hint && (
                          <span className={cn("text-xs", active ? "text-white/70" : "text-slate-500")}>{o.hint}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <p className="text-sm font-medium text-slate-500">Vores anbefaling</p>
              <div className="mt-1 flex items-baseline gap-2">
                <h3 className="text-3xl font-semibold text-slate-900">{pkg.name} pakke</h3>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">{pkg.guests}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{pkg.explanation}</p>

              <ul className="mt-5 space-y-2">
                {pkg.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {i}
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {PACKAGE_ORDER.map((id) => {
                  const p = PACKAGES[id];
                  const active = id === recommended;
                  return (
                    <div
                      key={id}
                      className={cn(
                        "rounded-xl border p-3 transition-all",
                        active ? "border-slate-900 bg-slate-50" : "border-slate-200 opacity-60",
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                      <Meter label="Lyd" value={p.sound} active={active} />
                      <Meter label="Lys" value={p.light} active={active} />
                      <Meter label="Gæster" value={p.reach} active={active} />
                    </div>
                  );
                })}
              </div>

              <Link
                to={`/search?setupSize=${recommended}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
              >
                Find DJs med {pkg.name.toLowerCase()} pakke <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-500">
                Alle pakker inkluderer DJ, lydanlæg og lys – du skal ikke leje noget selv.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className="mt-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i <= value ? (active ? "bg-accent" : "bg-slate-400") : "bg-slate-200")}
          />
        ))}
      </div>
    </div>
  );
}
