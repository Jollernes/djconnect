import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Camera, Check, ChevronRight, Copy, Lightbulb,
  MapPin, Shield, Sparkles, Star, Wand2, Image as ImageIcon, Trophy,
} from "lucide-react";
import {
  SUB_PROFILE_KEYS, SUB_PROFILE_META,
  type DemoDJSubProfile, type DemoDJSubProfileKey,
} from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { FeaturedPhotoSlot, GalleryRow } from "./MediaUploader";
import type { DJProfileEditorState } from "./useEditorState";
import { cn, formatCurrency } from "@/lib/utils";

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
        <h1 className="text-2xl font-semibold">Edit your profile</h1>
        <p className="text-sm text-muted-foreground">
          Walk through your 4 sub-profiles one chapter at a time. Inherit from General to skip
          repeats; only customise what's actually different per event type.
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
    label: "Show your work",
    eyebrow: "Chapter 1 of 3",
    helper:
      "Customers decide who to message in seconds, almost always based on a photo. Pick the one that best represents this kind of event.",
  },
  tell: {
    label: "Tell your story",
    eyebrow: "Chapter 2 of 3",
    helper:
      "A short tagline + a focused bio. Speak directly to people booking this kind of event — what makes you the right call?",
  },
  vibe: {
    label: "Set the vibe",
    eyebrow: "Chapter 3 of 3",
    helper:
      "Music style, signature tracks and how you actually run the night. This is what separates you from a Spotify playlist.",
  },
};

