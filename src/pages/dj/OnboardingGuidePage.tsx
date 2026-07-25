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
    title: "Velkommen ombord",
    icon: Sparkles,
    description: "Hvad DJConnect er, og hvad vi forventer af dig",
    minutes: 1,
  },
  {
    id: "profile",
    title: "Din profil er dit udstillingsvindue",
    icon: BookOpen,
    description: "Hvordan kunder finder og vælger dig",
    minutes: 2,
  },
  {
    id: "bookings",
    title: "Bookingens livscyklus",
    icon: Workflow,
    description: "Fra forespørgsel til udbetaling — gå selv flowet igennem",
    minutes: 3,
  },
  {
    id: "payouts",
    title: "Sådan får du betaling",
    icon: Banknote,
    description: "Stripe escrow, 10%-gebyret og timing",
    minutes: 2,
  },
  {
    id: "cancellations",
    title: "Afbestillinger & tvister",
    icon: ShieldAlert,
    description: "Leg med refunderingsskyderen for at se reglerne",
    minutes: 2,
  },
  {
    id: "communication",
    title: "Beskeder, anmeldelser & bedømmelser",
    icon: MessageSquareText,
    description: "Platformens regler for kundekommunikation",
    minutes: 2,
  },
  {
    id: "standards",
    title: "DJ-standarder & adfærdskodeks",
    icon: BadgeCheck,
    description: "Den standard vi holder enhver verificeret DJ op imod",
    minutes: 2,
  },
  {
    id: "quiz",
    title: "Forståelsestjek",
    icon: GraduationCap,
    description: "Hurtig quiz med 5 spørgsmål. 100% kræves for at afslutte.",
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
    title: "Komplet, testet udstyr til hvert event",
    body: "Jeg medbringer mit eget komplette mobildiskotek — afspillere, mixer, højtalere, kabler, grundlæggende lys. Lokationens udstyr er en bonus, aldrig en afhængighed.",
  },
  {
    id: "punctuality",
    title: "Mød op mindst 90 minutter før start",
    body: "Jeg stiller roligt op, laver lydtjek med lokationen og er klar til at spille 30 minutter før gæsterne ankommer.",
  },
  {
    id: "professionalism",
    title: "Professionelt fremtoning & adfærd",
    body: "Jeg klæder mig passende til eventet, indtager ikke alkohol i overdreven grad under bookingen og behandler gæster og personale med respekt.",
  },
  {
    id: "music",
    title: "Spil-ikke-liste og kundens ønsker",
    body: "Jeg beder kunden om deres spil-ikke-liste og imødekommer ønsker, hvor det er rimeligt, samtidig med at jeg holder dansegulvet i live.",
  },
  {
    id: "exclusive",
    title: "Kommunikation kun på platformen",
    body: "Jeg holder alle bookingsamtaler inde i DJConnects beskeder og opfordrer aldrig til betalinger uden for platformen.",
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
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Obligatorisk træning</span>
            <span className="text-muted-foreground hidden sm:inline">
              Gennemfør guiden, før du accepterer din første booking.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {restored && (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Check className="h-3 w-3 text-accent" /> Fremskridt gendannet
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
                <Lock className="h-3.5 w-3.5 text-accent" /> Låst adgang
              </div>
              <p className="mt-2">
                Dit dashboard og din bookingindbakke låses op, så snart du gennemfører denne guide. Estimeret tid: ~15 minutter.
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
                      eyebrow="Velkommen"
                      title="Velkommen til DJConnect"
                      subtitle="Før du accepterer din første booking, vil vi sikre os, at vi er enige om, hvordan platformen fungerer, hvordan du får betaling, og hvilke standarder vores kunder forventer."
                      acked={ackedSet.has("welcome")}
                      onAck={(v) => ackChapter("welcome", v)}
                      illustration={<WelcomeIllustration />}
                    >
                      <ul className="grid gap-3 sm:grid-cols-3">
                        {[
                          { icon: Workflow, title: "Forstå flowet", body: "Fra bookingforespørgsel til udbetaling — du går selv hvert trin igennem." },
                          { icon: Banknote, title: "Forudsigelige udbetalinger", body: "Escrow, et fast gebyr på 10%, frigivet 24 timer efter eventet." },
                          { icon: BadgeCheck, title: "Klare standarder", body: "Én fælles standard, så enhver DJConnect-DJ optjener det verificerede mærke." },
                        ].map((f) => (
                          <li key={f.title} className="rounded-xl border bg-card p-4">
                            <f.icon className="h-5 w-5 text-accent" />
                            <div className="mt-2 text-sm font-semibold">{f.title}</div>
                            <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-xl border bg-accent/5 p-4 text-sm">
                        <div className="font-semibold">Du er færdig på cirka 15 minutter.</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Fremskridt gemmes automatisk. Hvis du forlader siden, fortsætter du præcis, hvor du slap.
                        </p>
                      </div>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "profile" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={BookOpen}
                      eyebrow="Dit udstillingsvindue"
                      title="Din profil sælger for dig"
                      subtitle="De fleste kunder taler aldrig med dig, før de allerede har besluttet sig. Din profil er hele præsentationen."
                      acked={ackedSet.has("profile")}
                      onAck={(v) => ackChapter("profile", v)}
                      illustration={<ProfileCardIllustration />}
                    >
                      <ul className="space-y-3 text-sm">
                        <Bullet title="Billedkvalitet betyder mere, end du tror">
                          Hero-billedet + udstyrsbilleder afgør første indtryk. Ægte billeder slår stockfotos hver gang.
                        </Bullet>
                        <Bullet title="Din bio sætter stemningen">
                          Skriv i første person. Nævn genrer, signaturmomenter og hvad du er bedst til. Undgå copy-paste.
                        </Bullet>
                        <Bullet title="Specifikke eventtyper rangerer dig højere">
                          Kunder filtrerer efter eventtype. Vælg alle dem, du reelt dækker — og intet, du ikke gør.
                        </Bullet>
                        <Bullet title="Hold tilgængeligheden opdateret">
                          Blokér utilgængelige datoer hurtigt. DJs med live tilgængelighed får ~2× flere forespørgsler.
                        </Bullet>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "bookings" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={Workflow}
                      eyebrow="Bookingens livscyklus"
                      title="Gå en booking igennem fra start til slut"
                      subtitle="Klik dig gennem hvert trin nedenfor. Sådan forløber bookinger præcis på DJConnect — der er ingen overraskelser."
                      acked={ackedSet.has("bookings")}
                      onAck={(v) => ackChapter("bookings", v)}
                      illustration={<BookingFlowDemo />}
                      ackLabel="Jeg har klikket gennem hvert trin og forstår flowet"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Svar hurtigt.</b> Du har 24 timer til at acceptere eller afvise. Hurtigere svar konverterer langt bedre.</li>
                        <li><b className="text-foreground">Giv et gennemsigtigt tilbud.</b> Hvis bookingen er pris-efter-forespørgsel, så send én klar totalpris.</li>
                        <li><b className="text-foreground">Brug beskeder til logistik.</b> Aftal tider, adgang, parkering og playlister på platformen.</li>
                        <li><b className="text-foreground">Marker events som gennemført.</b> Det hjælper systemet med at frigive din udbetaling til tiden.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "payouts" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={Banknote}
                      eyebrow="Udbetalinger"
                      title="Sådan får du rent faktisk betaling"
                      subtitle="Prøv skyderen — det er den samme udregning, vi kører bag kulisserne på hver booking."
                      acked={ackedSet.has("payouts")}
                      onAck={(v) => ackChapter("payouts", v)}
                      illustration={<PayoutCalculator />}
                      ackLabel="Jeg har prøvet beregneren og forstår 10%-gebyret og frigivelsen efter 24 timer"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Escrow.</b> Kundens betaling ligger hos Stripe, ikke dig, indtil efter eventet.</li>
                        <li><b className="text-foreground">Gebyr.</b> 10% platformsgebyr trækkes automatisk — du betaler det aldrig af egen lomme.</li>
                        <li><b className="text-foreground">Frigivelse.</b> 24 timer efter eventdatoen frigives 90% til din tilknyttede Stripe-konto.</li>
                        <li><b className="text-foreground">Bankindbetaling.</b> Din bank indsætter pengene 2–5 bankdage senere ifølge Stripes tidsplan.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "cancellations" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={ShieldAlert}
                      eyebrow="Afbestillinger"
                      title="Refunderinger er automatiske og regelbaserede"
                      subtitle="Træk i skyderen for at se, hvad der sker på forskellige tidspunkter før et event. Disse regler er ikke til forhandling."
                      acked={ackedSet.has("cancellations")}
                      onAck={(v) => ackChapter("cancellations", v)}
                      illustration={<RefundSimulator />}
                      ackLabel="Jeg har udforsket refunderingstrinnene og forstår hver grænse"
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Hvis kunden afbestiller</b>, kører den automatiske politik (14d/7d/0d) med det samme.</li>
                        <li><b className="text-foreground">Hvis du afbestiller</b>, modtager kunden fuld refundering, og din profil tager et tillidstab. Gør kun dette i ægte nødstilfælde.</li>
                        <li><b className="text-foreground">Tvister</b> går gennem support — vi har altid dokumentationen takket være beskeder på platformen.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "communication" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={MessageSquareText}
                      eyebrow="Communication"
                      title="Beskeder, anmeldelser & bedømmelser"
                      subtitle="Enhver interaktion på DJConnect registreres. Det holder alle trygge og hjælper dig med at vokse."
                      acked={ackedSet.has("communication")}
                      onAck={(v) => ackChapter("communication", v)}
                      illustration={<CommunicationIllustration />}
                    >
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><b className="text-foreground">Kun kommunikation på platformen.</b> Flyt aldrig samtaler væk fra platformen — det er en overtrædelse af reglerne og ophæver tvistbeskyttelsen.</li>
                        <li><b className="text-foreground">Svar inden for 24 timer.</b> Hurtige, venlige svar booster automatisk din placering i søgningen.</li>
                        <li><b className="text-foreground">Anmeldelser er guld værd.</b> Kun kunder med en gennemført booking kan efterlade en. Sigt efter proaktivt at bede om en anmeldelse lige efter eventet.</li>
                        <li><b className="text-foreground">Bedømmelser hober sig op.</b> DJs med en gennemsnitsbedømmelse på 4,8+ bliver fremhævet i søgningen og lander ~3× flere bookinger.</li>
                      </ul>
                    </ChapterShell>
                  )}

                  {currentChapter.id === "standards" && (
                    <ChapterShell
                      index={state.currentIndex}
                      total={CHAPTERS.length}
                      icon={BadgeCheck}
                      eyebrow="Standarder"
                      title="DJConnects adfærdskodeks"
                      subtitle="Afkryds hvert løfte nedenfor. Alle fem kræves for at fortsætte — det er den standard, enhver verificeret DJ forpligter sig til."
                      acked={ackedSet.has("standards")}
                      onAck={(v) => ackChapter("standards", v)}
                      illustration={<StandardsIllustration acked={Object.values(state.standardsAcks).filter(Boolean).length} total={STANDARDS.length} />}
                      ackLabel="Jeg forpligter mig til hver standard ovenfor og forstår, at overtrædelser kan føre til suspendering"
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
                          Afkryds alle {STANDARDS.length} løfter, før du kan bekræfte og fortsætte.
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
                            Forståelsestjek · Kapitel 8 af {CHAPTERS.length}
                          </div>
                          <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                            Hurtig quiz med 5 spørgsmål
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Du skal have 5 / 5 rigtige for at gennemføre guiden. Hvert spørgsmål har en forklaring, hvis du svarer forkert —
                            gennemgå de tidligere kapitler fra sidemenuen når som helst.
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
                <ChevronLeft className="h-4 w-4" /> Tilbage
              </Button>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <Headphones className="h-3.5 w-3.5" /> Kapitel {state.currentIndex + 1} af {CHAPTERS.length} · {currentChapter.minutes}m
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
                  Næste kapitel <ChevronRight className="h-4 w-4" />
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
                    <><PartyPopper className="h-4 w-4" /> Gennemført!</>
                  ) : (
                    <>Afslut guide <PartyPopper className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Brug for hjælp? <a href="mailto:support@djconnect.example" className="underline-offset-4 hover:underline">support@djconnect.example</a></span>
            <span>Hver DJ, der gennemfører denne guide, får sit verificerede mærke hurtigere.</span>
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
              <h3 className="mt-5 text-2xl font-semibold">Guide gennemført!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Du er klar til at acceptere bookinger. Vi sender dig til dit DJ-dashboard…
              </p>
              <div className="mt-5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" /> Omdirigerer
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
          <Sparkles className="h-3.5 w-3.5" /> Obligatorisk træning
        </div>
        <h3 className="mt-3 text-2xl font-semibold">8 kapitler · ~15 minutter</h3>
        <p className="mt-2 max-w-xs text-sm text-white/80">
          Interaktive demoer, en live refunderingsberegner, en udbetalingsskyder og en quiz med 5 spørgsmål. Ingen fyld.
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
            <div className="text-xs text-white/80">København, DK</div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <BadgeCheck className="h-3 w-3" /> Verificeret
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4,9 · 38 anmeldelser
          </span>
          <span className="rounded-full border px-2 py-0.5">5–10 år</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Bryllup", "Firma", "Fødselsdag"].map((t) => (
            <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{t}</span>
          ))}
        </div>
        <div className="flex justify-between border-t pt-2 text-xs">
          <span>Fra <b>3.500 kr.</b></span>
          <span className="text-muted-foreground">Svarer &lt; 24t</span>
        </div>
      </div>
    </div>
  );
}

function CommunicationIllustration() {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
        Hej! Er du ledig til vores bryllupsreception den 14. juni? ~120 gæster, København.
        <div className="mt-1 text-[10px] text-muted-foreground">Sara · Kunde</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-accent/15 px-3 py-2 text-sm">
        Helt sikkert — den dato er ledig. Jeg har sendt et tilbud på 6.500 kr. inkl. opsætning, 6 timers musik og en trådløs mikrofon.
        <div className="mt-1 text-right text-[10px] text-muted-foreground">Dig · DJ</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
        Perfekt — jeg accepterer nu. Elsker dine billeder af opsætningen. 💜
        <div className="mt-1 text-[10px] text-muted-foreground">Sara · Kunde</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-xs text-accent">
        <Star className="h-3.5 w-3.5" /> Efter eventet bliver Sara bedt om en bedømmelse og en skriftlig anmeldelse.
      </motion.div>
    </div>
  );
}

function StandardsIllustration({ acked, total }: { acked: number; total: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Dine underskrevne løfter</span>
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
            Løfte #{i + 1}
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Dine underskrifter gemmes på din profil og gennemgås ved enhver kundetvist.
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
