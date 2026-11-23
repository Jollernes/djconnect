import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Question = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correct: string;
  explain: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "fee",
    prompt: "Hvad er DJConnects platformsgebyr?",
    options: [
      { id: "a", label: "5% af bookingværdien" },
      { id: "b", label: "10% af bookingværdien" },
      { id: "c", label: "20% af bookingværdien" },
      { id: "d", label: "Et fast beløb på 100 kr. pr. booking" },
    ],
    correct: "b",
    explain: "DJConnect tager et fast servicegebyr på 10% af hver booking. Du beholder de resterende 90%.",
  },
  {
    id: "payout",
    prompt: "Hvornår frigives udbetalinger til din Stripe-konto?",
    options: [
      { id: "a", label: "Med det samme når kunden betaler" },
      { id: "b", label: "Når DJ'en accepterer bookingen" },
      { id: "c", label: "24 timer efter eventdatoen" },
      { id: "d", label: "Ved udgangen af hver måned" },
    ],
    correct: "c",
    explain: "Pengene ligger i escrow indtil 24 timer efter eventdatoen, hvorefter Stripe frigiver dine 90%. Bankindbetalingen lander normalt 2–5 bankdage efter det.",
  },
  {
    id: "cancel",
    prompt: "En kunde afbestiller 10 dage før eventet. Hvad sker der?",
    options: [
      { id: "a", label: "Fuld refundering til kunden" },
      { id: "b", label: "50% refundering til kunden" },
      { id: "c", label: "Ingen refundering — du beholder det hele" },
      { id: "d", label: "Du afgør det fra sag til sag" },
    ],
    correct: "b",
    explain: "Afbestillingspolitikken er: 14+ dage = 100% refundering, 7–14 dage = 50% refundering, <7 dage = ingen refundering. Den er ikke til forhandling og anvendes automatisk.",
  },
  {
    id: "messages",
    prompt: "Hvor skal al kundekommunikation foregå?",
    options: [
      { id: "a", label: "WhatsApp, for nemheds skyld" },
      { id: "b", label: "Direkte e-mail så du har det i din indbakke" },
      { id: "c", label: "Beskeder på DJConnect-platformen" },
      { id: "d", label: "Kun telefonopkald" },
    ],
    correct: "c",
    explain: "Brug altid DJConnects beskeder. Det skaber dokumentation, beskytter begge parter og er nødvendigt for tvistløsning.",
  },
  {
    id: "equipment",
    prompt: "Du ankommer til et event og opdager, at du mangler et kabel. Hvad er reglen?",
    options: [
      { id: "a", label: "Spørg kunden, om de har et" },
      { id: "b", label: "Afbestil bookingen på stedet" },
      { id: "c", label: "Medbring altid dit eget komplette, testede mobildiskotek" },
      { id: "d", label: "Lån udstyr af lokationen" },
    ],
    correct: "c",
    explain: "DJConnects løfte er et verificeret, komplet mobildiskotek. Medbring altid dit eget komplette grej plus reservedele. Lokationens udstyr er en bonus, aldrig en afhængighed.",
  },
];

type Props = {
  onPassed: () => void;
};

export function QuizStep({ onPassed }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[index]!;
  const selected = answers[q.id];
  const didReveal = revealed[q.id];
  const correct = selected === q.correct;

  function choose(id: string) {
    if (didReveal) return;
    setAnswers((a) => ({ ...a, [q.id]: id }));
    setRevealed((r) => ({ ...r, [q.id]: true }));
  }

  function next() {
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      const allCorrect = QUESTIONS.every((qq) => answers[qq.id] === qq.correct);
      if (allCorrect) {
        setFinished(true);
        onPassed();
      }
    }
  }

  function retry() {
    setAnswers({});
    setRevealed({});
    setIndex(0);
    setFinished(false);
  }

  const score = Object.entries(answers).filter(([id, value]) => QUESTIONS.find((q) => q.id === id)?.correct === value).length;
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;
  const passed = allAnswered && score === QUESTIONS.length;

  if (allAnswered && !finished) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        {passed ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-2xl font-semibold">Du klarede det — {score}/{QUESTIONS.length}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Du er klar til at begynde at acceptere bookinger. Gennemgå gerne et kapitel fra sidemenuen, hvis du vil.
            </p>
            <Button
              className="mt-5"
              variant="accent"
              size="lg"
              onClick={() => {
                setFinished(true);
                onPassed();
              }}
            >
              Afslut guiden <Sparkles className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
              <X className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-2xl font-semibold">Du er næsten der — {score}/{QUESTIONS.length}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Du skal have alle {QUESTIONS.length} rigtige for at gennemføre guiden. Gennemgå forklaringerne og prøv igen — det går hurtigt.
            </p>
            <div className="mt-4 space-y-2 text-left text-sm">
              {QUESTIONS.map((qq) => {
                const ans = answers[qq.id];
                const ok = ans === qq.correct;
                return (
                  <div key={qq.id} className={cn("rounded-lg border p-3", ok ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50")}>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {ok ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <X className="h-3.5 w-3.5 text-red-700" />}
                      <span className={ok ? "text-emerald-700" : "text-red-700"}>{qq.prompt}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{qq.explain}</p>
                  </div>
                );
              })}
            </div>
            <Button className="mt-5" variant="accent" size="lg" onClick={retry}>
              <RotateCcw className="h-4 w-4" /> Prøv igen
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Spørgsmål {index + 1} af {QUESTIONS.length}</span>
        <span>{score} rigtige indtil videre</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((index + (didReveal ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <h3 className="mt-5 text-xl font-semibold">{q.prompt}</h3>

      <div className="mt-4 space-y-2">
        {q.options.map((opt) => {
          const chosen = selected === opt.id;
          const isCorrect = opt.id === q.correct;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => choose(opt.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors",
                !didReveal && "border-border hover:border-accent/50",
                didReveal && chosen && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                didReveal && chosen && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                didReveal && !chosen && isCorrect && "border-emerald-400/60 bg-emerald-50/50",
                didReveal && !chosen && !isCorrect && "border-border opacity-60",
              )}
              disabled={didReveal}
            >
              <span className="font-medium">{opt.label}</span>
              {didReveal && chosen && isCorrect && <Check className="h-5 w-5 text-emerald-600" />}
              {didReveal && chosen && !isCorrect && <X className="h-5 w-5 text-red-600" />}
              {didReveal && !chosen && isCorrect && <Check className="h-4 w-4 text-emerald-500" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {didReveal && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn("mt-4 rounded-lg border p-3 text-sm", correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50")}
          >
            <div className={cn("text-xs font-semibold", correct ? "text-emerald-700" : "text-amber-700")}>
              {correct ? "Rigtigt!" : "Ikke helt — her er hvorfor"}
            </div>
            <p className="mt-1 text-muted-foreground">{q.explain}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex justify-end">
        <Button variant={didReveal ? "accent" : "outline"} disabled={!didReveal} onClick={next}>
          {index === QUESTIONS.length - 1 ? "Se resultater" : "Næste spørgsmål"}
        </Button>
      </div>
    </div>
  );
}