const PEER_BENCHMARKS: Record<DemoDJSubProfileKey, Record<Chapter, string>> = {
  general: {
    show: "Top DJs in Denmark lead with 1 strong featured photo + 5–8 gallery items mixing crowd shots, gear and venue.",
    tell: "Most-booked profiles have a tagline 5–10 words long and a bio of 80–150 words.",
    vibe: "DJs who list 4–6 signature tracks get ~30% more profile views than those with none.",
  },
  wedding: {
    show: "Wedding DJs typically post 8+ photos: first-dance moments, ceremony setups, dancefloor crowds. 1–2 short clips perform really well.",
    tell: "Couples scan for ceremony / dinner / dancefloor experience. Mention how you read multi-generational rooms.",
    vibe: "Wedding playlists average 5 hours. Show you can flow from quiet dinner sets to peak-hour anthems.",
  },
  birthday: {
    show: "Birthday-party gallery sweet spot: 6–10 photos, lots of crowd energy, bonus points for milestone party shots (30th, 40th, 50th).",
    tell: "Birthday hosts want a DJ who can read a less-formal room. Talk about energy and crowd-pleasers, not contracts.",
    vibe: "Top birthday DJs list at least 6 signature tracks across genres — guests will request, and you want to look ready.",
  },
  corporate: {
    show: "Corporate clients trust polished setups: 5–8 photos including conference rooms, branded booths and tasteful uplighting.",
    tell: "Companies want professionalism. Reference any brand-name clients, AV experience and your approach to volume control.",
    vibe: "Corporate gigs are 60% awareness music, 40% peak. Show you understand the brand-appropriate balance.",
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
              Step {currentChapterIdx + 1}
              <span className="text-muted-foreground"> of {chapterSteps.length}</span>
            </span>
          ) : currentChapter?.kind === "intro" ? (
            <span className="font-semibold">Welcome — let's set up your 4 sub-profiles</span>
          ) : (
            <span className="font-semibold">All sub-profiles complete</span>
          )}
        </div>
        {currentChapter?.kind === "chapter" && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip for now
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
            <Wand2 className="h-3 w-3" /> Guided setup
          </span>
          <h2 className="text-3xl font-semibold leading-tight">
            One profile, four versions — built in about 10 minutes.
          </h2>
          <p className="text-sm text-muted-foreground">
            Customers see a different version of your profile depending on whether they're booking
            a wedding, a birthday, a corporate event, or something else. Filling in all four boosts
            how often you show up in each kind of search by ~3–5×.
          </p>
          <div className="space-y-2 text-sm">
            <Bullet>
              <strong>Start with General.</strong> It's the master template — Wedding, Birthday and
              Corporate inherit from it by default. You only change what's different.
            </Bullet>
            <Bullet>
              <strong>Three short chapters per sub-profile:</strong> Show your work · Tell your
              story · Set the vibe.
            </Bullet>
            <Bullet>
              <strong>Skip anything anytime.</strong> A "Skip for now" link is always at the top,
              and you can jump between sub-profiles using the strip above.
            </Bullet>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={onStart} className="gap-1.5">
              Start with General <ArrowRight className="h-4 w-4" />
            </Button>
            {completedCount > 0 && (
              <Button variant="outline" onClick={() => onJumpSubProfile("wedding")}>
                Skip to next incomplete
              </Button>
            )}
          </div>
        </div>

        <ul className="space-y-2 rounded-xl border bg-muted/30 p-4 text-xs">
          <li className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your sub-profiles
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
    <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
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
                    <p className="font-semibold">Use my General profile for this chapter</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {inheritsAlready
                        ? "This chapter is currently identical to your General profile. Edit any field below to customise it."
                        : `Copy your General ${chapter === "show" ? "photo + gallery" : chapter === "tell" ? "tagline + bio" : "music details"} into the ${meta.label.toLowerCase()} sub-profile, then tweak only what's actually different.`}
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
                  <span className="text-xs font-medium">{inheritsAlready ? "Inherited" : "Inherit"}</span>
                </div>
              </div>
              {inheritDisabled && !isGeneral && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Fill in your General {chapter === "show" ? "photos" : chapter === "tell" ? "story" : "music details"} first to enable inheritance here.
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
                Peer benchmark
              </p>
              <p className="mt-0.5">{PEER_BENCHMARKS[subKey][chapter]}</p>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              Step {stepNumber} of {totalSteps}
            </span>
            <Button
              onClick={() => {
                handleSaveAll();
                onContinue();
              }}
              className="gap-1.5"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live preview sidebar */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
        <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>How customers see you</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Live
          </span>
        </p>
        <PreviewCard
          state={state}
          subKey={subKey}
          highlight={chapter}
        />
        <p className="rounded-md bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
          Customers booking <span className="font-medium text-foreground">{meta.label.toLowerCase()}s</span>{" "}
          see this card in search results and your full profile when they tap it.
        </p>
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
          <Sparkles className="h-3.5 w-3.5" /> Featured photo
        </p>
        <FeaturedPhotoSlot
          value={sub.featuredPhotoDataUrl}
          onChange={onSetFeatured}
          eventLabel={eventLabel}
          size="md"
        />
        <p className="text-xs text-muted-foreground">
          This is the single photo customers see on your DJ card when they search for {eventLabel.toLowerCase()}s. Pick one image — high-energy crowd shots and confident close-ups out-perform stage-only photos.
        </p>
      </div>
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <ImageIcon className="h-3.5 w-3.5" /> Gallery
        </p>
        <GalleryRow
          items={sub.gallery}
          onAppend={onAppend}
          onRemove={onRemove}
          eventLabel={eventLabel}
        />
        <p className="text-xs text-muted-foreground">
          Add at least 3 supporting photos or short videos. Customers scroll through this on your full profile.
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
        <Label htmlFor={`d-tagline-${eventLabel}`}>One-line tagline</Label>
        <Input
          id={`d-tagline-${eventLabel}`}
          maxLength={80}
          placeholder={`e.g. "${eventLabel} DJ — modern, warm, dancefloor-first"`}
          value={sub.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {sub.tagline.length}/80 — shown right under your name on the DJ card.
        </p>
      </div>
      <div>
        <Label htmlFor={`d-bio-${eventLabel}`}>Bio for {eventLabel.toLowerCase()}s</Label>
        <Textarea
          id={`d-bio-${eventLabel}`}
          rows={6}
          placeholder={`What makes you the right ${eventLabel.toLowerCase()} DJ? Cover style, experience and what you actually do during the event.`}
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
            {sub.bio.length} characters
          </span>
          {sub.bio.length < 80 && (
            <span className="text-muted-foreground">
              · {80 - sub.bio.length} more recommended for a complete profile
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
          <Label htmlFor={`d-music-${eventLabel}`}>Music style</Label>
          <Input
            id={`d-music-${eventLabel}`}
            placeholder="e.g. House, disco, funk — high-energy peaks"
            value={sub.musicStyle}
            onChange={(e) => onChange("musicStyle", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`d-signature-${eventLabel}`}>Signature tracks</Label>
          <Input
            id={`d-signature-${eventLabel}`}
            placeholder="3–5 tracks customers might recognise"
            value={sub.signatureTracks}
            onChange={(e) => onChange("signatureTracks", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`d-approach-${eventLabel}`}>How you actually run a {eventLabel.toLowerCase()}</Label>
        <Textarea
          id={`d-approach-${eventLabel}`}
          rows={4}
          placeholder={`E.g. when you arrive, how you handle requests, how the typical flow looks.`}
          value={sub.approach}
          onChange={(e) => onChange("approach", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`d-price-${eventLabel}`}>Starting price (DKK) — optional</Label>
        <Input
          id={`d-price-${eventLabel}`}
          type="number"
          min={0}
          placeholder="Leave blank to use your default"
          value={sub.priceFromMajor || ""}
          onChange={(e) => onChange("priceFromMajor", Number(e.target.value) || 0)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          You can charge differently for {eventLabel.toLowerCase()}s. Blank = use your account default.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Live preview                                                           */
/* -------------------------------------------------------------------- */

function PreviewCard({
  state,
  subKey,
  highlight,
}: {
  state: DJProfileEditorState;
  subKey: DemoDJSubProfileKey;
  highlight: Chapter;
}) {
  const { subProfiles, stageName, profilePhotoUrl, priceFrom, priceOnRequest, seed } = state;
  const sub = subProfiles[subKey];
  const meta = SUB_PROFILE_META[subKey];
  const featured = sub.featuredPhotoDataUrl ?? profilePhotoUrl ?? undefined;
  const price = sub.priceFromMajor || priceFrom;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-muted",
          highlight === "show" && "ring-2 ring-foreground ring-offset-2",
        )}
      >
        {featured ? (
          <img src={featured} alt={stageName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Camera className="h-6 w-6" />
            <span>Featured photo placeholder</span>
          </div>
        )}
        <Badge variant="success" className="absolute right-3 top-3 gap-1">
          <Shield className="h-3 w-3" /> Verified
        </Badge>
      </div>
      <div className="space-y-2 p-3">
        <div className={cn(highlight === "tell" && "rounded-md bg-foreground/5 p-1.5 ring-1 ring-foreground/20")}>
          <h3 className="line-clamp-1 text-base font-semibold">{stageName}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {sub.tagline || `Your ${meta.label.toLowerCase()} tagline appears here`}
          </p>
        </div>
        <div className={cn("flex items-center gap-1.5 text-xs", highlight === "vibe" && "rounded-md bg-foreground/5 p-1.5 ring-1 ring-foreground/20")}>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{seed.rating_average.toFixed(1)}</span>
          <span className="text-muted-foreground">({seed.rating_count})</span>
          <Badge variant="secondary" className="ml-1">
            {meta.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" /> {seed.base_location}
          </span>
          <span className="font-semibold">
            {priceOnRequest
              ? "Price on request"
              : price
              ? `From ${formatCurrency(price * 100, seed.currency)}`
              : "—"}
          </span>
        </div>
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
            ? "All four sub-profiles ready — you're discoverable for every event type."
            : `${completedCount} of 4 sub-profiles ready — keep going to unlock more searches.`}
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          {allComplete
            ? "Customers will now see the right version of you for whatever event they're searching, instead of one generic page."
            : "Each completed sub-profile makes you appear in that kind of search. Wedding-only profiles, for example, won't show up to customers booking corporate events."}
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
                  <Check className="h-3 w-3" /> Done
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
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={handleSaveAll}>Save all changes</Button>
        <Button variant="outline" asChild>
          <a href={`/djs/${seed.username}`} target="_blank" rel="noreferrer">
            Preview public profile
          </a>
        </Button>
      </div>
    </div>
  );
}
