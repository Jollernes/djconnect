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
    prompt: "What is DJConnect's platform fee?",
    options: [
      { id: "a", label: "5% of the booking value" },
      { id: "b", label: "10% of the booking value" },
      { id: "c", label: "20% of the booking value" },
      { id: "d", label: "A flat DKK 100 per booking" },
    ],
    correct: "b",
    explain: "DJConnect takes a flat 10% service fee from each booking. You keep the other 90%.",
  },
  {
    id: "payout",
    prompt: "When do payouts release to your Stripe account?",
    options: [
      { id: "a", label: "Immediately when the customer pays" },
      { id: "b", label: "When the DJ accepts the booking" },
      { id: "c", label: "24 hours after the event date" },
      { id: "d", label: "At the end of each month" },
    ],
    correct: "c",
    explain: "Funds sit in escrow until 24h after the event date, then Stripe releases your 90%. Bank deposit usually lands 2–5 business days after that.",
  },
  {
    id: "cancel",
    prompt: "A customer cancels 10 days before the event. What happens?",
    options: [
      { id: "a", label: "Full refund to the customer" },
      { id: "b", label: "50% refund to the customer" },
      { id: "c", label: "No refund — you keep everything" },
      { id: "d", label: "You decide on a case-by-case basis" },
    ],
    correct: "b",
    explain: "The cancellation policy is: 14+ days = 100% refund, 7–14 days = 50% refund, <7 days = no refund. It's non-negotiable and applied automatically.",
  },
  {
    id: "messages",
    prompt: "Where should all customer communication happen?",
    options: [
      { id: "a", label: "WhatsApp, for convenience" },
      { id: "b", label: "Direct email so you have it in your inbox" },
      { id: "c", label: "In-platform messaging on DJConnect" },
      { id: "d", label: "Phone calls only" },
    ],
    correct: "c",
    explain: "Always use DJConnect messaging. It creates a paper trail, protects both parties, and is required for dispute resolution.",
  },
  {
    id: "equipment",
    prompt: "You arrive at an event and realise you're missing a cable. What's the rule?",
    options: [
      { id: "a", label: "Ask the customer if they have one" },
      { id: "b", label: "Cancel the booking on the spot" },
      { id: "c", label: "Always bring your own complete, tested mobile disco setup" },
      { id: "d", label: "Borrow gear from the venue" },
    ],
    correct: "c",
    explain: "DJConnect's promise is a verified, full mobile disco setup. Always bring your own complete kit plus spares. Venue equipment is a bonus, never a dependency.",
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
            <h3 className="mt-4 text-2xl font-semibold">You nailed it — {score}/{QUESTIONS.length}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You're ready to start accepting bookings. Review any chapter from the sidebar if you'd like.
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
              Finish the guide <Sparkles className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
              <X className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-2xl font-semibold">Almost there — {score}/{QUESTIONS.length}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You need all {QUESTIONS.length} correct to finish the guide. Review the explanations and try again — it's quick.
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
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {index + 1} of {QUESTIONS.length}</span>
        <span>{score} correct so far</span>
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
              {correct ? "Correct!" : "Not quite — here's why"}
            </div>
            <p className="mt-1 text-muted-foreground">{q.explain}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex justify-end">
        <Button variant={didReveal ? "accent" : "outline"} disabled={!didReveal} onClick={next}>
          {index === QUESTIONS.length - 1 ? "See results" : "Next question"}
        </Button>
      </div>
    </div>
  );
}
