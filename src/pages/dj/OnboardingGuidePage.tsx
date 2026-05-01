import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  BookOpen,
  Sparkles,
  Workflow,
  Banknote,
  ShieldAlert,
  MessageSquareText,
  Star,
  BadgeCheck,
  GraduationCap,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Headphones,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChapterShell } from "@/components/dj-guide/ChapterShell";
import { BookingFlowDemo } from "@/components/dj-guide/BookingFlowDemo";
import { PayoutCalculator } from "@/components/dj-guide/PayoutCalculator";
import { RefundSimulator } from "@/components/dj-guide/RefundSimulator";
import { QuizStep } from "@/components/dj-guide/QuizStep";
import { markDJGuideCompleted } from "@/lib/djGuide";

const CHAPTERS = [
  {
    id: "welcome",
    title: "Welcome aboard",
    icon: Sparkles,
    description: "What DJConnect is, and what we expect from you",
    minutes: 1,
  },
  {
    id: "profile",
    title: "Your profile is your storefront",
    icon: BookOpen,
    description: "How customers discover and choose you",
    minutes: 2,
  },
  {
    id: "bookings",
    title: "The booking lifecycle",
    icon: Workflow,
    description: "From request to payout — walk the flow yourself",
    minutes: 3,
  },
  {
    id: "payouts",
    title: "Getting paid",
    icon: Banknote,
    description: "Stripe escrow, the 10% fee, and timing",
    minutes: 2,
  },
  {
    id: "cancellations",
    title: "Cancellations & disputes",
    icon: ShieldAlert,
    description: "Play with the refund slider to see the rules",
    minutes: 2,
  },
  {
    id: "communication",
    title: "Messages, reviews & ratings",
    icon: MessageSquareText,
    description: "The platform rules for customer communication",
    minutes: 2,
  },
  {
    id: "standards",
    title: "DJ standards & code of conduct",
    icon: BadgeCheck,
    description: "The bar we hold every verified DJ to",
    minutes: 2,
  },
  {
    id: "quiz",
    title: "Comprehension check",
    icon: GraduationCap,
    description: "Quick 5-question quiz. 100% required to finish.",
    minutes: 2,
  },
];

type ChapterState = {
  ackedChapters: string[];
  currentIndex: number;
  standardsAcks: Record<string, boolean>;
  quizPassed: boolean;
};

const STATE_KEY = "djconnect.djGuide.progress";

const EMPTY_STATE: ChapterState = {
  ackedChapters: [],
  currentIndex: 0,
  standardsAcks: {},
  quizPassed: false,
};

const STANDARDS = [
  {
    id: "equipment",
    title: "Complete, tested equipment at every event",
    body: "I bring my own full mobile disco setup — decks, mixer, speakers, cables, basic lighting. Venue gear is a bonus, never a dependency.",
  },
  {
    id: "punctuality",
    title: "Arrive at least 90 minutes before showtime",
    body: "I set up calmly, soundcheck with the venue, and am ready to play 30 minutes before guests arrive.",
  },
  {
    id: "professionalism",
    title: "Professional appearance & conduct",
    body: "I dress appropriately for the event, don't consume alcohol excessively during the booking, and treat guests and venue staff with respect.",
  },
  {
    id: "music",
    title: "Do-not-play list and customer requests",
    body: "I ask the customer for their do-not-play list and accommodate requests where reasonable, while keeping the floor alive.",
  },
  {
    id: "exclusive",
    title: "Platform-exclusive communication",
    body: "I keep all booking conversations inside DJConnect messaging and never encourage off-platform payments.",
  },
];

