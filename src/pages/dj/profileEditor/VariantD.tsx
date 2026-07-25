import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Copy, Lightbulb,
  Sparkles, Wand2, Image as ImageIcon, Trophy,
} from "lucide-react";
import {
  SUB_PROFILE_KEYS, SUB_PROFILE_META,
  type DemoDJSubProfile, type DemoDJSubProfileKey,
} from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { FeaturedPhotoSlot, GalleryRow } from "./MediaUploader";
import { LiveProfilePreview } from "./LiveProfilePreview";
import type { DJProfileEditorState } from "./useEditorState";
import { cn } from "@/lib/utils";

/**
 * Variant D — Guided wizard with inheritance + live preview.
 *
 * Linear journey inspired by Airbnb's listing creation flow. The DJ
 * progresses through 4 sub-profiles in sequence (General first, since
 * it's the canonical baseline), each broken into 3 short chapters:
 *
 *   1) Show your work    (featured photo + gallery)
 *   2) Tell your story   (tagline + bio)
 *   3) Set the vibe      (music style + signature tracks + approach + price)
 *
 * Best-practice patterns drawn from Airbnb / Stripe Connect / Cal.com /
 * Patreon / Etsy:
 *
 *  - **One question per screen** to reduce cognitive load.
 *  - **Inheritance shortcut** on non-General chapters: a one-click "Use
 *    my General profile for this chapter" button that copies the
 *    canonical values forward, so the DJ only fills in what's actually
 *    different per event type. ~Halves the perceived workload.
 *  - **Anchored peer benchmarks** beside each chapter ("Wedding DJs in
 *    Copenhagen typically post 8 photos and 1-2 videos") so the DJ
 *    knows the target instead of guessing.
 *  - **Live preview** of the customer-facing DJ card on the right, so
 *    the DJ sees the consequence of every edit immediately.
 *  - **Persistent progress** at the top: 12 segments (one per chapter)
 *    with a clear "Step X of 12" label and a "Skip for now" escape.
 *  - **Single primary CTA** per screen + sticky bottom nav.
 */
