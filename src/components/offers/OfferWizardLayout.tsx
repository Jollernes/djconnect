import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "@/components/common/BrandMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shell for the Get 3 Offers wizard:
 *  - Top bar: brand + close, step counter ("Step 3 of 8") + progress bar
 *  - Animated step body (slide-in from the right)
 *  - Sticky bottom bar with Back / Continue
 */
export function OfferWizardLayout({
  step,
  totalSteps,
  title,
  subtitle,
  illustration,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  hideBack = false,
  hideNext = false,
  showProgress = true,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
  hideNext?: boolean;
  showProgress?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((step / totalSteps) * 100)));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-rose-50/30 via-background to-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BrandMark size="sm" />
            <span className="hidden text-base tracking-tight sm:inline">DJConnect</span>
          </Link>
          {showProgress && (
            <div className="flex flex-1 items-center justify-center gap-3">
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                Step {step} of {totalSteps}
              </span>
              <div className="relative h-1.5 w-full max-w-md overflow-hidden rounded-full bg-rose-100/60">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{pct}%</span>
            </div>
          )}
          <Button asChild variant="ghost" size="icon" aria-label="Close wizard">
            <Link to="/">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="container py-8 md:py-12"
          >
            <div className="mx-auto max-w-3xl">
              {illustration ? (
                <div className="mb-6 flex justify-center md:mb-8">{illustration}</div>
              ) : null}
              <div className="text-center">
                <h1 className="text-balance text-2xl font-semibold leading-tight md:text-3xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mx-auto mt-2 max-w-xl text-balance text-sm text-muted-foreground md:text-base">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <div className="mt-8 md:mt-10">{children}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom bar */}
      {(!hideBack || !hideNext) && (
        <footer className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between gap-3">
            <div>
              {!hideBack && onBack && (
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!hideNext && onNext && (
                <Button
                  onClick={onNext}
                  disabled={nextDisabled}
                  className={cn(
                    "min-w-[140px] bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:from-rose-600 hover:to-rose-700",
                  )}
                >
                  {nextLabel} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