export function DJOnboardingGuidePage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ChapterState>(EMPTY_STATE);
  const [restored, setRestored] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChapterState;
        setState({ ...EMPTY_STATE, ...parsed });
        setRestored(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [state]);

  const currentChapter = CHAPTERS[state.currentIndex]!;
  const ackedSet = useMemo(() => new Set(state.ackedChapters), [state.ackedChapters]);

  function ackChapter(id: string, acked: boolean) {
    setState((s) => {
      const next = new Set(s.ackedChapters);
      if (acked) next.add(id); else next.delete(id);
      return { ...s, ackedChapters: Array.from(next) };
    });
  }

  function jumpTo(i: number) {
    if (i <= state.currentIndex || ackedSet.has(CHAPTERS[i - 1]?.id ?? "")) {
      setState((s) => ({ ...s, currentIndex: i }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goNext() {
    if (state.currentIndex < CHAPTERS.length - 1) {
      setState((s) => ({ ...s, currentIndex: s.currentIndex + 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (state.currentIndex > 0) {
      setState((s) => ({ ...s, currentIndex: s.currentIndex - 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function finish() {
    markDJGuideCompleted();
    setCelebrated(true);
    fireConfetti();
    setTimeout(() => navigate("/dj/dashboard"), 2800);
  }

  const completionPct = Math.round(
    ((state.ackedChapters.length + (state.quizPassed ? 1 : 0)) / CHAPTERS.length) * 100,
  );

  const standardsAllAcked = STANDARDS.every((s) => state.standardsAcks[s.id]);

  const canAdvance = (() => {
    const c = currentChapter;
    if (c.id === "standards") return standardsAllAcked && ackedSet.has(c.id);
    if (c.id === "quiz") return state.quizPassed;
    return ackedSet.has(c.id);
  })();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="border-b bg-background">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Mandatory training</span>
            <span className="text-muted-foreground hidden sm:inline">
              Complete the guide before accepting your first booking.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {restored && (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Check className="h-3 w-3 text-accent" /> Progress restored
              </span>
            )}
            <div className="flex w-48 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{completionPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ol className="space-y-1">
              {CHAPTERS.map((c, i) => {
                const done = c.id === "quiz" ? state.quizPassed : ackedSet.has(c.id);
                const isCurrent = i === state.currentIndex;
                const accessible = i <= state.currentIndex || ackedSet.has(CHAPTERS[i - 1]?.id ?? "");
                const Icon = c.icon;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={!accessible}
                      onClick={() => jumpTo(i)}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                        isCurrent && "border-accent/60 bg-accent/10 shadow-sm",
                        !isCurrent && done && "border-transparent bg-muted/40",
                        !isCurrent && !done && "border-transparent opacity-80 hover:opacity-100",
                        !accessible && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "relative mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                          done && "border-accent bg-accent text-accent-foreground",
                          isCurrent && !done && "border-accent text-accent",
                          !isCurrent && !done && "border-muted-foreground/30 text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        {isCurrent && (
                          <motion.span
                            layoutId="guidePulse"
                            className="absolute -inset-1 rounded-full border-2 border-accent/40"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">{c.title}</span>
                          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {c.minutes}m
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{c.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 rounded-xl border bg-background p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Lock className="h-3.5 w-3.5 text-accent" /> Gated access
              </div>
              <p className="mt-2">
                Your dashboard and booking inbox unlock the moment you finish this guide. Estimated time: ~15 minutes.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border bg-background shadow-sm">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={currentChapter.id}>
                  {currentChapter.id === "welcome" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={Sparkles}
                      eyebrow="Welcome"
                      title="Welcome to DJConnect"
                      subtitle="Before you accept your first booking, we want to make sure we're on the same page about how the platform works, how you get paid, and the standards our customers expect."
                      acked={ackedSet.has("welcome")}
                      onAck={(v) => ackChapter("welcome", v)}
                      illustration={<WelcomeIllustration />}
                    >
                      <ul className="grid gap-3 sm:grid-cols-3">
                        {[
                          { icon: Workflow, title: "Understand the flow", body: "From booking request to payout — you'll walk each step yourself." },
                          { icon: Banknote, title: "Predictable payouts", body: "Escrow, a flat 10% fee, released 24h after the event." },
                          { icon: BadgeCheck, title: "Clear standards", body: "One shared bar so every DJConnect DJ earns the verified badge." },
                        ].map((f) => (
                          <li key={f.title} className="rounded-xl border bg-card p-4">
                            <f.icon className="h-5 w-5 text-accent" />
                            <div className="mt-2 text-sm font-semibold">{f.title}</div>
                            <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-xl border bg-accent/5 p-4 text-sm">
                        <div className="font-semibold">You'll finish in about 15 minutes.</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Progress auto-saves. If you navigate away, pick up exactly where you left off.
                        </p>
                      </div>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "profile" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={BookOpen}
                      eyebrow="Your storefront"
                      title="Your profile sells for you"
                      subtitle="Most customers never talk to you until they've already decided. Your profile is the whole pitch."
                      acked={ackedSet.has("profile")}
                      onAck={(v) => ackChapter("profile", v)}
                      illustration={<ProfileCardIllustration />}
                    >
                      <ul className="space-y-3 text-sm">
                        <Bullet title="Photo quality matters more than you think">
                          The hero shot + equipment photos drive first impressions. Real photos beat stock every time.
                        </Bullet>
                        <Bullet title="Your bio sets the vibe">
                          Write in first person. Mention genres, signature moments, and what you're best at. Avoid copy-paste.
                        </Bullet>
                        <Bullet title="Specific event types rank you higher">
                          Customers filter by event type. Pick every one you genuinely cover — and nothing you don't.
                        </Bullet>
                        <Bullet title="Keep availability current">
                          Block unavailable dates promptly. Instant-book DJs with live availability get ~2× more requests.
                        </Bullet>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "bookings" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={Workflow}
                      eyebrow="Booking lifecycle"
                      title="Walk a booking end-to-end"
                      subtitle="Click through each stage below. This is exactly how bookings flow on DJConnect — there are no surprises."
                      acked={ackedSet.has("bookings")}
                      onAck={(v) => ackChapter("bookings", v)}
                      illustration={<BookingFlowDemo />}
                      ackLabel="I've clicked through every stage and understand the flow"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Respond fast.</b> You have 24 hours to accept or decline. Faster replies convert much better.</li>
                        <li><b className="text-foreground">Quote transparently.</b> If the booking is price-on-request, send a single, clear total.</li>
                        <li><b className="text-foreground">Use messaging for logistics.</b> Set up times, access, parking, and playlists in-platform.</li>
                        <li><b className="text-foreground">Mark events complete.</b> Helps the system release your payout on time.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "payouts" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={Banknote}
                      eyebrow="Payouts"
                      title="How you actually get paid"
                      subtitle="Try the slider — it's the same math we run behind the scenes on every booking."
                      acked={ackedSet.has("payouts")}
                      onAck={(v) => ackChapter("payouts", v)}
                      illustration={<PayoutCalculator />}
                      ackLabel="I've tried the calculator and understand the 10% fee and 24h release"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Escrow.</b> The customer's payment sits with Stripe, not you, until after the event.</li>
                        <li><b className="text-foreground">Fee.</b> 10% platform fee, deducted automatically — you never pay it out of pocket.</li>
                        <li><b className="text-foreground">Release.</b> 24 hours after the event date, 90% is released to your connected Stripe account.</li>
                        <li><b className="text-foreground">Bank deposit.</b> Your bank posts funds 2–5 business days later, per Stripe's schedule.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "cancellations" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={ShieldAlert}
                      eyebrow="Cancellations"
                      title="Refunds are automatic and rule-based"
                      subtitle="Drag the slider to see what happens at different points before an event. These rules are non-negotiable."
                      acked={ackedSet.has("cancellations")}
                      onAck={(v) => ackChapter("cancellations", v)}
                      illustration={<RefundSimulator />}
                      ackLabel="I've explored the refund bands and understand each threshold"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">If the customer cancels</b>, the automatic policy (14d/7d/0d) runs immediately.</li>
                        <li><b className="text-foreground">If you cancel</b>, the customer receives a full refund and your profile takes a reliability hit. Only do this in genuine emergencies.</li>
                        <li><b className="text-foreground">Disputes</b> go through support — we always have the paper trail thanks to in-platform messaging.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "communication" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={MessageSquareText}
                      eyebrow="Communication"
                      title="Messages, reviews & ratings"
                      subtitle="Every DJConnect interaction is on-record. It keeps everyone safe and helps you grow."
                      acked={ackedSet.has("communication")}
                      onAck={(v) => ackChapter("communication", v)}
                      illustration={<CommunicationIllustration />}
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Platform-only comms.</b> Never move conversations off-platform — it's a policy violation and voids dispute protection.</li>
                        <li><b className="text-foreground">Reply within 24h.</b> Fast, friendly responses boost your search ranking automatically.</li>
                        <li><b className="text-foreground">Reviews are gold.</b> Only customers with a completed booking can leave one. Aim for a proactive review request right after the event.</li>
                        <li><b className="text-foreground">Ratings compound.</b> DJs with 4.8+ average rating get featured in search and land ~3× more bookings.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "standards" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={BadgeCheck}
                      eyebrow="Standards"
                      title="The DJConnect code of conduct"
                      subtitle="Check each commitment below. All five are required to continue — this is the bar every verified DJ signs up to."
                      acked={ackedSet.has("standards")}
                      onAck={(v) => ackChapter("standards", v)}
                      illustration={<StandardsIllustration acked={Object.values(state.standardsAcks).filter(Boolean).length} total={STANDARDS.length} />}
                      ackLabel="I commit to every standard above and understand violations can lead to suspension"
                    >
                      <ul className="space-y-2">
                        {STANDARDS.map((s) => {
                          const checked = !!state.standardsAcks[s.id];
                          return (
                            <li key={s.id}>
                              <label
                                className={cn(
                                  "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors",
                                  checked ? "border-accent bg-accent/10" : "border-border hover:border-accent/40",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    setState((st) => ({
                                      ...st,
                                      standardsAcks: { ...st.standardsAcks, [s.id]: e.target.checked },
                                    }))
                                  }
                                  className="mt-1 h-4 w-4 accent-[hsl(21,90%,53%)]"
                                />
                                <span>
                                  <span className="block text-sm font-semibold">{s.title}</span>
                                  <span className="mt-0.5 block text-xs text-muted-foreground">{s.body}</span>
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                      {!standardsAllAcked && (
                        <p className="text-xs text-muted-foreground">
                          Check all {STANDARDS.length} commitments before you can confirm and continue.
                        </p>
                      )}
                    </ChapterShell>
                  )}

                  {currentChapter.id === "quiz" && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="p-6 md:p-10"
                    >
                      <div className="mb-6 flex items-start gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <GraduationCap className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Comprehension check · Chapter 8 of {CHAPTERS.length}
                          </div>
                          <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                            Quick 5-question quiz
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            You need 5 / 5 correct to finish the guide. Each question has an explanation if you get it wrong —
                            review the earlier chapters from the sidebar anytime.
                          </p>
                        </div>
                      </div>
                      <QuizStep onPassed={() => setState((s) => ({ ...s, quizPassed: true }))} />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur md:px-8">
              <Button type="button" variant="ghost" onClick={goBack} disabled={state.currentIndex === 0}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <Headphones className="h-3.5 w-3.5" /> Chapter {state.currentIndex + 1} of {CHAPTERS.length} · {currentChapter.minutes}m
              </div>
              {state.currentIndex < CHAPTERS.length - 1 ? (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  disabled={!canAdvance}
                  onClick={goNext}
                  className={cn("min-w-[160px]", canAdvance && "shadow-lg shadow-accent/30")}
                >
                  Next chapter <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  disabled={!state.quizPassed || celebrated}
                  onClick={finish}
                  className="min-w-[200px] shadow-lg shadow-accent/40"
                >
                  {celebrated ? (
                    <><PartyPopper className="h-4 w-4" /> Completed!</>
                  ) : (
                    <>Finish guide <PartyPopper className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Need help? <a href="mailto:support@djconnect.example" className="underline-offset-4 hover:underline">support@djconnect.example</a></span>
            <span>Each DJ who completes this guide gets their verified badge faster.</span>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-4 max-w-md rounded-2xl border border-white/10 bg-background p-8 text-center shadow-2xl"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
                <GraduationCap className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-2xl font-semibold">Guide completed!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You're cleared to accept bookings. Taking you to your DJ dashboard…
              </p>
              <div className="mt-5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" /> Redirecting
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bullet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>
        <b className="text-foreground">{title}</b>{" "}
        <span className="text-muted-foreground">{children}</span>
      </span>
    </li>
  );
}

function WelcomeIllustration() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary via-primary to-accent/60 p-8 text-primary-foreground shadow-xl">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -left-16 bottom-0 h-52 w-52 rounded-full border border-white/10"
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Mandatory training
        </div>
        <h3 className="mt-3 text-2xl font-semibold">8 chapters · ~15 minutes</h3>
        <p className="mt-2 max-w-xs text-sm text-white/80">
          Interactive demos, a live refund calculator, a payout slider, and a 5-question quiz. No fluff.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          {CHAPTERS.slice(0, 6).map((c) => (
            <div key={c.id} className="rounded-lg bg-white/10 px-3 py-2">
              {c.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileCardIllustration() {
  return (
    <div className="rounded-2xl border bg-card shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary via-primary to-accent/70">
        <motion.div
          className="absolute inset-0"
          animate={{ background: ["linear-gradient(120deg,#F97316,#1e1b4b)", "linear-gradient(220deg,#A855F7,#0F172A)", "linear-gradient(120deg,#F97316,#1e1b4b)"] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="text-xl font-semibold text-white">DJ Nova</div>
            <div className="text-xs text-white/80">Copenhagen, DK</div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 · 38 reviews
          </span>
          <span className="rounded-full border px-2 py-0.5">5–10 years</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Wedding", "Corporate", "Birthday"].map((t) => (
            <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{t}</span>
          ))}
        </div>
        <div className="flex justify-between border-t pt-2 text-xs">
          <span>From <b>DKK 3,500</b></span>
          <span className="text-muted-foreground">Responds &lt; 24h</span>
        </div>
      </div>
    </div>
  );
}

function CommunicationIllustration() {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
        Hi! Would you be free for our wedding reception on 14 June? ~120 guests, Copenhagen.
        <div className="mt-1 text-[10px] text-muted-foreground">Sara · Customer</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-accent/15 px-3 py-2 text-sm">
        Absolutely — that date is open. I've sent over a DKK 6,500 quote covering setup, 6 hours of music and a wireless mic.
        <div className="mt-1 text-right text-[10px] text-muted-foreground">You · DJ</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
        Perfect — accepting now. Love your setup photos. 💜
        <div className="mt-1 text-[10px] text-muted-foreground">Sara · Customer</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-xs text-accent">
        <Star className="h-3.5 w-3.5" /> After the event, Sara will be asked for a rating and written review.
      </motion.div>
    </div>
  );
}

function StandardsIllustration({ acked, total }: { acked: number; total: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Your signed commitments</span>
        <span>{acked} / {total}</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full bg-accent" animate={{ width: `${(acked / total) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 text-[11px]">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
              i < acked ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {i < acked ? <Check className="h-3.5 w-3.5 text-accent" /> : <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />}
            Commitment #{i + 1}
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Your signatures are stored on your profile and reviewed during any customer dispute.
      </p>
    </div>
  );
}

function fireConfetti() {
  const end = Date.now() + 1600;
  const colors = ["#F97316", "#FBBF24", "#38BDF8", "#A855F7", "#F472B6"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