export function VariantD({ state }: { state: DJProfileEditorState }) {
  const steps = useMemo(() => buildSteps(), []);
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx]!;

  function goNext() {
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }
  function goPrev() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }
  function jumpToSubProfile(key: DemoDJSubProfileKey) {
    const idx = steps.findIndex((s) => s.kind === "chapter" && s.subKey === key && s.chapter === "show");
    if (idx >= 0) setStepIdx(idx);
  }

  const chapterSteps = steps.filter((s) => s.kind === "chapter");
  const currentChapterIdx = step.kind === "chapter" ? chapterSteps.indexOf(step) : -1;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Rediger din profil</h1>
        <p className="text-sm text-muted-foreground">
          Gennemgå dine 4 underprofiler ét kapitel ad gangen. Nedarv fra Generel for at springe
          gentagelser over; tilpas kun det, der reelt er anderledes pr. eventtype.
        </p>
      </header>

      {/* Persistent journey progress */}
      <JourneyProgress
        steps={steps}
        stepIdx={stepIdx}
        state={state}
        onJumpSubProfile={jumpToSubProfile}
        onSkip={goNext}
      />

      <div className="min-h-[420px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step.kind === "intro" && (
              <IntroScreen
                state={state}
                onStart={() => setStepIdx(1)}
                onJumpSubProfile={jumpToSubProfile}
              />
            )}
            {step.kind === "chapter" && (
              <ChapterScreen
                state={state}
                subKey={step.subKey}
                chapter={step.chapter}
                stepNumber={currentChapterIdx + 1}
                totalSteps={chapterSteps.length}
                onBack={stepIdx === 0 ? null : goPrev}
                onContinue={goNext}
              />
            )}
            {step.kind === "final" && <FinalScreen state={state} onJump={jumpToSubProfile} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AccountWideSection state={state} />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Step model                                                             */
/* -------------------------------------------------------------------- */

type Chapter = "show" | "tell" | "vibe";

type WizardStep =
  | { kind: "intro" }
  | { kind: "chapter"; subKey: DemoDJSubProfileKey; chapter: Chapter }
  | { kind: "final" };

const CHAPTER_ORDER: Chapter[] = ["show", "tell", "vibe"];

function buildSteps(): WizardStep[] {
  return [
    { kind: "intro" },
    ...SUB_PROFILE_KEYS.flatMap((subKey) =>
      CHAPTER_ORDER.map<WizardStep>((chapter) => ({ kind: "chapter", subKey, chapter })),
    ),
    { kind: "final" },
  ];
}

const CHAPTER_META: Record<Chapter, { label: string; eyebrow: string; helper: string }> = {
  show: {
    label: "Vis dit arbejde",
    eyebrow: "Kapitel 1 af 3",
    helper:
      "Kunder beslutter på sekunder, hvem de skriver til — næsten altid ud fra et billede. Vælg det, der bedst repræsenterer denne slags event.",
  },
  tell: {
    label: "Fortæl din historie",
    eyebrow: "Kapitel 2 af 3",
    helper:
      "Et kort slogan + en fokuseret bio. Tal direkte til dem, der booker denne slags event — hvad gør dig til det rette valg?",
  },
  vibe: {
    label: "Sæt stemningen",
    eyebrow: "Kapitel 3 af 3",
    helper:
      "Musikstil, signatur-numre og hvordan du rent faktisk styrer aftenen. Det er det, der adskiller dig fra en Spotify-playliste.",
  },
};

const PEER_BENCHMARKS: Record<DemoDJSubProfileKey, Record<Chapter, string>> = {
  general: {
    show: "Top-DJs i Danmark fører med 1 stærkt fremhævet billede + 5-8 gallerielementer med en blanding af publikum, udstyr og lokale.",
    tell: "De mest bookede profiler har et slogan på 5-10 ord og en bio på 80-150 ord.",
    vibe: "DJs, der angiver 4-6 signatur-numre, får ca. 30% flere profilvisninger end dem uden.",
  },
  wedding: {
    show: "Bryllups-DJs poster typisk 8+ billeder: bryllupsdans-øjeblikke, ceremoniopsætninger, fyldte dansegulve. 1-2 korte klip klarer sig rigtig godt.",
    tell: "Par scanner efter erfaring med ceremoni / middag / dansegulv. Nævn, hvordan du aflæser rum på tværs af generationer.",
    vibe: "Bryllupsplaylister varer i gennemsnit 5 timer. Vis, at du kan glide fra stille middagssæt til hits i højdepunktet.",
  },
  birthday: {
    show: "Det optimale fødselsdagsgalleri: 6-10 billeder, masser af publikumsenergi, bonuspoint for billeder fra runde fødselsdage (30, 40, 50 år).",
    tell: "Fødselsdagsværter vil have en DJ, der kan aflæse et mindre formelt rum. Tal om energi og fællessange, ikke kontrakter.",
    vibe: "Top-fødselsdags-DJs angiver mindst 6 signatur-numre på tværs af genrer — gæster vil ønske numre, og du vil fremstå klar.",
  },
  corporate: {
    show: "Erhvervskunder stoler på polerede opsætninger: 5-8 billeder med bl.a. konferencelokaler, brandede stande og smagfuld belysning.",
    tell: "Virksomheder vil have professionalisme. Henvis til kendte kunder, AV-erfaring og din tilgang til lydstyrkekontrol.",
    vibe: "Firmaarrangementer er 60% baggrundsmusik, 40% højdepunkt. Vis, at du forstår den brand-passende balance.",
  },
};

/* -------------------------------------------------------------------- */
/* Top progress strip                                                     */
/* -------------------------------------------------------------------- */

function JourneyProgress({
  steps,
  stepIdx,
  state,
  onJumpSubProfile,
  onSkip,
}: {
  steps: WizardStep[];
  stepIdx: number;
  state: DJProfileEditorState;
  onJumpSubProfile: (k: DemoDJSubProfileKey) => void;
  onSkip: () => void;
}) {
  const chapterSteps = steps.filter((s) => s.kind === "chapter");
  const currentChapter = steps[stepIdx];
  const currentChapterIdx =
    currentChapter?.kind === "chapter" ? chapterSteps.indexOf(currentChapter) : -1;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs">
          {currentChapterIdx >= 0 ? (
            <span className="font-semibold tabular-nums">
              Trin {currentChapterIdx + 1}
              <span className="text-muted-foreground"> af {chapterSteps.length}</span>
            </span>
          ) : currentChapter?.kind === "intro" ? (
            <span className="font-semibold">Velkommen — lad os opsætte dine 4 underprofiler</span>
          ) : (
            <span className="font-semibold">Alle underprofiler er færdige</span>
          )}
        </div>
        {currentChapter?.kind === "chapter" && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Spring over for nu
          </button>
        )}
      </div>

      {/* Sub-profile labels with progress bars */}
      <div className="grid gap-2 sm:grid-cols-4">
        {SUB_PROFILE_KEYS.map((k) => {
          const c = state.completion.find((x) => x.key === k)!;
          const stepsForKey = chapterSteps.filter((s) => s.kind === "chapter" && s.subKey === k);
          const isCurrent = currentChapter?.kind === "chapter" && currentChapter.subKey === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onJumpSubProfile(k)}
              className={cn(
                "rounded-lg border p-2 text-left transition-colors",
                isCurrent ? "border-foreground bg-foreground/5" : "border-border hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{SUB_PROFILE_META[k].label}</span>
                {c.complete ? (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {Math.round(c.ratio * 100)}%
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex gap-0.5">
                {stepsForKey.map((s) => {
                  const segIdx = chapterSteps.indexOf(s);
                  const completed = segIdx < currentChapterIdx;
                  const active = segIdx === currentChapterIdx;
                  return (
                    <span
                      key={`${k}-${s.kind === "chapter" ? s.chapter : ""}`}
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        completed
                          ? "bg-foreground"
                          : active
                          ? "bg-foreground"
                          : "bg-muted",
                      )}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Intro screen                                                           */
/* -------------------------------------------------------------------- */

function IntroScreen({
  state,
  onStart,
  onJumpSubProfile,
}: {
  state: DJProfileEditorState;
  onStart: () => void;
  onJumpSubProfile: (k: DemoDJSubProfileKey) => void;
}) {
  const { completion, completedCount } = state;
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1fr,320px] md:items-start">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
            <Wand2 className="h-3 w-3" /> Guidet opsætning
          </span>
          <h2 className="text-3xl font-semibold leading-tight">
            Én profil, fire versioner — bygget på cirka 10 minutter.
          </h2>
          <p className="text-sm text-muted-foreground">
            Kunder ser en forskellig version af din profil afhængigt af, om de booker et bryllup,
            en fødselsdag, et firmaevent eller noget andet. At udfylde alle fire øger, hvor ofte
            du dukker op i hver slags søgning, med ca. 3-5×.
          </p>
          <div className="space-y-2 text-sm">
            <Bullet>
              <strong>Begynd med Generel.</strong> Det er hovedskabelonen — Bryllup, Fødselsdag og
              Firmaevent nedarver fra den som standard. Du ændrer kun det, der er anderledes.
            </Bullet>
            <Bullet>
              <strong>Tre korte kapitler pr. underprofil:</strong> Vis dit arbejde · Fortæl din
              historie · Sæt stemningen.
            </Bullet>
            <Bullet>
              <strong>Spring hvad som helst over når som helst.</strong> Et "Spring over for nu"-link
              er altid øverst, og du kan hoppe mellem underprofiler via panelet ovenfor.
            </Bullet>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={onStart} className="gap-1.5">
              Begynd med Generel <ArrowRight className="h-4 w-4" />
            </Button>
            {completedCount > 0 && (
              <Button variant="outline" onClick={() => onJumpSubProfile("wedding")}>
                Spring til næste ufærdige
              </Button>
            )}
          </div>
        </div>

        <ul className="space-y-2 rounded-xl border bg-muted/30 p-4 text-xs">
          <li className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dine underprofiler
          </li>
          {SUB_PROFILE_KEYS.map((k) => {
            const c = completion.find((x) => x.key === k)!;
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => onJumpSubProfile(k)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border bg-background p-2.5 text-left hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{SUB_PROFILE_META[k].label}</span>
                      {c.complete ? (
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-2 w-2" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(c.ratio * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {SUB_PROFILE_META[k].eyebrow}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------------------------------------------- */
/* Chapter screen                                                         */
/* -------------------------------------------------------------------- */

function ChapterScreen({
  state,
  subKey,
  chapter,
  stepNumber,
  totalSteps,
  onBack,
  onContinue,
}: {
  state: DJProfileEditorState;
  subKey: DemoDJSubProfileKey;
  chapter: Chapter;
  stepNumber: number;
  totalSteps: number;
  onBack: (() => void) | null;
  onContinue: () => void;
}) {
  const { subProfiles, updateSubProfile, setFeaturedPhoto, appendGalleryItems, removeGalleryItem, handleSaveAll } = state;
  const sub = subProfiles[subKey];
  const general = subProfiles.general;
  const meta = SUB_PROFILE_META[subKey];
  const cmeta = CHAPTER_META[chapter];
  const isGeneral = subKey === "general";

  /** Copy values from General into this sub-profile for the current chapter. */
  function inheritFromGeneral() {
    if (chapter === "show") {
      if (general.featuredPhotoDataUrl) {
        setFeaturedPhoto(subKey, general.featuredPhotoDataUrl);
      }
      const existingIds = new Set(sub.gallery.map((g) => g.id));
      const toAdd = general.gallery.filter((g) => !existingIds.has(g.id));
      if (toAdd.length) appendGalleryItems(subKey, toAdd);
    } else if (chapter === "tell") {
      if (general.tagline) updateSubProfile(subKey, "tagline", general.tagline);
      if (general.bio) updateSubProfile(subKey, "bio", general.bio);
    } else {
      if (general.musicStyle) updateSubProfile(subKey, "musicStyle", general.musicStyle);
      if (general.signatureTracks) updateSubProfile(subKey, "signatureTracks", general.signatureTracks);
      if (general.approach) updateSubProfile(subKey, "approach", general.approach);
      if (general.priceFromMajor) updateSubProfile(subKey, "priceFromMajor", general.priceFromMajor);
    }
  }

  const inheritsAlready = useMemo(() => {
    if (isGeneral) return false;
    if (chapter === "show") {
      return (
        Boolean(sub.featuredPhotoDataUrl) &&
        sub.featuredPhotoDataUrl === general.featuredPhotoDataUrl &&
        sub.gallery.length >= general.gallery.length &&
        general.gallery.every((g) => sub.gallery.some((s) => s.id === g.id))
      );
    }
    if (chapter === "tell") {
      return sub.tagline === general.tagline && sub.bio === general.bio && Boolean(general.tagline);
    }
    return (
      sub.musicStyle === general.musicStyle &&
      sub.signatureTracks === general.signatureTracks &&
      sub.approach === general.approach &&
      Boolean(general.musicStyle)
    );
  }, [isGeneral, chapter, sub, general]);

  const inheritDisabled = useMemo(() => {
    if (isGeneral) return true;
    if (chapter === "show") return !general.featuredPhotoDataUrl && general.gallery.length === 0;
    if (chapter === "tell") return !general.tagline.trim() && !general.bio.trim();
    return !general.musicStyle.trim() && !general.signatureTracks.trim() && !general.approach.trim();
  }, [isGeneral, chapter, general]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-start">
      {/* Main column */}
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {meta.label} · {cmeta.eyebrow}
            </p>
            <h2 className="text-2xl font-semibold leading-tight">{cmeta.label}</h2>
            <p className="text-sm text-muted-foreground">{cmeta.helper}</p>
          </div>

          {/* Inheritance shortcut for non-General */}
          {!isGeneral && (
            <div
              className={cn(
                "mt-4 rounded-xl border bg-muted/30 p-3 text-sm",
                inheritsAlready && "border-emerald-200 bg-emerald-50/60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Copy className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
                  <div className="min-w-0">
                    <p className="font-semibold">Brug min Generel-profil til dette kapitel</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {inheritsAlready
                        ? "Dette kapitel er i øjeblikket identisk med din Generel-profil. Rediger et felt nedenfor for at tilpasse det."
                        : `Kopiér din Generel-${chapter === "show" ? "foto + galleri" : chapter === "tell" ? "slogan + bio" : "musikdetaljer"} ind i ${meta.label.toLowerCase()}-underprofilen, og juster kun det, der reelt er anderledes.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={inheritsAlready}
                    disabled={inheritDisabled}
                    onCheckedChange={(checked) => {
                      if (checked) inheritFromGeneral();
                    }}
                  />
                  <span className="text-xs font-medium">{inheritsAlready ? "Nedarvet" : "Nedarv"}</span>
                </div>
              </div>
              {inheritDisabled && !isGeneral && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Udfyld først din Generel-{chapter === "show" ? "fotos" : chapter === "tell" ? "historie" : "musikdetaljer"} for at aktivere nedarvning her.
                </p>
              )}
            </div>
          )}

          {/* Chapter content */}
          <div className="mt-6">
            {chapter === "show" && (
              <ChapterShow
                sub={sub}
                eventLabel={meta.label}
                onSetFeatured={(d) => setFeaturedPhoto(subKey, d)}
                onAppend={(items) => appendGalleryItems(subKey, items)}
                onRemove={(id) => removeGalleryItem(subKey, id)}
              />
            )}
            {chapter === "tell" && (
              <ChapterTell
                sub={sub}
                eventLabel={meta.label}
                onChange={(field, v) => updateSubProfile(subKey, field, v)}
              />
            )}
            {chapter === "vibe" && (
              <ChapterVibe
                sub={sub}
                eventLabel={meta.label}
                onChange={(field, v) => updateSubProfile(subKey, field, v)}
              />
            )}
          </div>
        </div>

        {/* Peer benchmark */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Branchemåling
              </p>
              <p className="mt-0.5">{PEER_BENCHMARKS[subKey][chapter]}</p>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Tilbage
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              Trin {stepNumber} af {totalSteps}
            </span>
            <Button
              onClick={() => {
                handleSaveAll();
                onContinue();
              }}
              className="gap-1.5"
            >
              Fortsæt <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live preview sidebar — full public profile, sticky on xl+ */}
      <aside>
        <LiveProfilePreview state={state} />
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Chapter content components                                             */
/* -------------------------------------------------------------------- */

function ChapterShow({
  sub,
  eventLabel,
  onSetFeatured,
  onAppend,
  onRemove,
}: {
  sub: DemoDJSubProfile;
  eventLabel: string;
  onSetFeatured: (next: string | undefined) => void;
  onAppend: Parameters<typeof GalleryRow>[0]["onAppend"];
  onRemove: Parameters<typeof GalleryRow>[0]["onRemove"];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Fremhævet billede
        </p>
        <FeaturedPhotoSlot
          value={sub.featuredPhotoDataUrl}
          onChange={onSetFeatured}
          eventLabel={eventLabel}
          size="md"
        />
        <p className="text-xs text-muted-foreground">
          Dette er det ene billede, kunder ser på dit DJ-kort, når de søger efter {eventLabel.toLowerCase()}. Vælg ét billede — energiske publikumsbilleder og selvsikre nærbilleder klarer sig bedre end rene scenebilleder.
        </p>
      </div>
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <ImageIcon className="h-3.5 w-3.5" /> Galleri
        </p>
        <GalleryRow
          items={sub.gallery}
          onAppend={onAppend}
          onRemove={onRemove}
          eventLabel={eventLabel}
        />
        <p className="text-xs text-muted-foreground">
          Tilføj mindst 3 supplerende fotos eller korte videoer. Kunder bladrer igennem dem på din fulde profil.
        </p>
      </div>
    </div>
  );
}

function ChapterTell({
  sub,
  eventLabel,
  onChange,
}: {
  sub: DemoDJSubProfile;
  eventLabel: string;
  onChange: <K extends keyof DemoDJSubProfile>(field: K, v: DemoDJSubProfile[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor={`d-tagline-${eventLabel}`}>Slogan på én linje</Label>
        <Input
          id={`d-tagline-${eventLabel}`}
          maxLength={80}
          placeholder={`f.eks. "${eventLabel}-DJ — moderne, varm, dansegulvet i fokus"`}
          value={sub.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {sub.tagline.length}/80 — vises lige under dit navn på DJ-kortet.
        </p>
      </div>
      <div>
        <Label htmlFor={`d-bio-${eventLabel}`}>Bio til {eventLabel.toLowerCase()}</Label>
        <Textarea
          id={`d-bio-${eventLabel}`}
          rows={6}
          placeholder={`Hvad gør dig til den rette ${eventLabel.toLowerCase()}-DJ? Beskriv stil, erfaring og hvad du rent faktisk gør under eventet.`}
          value={sub.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "tabular-nums",
              sub.bio.length >= 80 ? "text-emerald-700" : "text-muted-foreground",
            )}
          >
            {sub.bio.length} tegn
          </span>
          {sub.bio.length < 80 && (
            <span className="text-muted-foreground">
              · {80 - sub.bio.length} mere anbefales for en komplet profil
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChapterVibe({
  sub,
  eventLabel,
  onChange,
}: {
  sub: DemoDJSubProfile;
  eventLabel: string;
  onChange: <K extends keyof DemoDJSubProfile>(field: K, v: DemoDJSubProfile[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`d-music-${eventLabel}`}>Musikstil</Label>
          <Input
            id={`d-music-${eventLabel}`}
            placeholder="f.eks. House, disco, funk — høj energi i toppene"
            value={sub.musicStyle}
            onChange={(e) => onChange("musicStyle", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`d-signature-${eventLabel}`}>Signatur-numre</Label>
          <Input
            id={`d-signature-${eventLabel}`}
            placeholder="3-5 numre, kunder måske genkender"
            value={sub.signatureTracks}
            onChange={(e) => onChange("signatureTracks", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`d-approach-${eventLabel}`}>Hvordan du rent faktisk afvikler et {eventLabel.toLowerCase()}</Label>
        <Textarea
          id={`d-approach-${eventLabel}`}
          rows={4}
          placeholder={`F.eks. hvornår du ankommer, hvordan du håndterer ønsker, og hvordan det typiske flow ser ud.`}
          value={sub.approach}
          onChange={(e) => onChange("approach", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`d-price-${eventLabel}`}>Startpris (kr.) — valgfrit</Label>
        <Input
          id={`d-price-${eventLabel}`}
          type="number"
          min={0}
          placeholder="Lad stå tomt for at bruge din standard"
          value={sub.priceFromMajor || ""}
          onChange={(e) => onChange("priceFromMajor", Number(e.target.value) || 0)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Du kan tage en anden pris for {eventLabel.toLowerCase()}. Tomt = brug din kontostandard.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Final celebration                                                      */
/* -------------------------------------------------------------------- */

function FinalScreen({
  state,
  onJump,
}: {
  state: DJProfileEditorState;
  onJump: (k: DemoDJSubProfileKey) => void;
}) {
  const { completion, completedCount, allComplete, handleSaveAll, seed } = state;
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm">
      <div className="space-y-3 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <Trophy className="h-6 w-6" />
        </span>
        <h2 className="text-2xl font-semibold">
          {allComplete
            ? "Alle fire underprofiler er klar — du er synlig for alle eventtyper."
            : `${completedCount} af 4 underprofiler er klar — fortsæt for at låse op for flere søgninger.`}
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          {allComplete
            ? "Kunder ser nu den rette version af dig for det event, de søger efter, i stedet for én generisk side."
            : "Hver færdig underprofil får dig til at dukke op i den slags søgning. Profiler kun til bryllupper dukker f.eks. ikke op for kunder, der booker firmaevents."}
        </p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SUB_PROFILE_KEYS.map((k) => {
          const c = completion.find((x) => x.key === k)!;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onJump(k)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40",
                c.complete && "border-emerald-200 bg-emerald-50/60",
              )}
            >
              <div>
                <p className="text-sm font-semibold">{SUB_PROFILE_META[k].label}</p>
                <p className="text-xs text-muted-foreground">{SUB_PROFILE_META[k].eyebrow}</p>
              </div>
              {c.complete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <Check className="h-3 w-3" /> Færdig
                </span>
              ) : (
                <span className="text-xs font-semibold tabular-nums">
                  {Math.round(c.ratio * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleSaveAll}>Gem alle ændringer</Button>
        <a
          href={`/djs/${seed.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Åbn fuld offentlig profil i ny fane
        </a>
      </div>
    </div>
  );
}
