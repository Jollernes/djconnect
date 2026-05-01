import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export type Step = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  est: string;
};

type Props = {
  steps: Step[];
  current: number;
  completed: Set<number>;
  onJump: (index: number) => void;
};

export function Stepper({ steps, current, completed, onJump }: Props) {
  return (
    <ol className="space-y-1">
      {steps.map((step, index) => {
        const isDone = completed.has(index);
        const isCurrent = index === current;
        const isFuture = index > current && !isDone;
        const Icon = step.icon;

        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onJump(index)}
              disabled={isFuture && !isDone}
              className={cn(
                "group relative flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                isCurrent && "border-accent/60 bg-accent/10 shadow-sm",
                !isCurrent && isDone && "border-transparent bg-muted/40 hover:bg-muted",
                !isCurrent && !isDone && "border-transparent opacity-70 hover:opacity-100",
                isFuture && "cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isDone && "border-accent bg-accent text-accent-foreground",
                  isCurrent && !isDone && "border-accent text-accent",
                  !isCurrent && !isDone && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isDone ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <Icon className="h-4 w-4" />
                )}

                {isCurrent && (
                  <motion.span
                    layoutId="stepperPulse"
                    className="absolute -inset-1 rounded-full border-2 border-accent/50"
                    initial={false}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={cn("block text-sm font-medium", isCurrent && "text-foreground")}>
                    {step.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {step.est}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
