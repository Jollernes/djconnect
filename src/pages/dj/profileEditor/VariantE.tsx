import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Image as ImageIcon, Sparkles, Wand2, X,
} from "lucide-react";
import { SUB_PROFILE_KEYS, SUB_PROFILE_META, type DemoDJSubProfileKey } from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { FeaturedPhotoSlot, GalleryRow, ProgressRing } from "./MediaUploader";
import { CustomerCardPreview, CustomerProfilePreview } from "./VariantB";
import type { DJProfileEditorState } from "./useEditorState";
import { cn } from "@/lib/utils";

/**
 * Variant E — Variant B as the base, with discrete guidance bits borrowed
 * from D.
 *
 *  - Same split layout (editor left, sticky live preview right) and same
 *    sub-profile pill switcher as Variant B.
 *  - Calm chapter ribbon ("Show · Tell · Vibe") above the editor; clicking
 *    a chapter scrolls the matching section into view. No wizard takeover.
 *  - Per-section "Copy from General" mini-link instead of a big switch +
 *    explainer card.
 *  - Inline italic peer benchmarks under each section header (single line)
 *    instead of an amber tip card.
 *  - Quiet celebration: a small dismissible pill banner appears when a
 *    sub-profile becomes complete; upgrades to "All 4 ready" when done.
 *    No fullscreen celebration.
 */
export function VariantE({ state }: { state: DJProfileEditorState }) {
  const {
    subProfiles, activeKey, setActiveKey, updateSubProfile,
    setFeaturedPhoto, appendGalleryItems, removeGalleryItem,
    completion, completedCount, completionPct, allComplete,
    handleSaveSubProfile, handleSaveAll, seed,
    stageName, profilePhotoUrl, priceFrom, priceOnRequest,
  } = state;

  const sub = subProfiles[activeKey];
  const general = subProfiles.general;
  const meta = SUB_PROFILE_META[activeKey];
  const c = completion.find((x) => x.key === activeKey)!;

  /* Quiet celebration — track which sub-profiles have flipped complete on
   * this page-load so we can surface a tiny banner exactly once each.       */
  const [celebrate, setCelebrate] = useState<DemoDJSubProfileKey | "all" | null>(null);
  const prevCompletedRef = useRef<Set<DemoDJSubProfileKey>>(
    new Set(completion.filter((x) => x.complete).map((x) => x.key)),
  );
  useEffect(() => {
    const nowDone = new Set(completion.filter((x) => x.complete).map((x) => x.key));
    let firstNew: DemoDJSubProfileKey | null = null;
    for (const k of nowDone) {
      if (!prevCompletedRef.current.has(k)) {
        firstNew = k;
        break;
      }
    }
    if (firstNew) {
      setCelebrate(nowDone.size === SUB_PROFILE_KEYS.length ? "all" : firstNew);
    }
    prevCompletedRef.current = nowDone;
  }, [completion]);

  /* Chapter section refs — clicking a chapter label scrolls into view.      */
  const showRef = useRef<HTMLDivElement | null>(null);
  const tellRef = useRef<HTMLDivElement | null>(null);
  const vibeRef = useRef<HTMLDivElement | null>(null);

  /* Per-chapter completion (used by the ribbon dots). */
  const chapterStates = useMemo(
    () => ({
      show: Boolean(sub.featuredPhotoDataUrl) && sub.gallery.length >= 3,
      tell: Boolean(sub.tagline.trim()) && sub.bio.trim().length >= 80,
      vibe: Boolean(sub.musicStyle.trim()) && Boolean(sub.signatureTracks.trim()) && Boolean(sub.approach.trim()),
    }),
    [sub],
  );

  /* Inheritance: per-chapter copy-from-General. Disabled when General has nothing. */
  const isGeneral = activeKey === "general";
  const generalHas = useMemo(
    () => ({
      show: Boolean(general.featuredPhotoDataUrl) || general.gallery.length > 0,
      tell: Boolean(general.tagline.trim()) || Boolean(general.bio.trim()),
      vibe: Boolean(general.musicStyle.trim()) || Boolean(general.signatureTracks.trim()) || Boolean(general.approach.trim()),
    }),
    [general],
  );

  function copyFromGeneral(chapter: "show" | "tell" | "vibe") {
    if (chapter === "show") {
      if (general.featuredPhotoDataUrl) setFeaturedPhoto(activeKey, general.featuredPhotoDataUrl);
      const existing = new Set(sub.gallery.map((g) => g.id));
      const toAdd = general.gallery.filter((g) => !existing.has(g.id));
      if (toAdd.length) appendGalleryItems(activeKey, toAdd);
    } else if (chapter === "tell") {
      if (general.tagline) updateSubProfile(activeKey, "tagline", general.tagline);
      if (general.bio) updateSubProfile(activeKey, "bio", general.bio);
    } else {
      if (general.musicStyle) updateSubProfile(activeKey, "musicStyle", general.musicStyle);
      if (general.signatureTracks) updateSubProfile(activeKey, "signatureTracks", general.signatureTracks);
      if (general.approach) updateSubProfile(activeKey, "approach", general.approach);
      if (general.priceFromMajor) updateSubProfile(activeKey, "priceFromMajor", general.priceFromMajor);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Edit your profile</h1>
          <p className="text-sm text-muted-foreground">
            Pick an event type below — the right-hand panel previews how customers see you for that search.
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sub-profiles complete</p>
          <p className="text-base font-semibold tabular-nums">
            {completedCount} / {SUB_PROFILE_KEYS.length}{" "}
            <span className="text-muted-foreground">· {completionPct}%</span>
          </p>
        </div>
      </header>

      {/* Quiet celebration banner */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {celebrate === "all" ? (
                <span>
                  <span className="font-semibold">All four sub-profiles ready.</span>{" "}
                  <span className="text-muted-foreground">You're now fully discoverable.</span>
                </span>
              ) : (
                <span>
                  <span className="font-semibold">{SUB_PROFILE_META[celebrate].label} ready.</span>{" "}
                  <span className="text-muted-foreground">
                    {completedCount} of {SUB_PROFILE_KEYS.length} done — keep going.
                  </span>
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setCelebrate(null)}
              className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-emerald-100"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-profile pill switcher (same as Variant B) */}
      <div className="flex flex-wrap gap-2">
        {SUB_PROFILE_KEYS.map((k) => {
          const sc = completion.find((x) => x.key === k)!;
          const active = k === activeKey;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setActiveKey(k)}
              className={cn(
                "flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40",
              )}
            >
              <ProgressRing
                ratio={sc.ratio}
                size={22}
                strokeWidth={2}
                className={cn(active && "text-background")}
              />
              <span className="font-medium">{SUB_PROFILE_META[k].label}</span>
              {sc.complete && (
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-full",
                    active ? "bg-background text-foreground" : "bg-emerald-600 text-white",
                  )}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        {/* Editor panel */}
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Header for current sub-profile */}
            <div className="space-y-2 border-b border-border/60 pb-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {meta.eyebrow}
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{meta.label} profile</h2>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {Math.round(c.ratio * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{meta.helper}</p>
            </div>

            {/* Discrete chapter ribbon */}
            <ChapterRibbon
              states={chapterStates}
              onJump={(ch) => {
                const ref = ch === "show" ? showRef : ch === "tell" ? tellRef : vibeRef;
                ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />

            {/* Show chapter */}
            <section ref={showRef} className="space-y-4 scroll-mt-24">
              <SectionHeader
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Show your work"
                tip={PEER_BENCHMARKS[activeKey].show}
                inheritEnabled={!isGeneral && generalHas.show}
                onInherit={() => copyFromGeneral("show")}
              />
              <FeaturedPhotoSlot
                value={sub.featuredPhotoDataUrl}
                onChange={(next) => setFeaturedPhoto(activeKey, next)}
                eventLabel={meta.label}
                size="md"
              />
              <GalleryRow
                items={sub.gallery}
                onAppend={(items) => appendGalleryItems(activeKey, items)}
                onRemove={(id) => removeGalleryItem(activeKey, id)}
                eventLabel={meta.label}
              />
            </section>

            <div className="border-t border-border/40" />

            {/* Tell + Vibe chapters split into two visually anchored sections
                so each chapter's inheritance link + inline tip can target only
                its own fields. */}
            <section ref={tellRef} className="space-y-4 scroll-mt-24">
              <SectionHeader
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                label="Tell your story"
                tip={PEER_BENCHMARKS[activeKey].tell}
                inheritEnabled={!isGeneral && generalHas.tell}
                onInherit={() => copyFromGeneral("tell")}
              />
              <SubProfileTellFields state={state} subKey={activeKey} />
            </section>

            <div className="border-t border-border/40" />

            <section ref={vibeRef} className="space-y-4 scroll-mt-24">
              <SectionHeader
                icon={<Wand2 className="h-3.5 w-3.5" />}
                label="Set the vibe"
                tip={PEER_BENCHMARKS[activeKey].vibe}
                inheritEnabled={!isGeneral && generalHas.vibe}
                onInherit={() => copyFromGeneral("vibe")}
              />
              <SubProfileVibeFields
                state={state}
                subKey={activeKey}
              />
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                {c.complete ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" /> Ready to save
                  </span>
                ) : !c.textComplete ? (
                  <span>Tagline + bio (80+) + music style + signature + approach required.</span>
                ) : !c.mediaComplete ? (
                  <span>Add a featured photo and at least 3 gallery items.</span>
                ) : (
                  <span>All set — save to lock it in.</span>
                )}
              </p>
              <Button onClick={() => handleSaveSubProfile(activeKey)} className="gap-1.5">
                Save & continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live preview (right) — same as Variant B, slightly quieter eyebrow */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
          <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Customer preview</span>
            <span className="text-[10px] font-normal normal-case text-muted-foreground/80">
              updates as you edit
            </span>
          </p>

          <CustomerCardPreview
            stageName={stageName}
            tagline={sub.tagline}
            featuredPhoto={sub.featuredPhotoDataUrl ?? profilePhotoUrl ?? undefined}
            location={seed.base_location}
            priceFromMajor={sub.priceFromMajor || priceFrom}
            priceOnRequest={priceOnRequest}
            currency={seed.currency}
            ratingAverage={seed.rating_average}
            ratingCount={seed.rating_count}
            eventLabel={meta.label}
          />

          {!sub.featuredPhotoDataUrl && !sub.tagline.trim() && (
            <p className="rounded-md bg-muted/30 p-2 text-[11px] italic text-muted-foreground">
              Empty for now — upload a featured photo or write a tagline and you'll see it appear here.
            </p>
          )}

          <CustomerProfilePreview
            stageName={stageName}
            sub={sub}
            profilePhoto={profilePhotoUrl ?? undefined}
            eventLabel={meta.label}
          />
        </aside>
      </div>

      <AccountWideSection state={state} />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSaveAll} disabled={!allComplete && completedCount === 0}>
          Save all changes
        </Button>
        <Button variant="outline" asChild>
          <a href={`/djs/${seed.username}`} target="_blank" rel="noreferrer">
            Preview full public profile
          </a>
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Section header — icon + label + inline tip + tiny "copy" link        */
/* -------------------------------------------------------------------- */

function SectionHeader({
  icon,
  label,
  tip,
  inheritEnabled,
  onInherit,
}: {
  icon: React.ReactNode;
  label: string;
  tip: string;
  inheritEnabled: boolean;
  onInherit: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {icon}
          {label}
        </p>
        {inheritEnabled && (
          <button
            type="button"
            onClick={onInherit}
            className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            title="Copy this section's values from your General profile"
          >
            Copy from General
          </button>
        )}
      </div>
      <p className="text-[11px] italic text-muted-foreground">{tip}</p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Chapter ribbon — Show · Tell · Vibe                                  */
/* -------------------------------------------------------------------- */

function ChapterRibbon({
  states,
  onJump,
}: {
  states: { show: boolean; tell: boolean; vibe: boolean };
  onJump: (ch: "show" | "tell" | "vibe") => void;
}) {
  const items: Array<{ key: "show" | "tell" | "vibe"; label: string }> = [
    { key: "show", label: "Show" },
    { key: "tell", label: "Tell" },
    { key: "vibe", label: "Vibe" },
  ];
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {items.map((it, i) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onJump(it.key)}
          className="group flex items-center gap-1.5 hover:text-foreground"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              states[it.key]
                ? "bg-emerald-600"
                : "bg-muted-foreground/40 group-hover:bg-foreground",
            )}
          />
          {it.label}
          {i < items.length - 1 && <span className="ml-1 h-px w-4 bg-border" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Tell-only fields (tagline + bio) — split out so the Tell section's   */
/* "Copy from General" link only copies tagline/bio without polluting   */
/* the page with duplicate vibe inputs.                                 */
/* -------------------------------------------------------------------- */

function SubProfileTellFields({
  state,
  subKey,
}: {
  state: DJProfileEditorState;
  subKey: DemoDJSubProfileKey;
}) {
  const { subProfiles, updateSubProfile } = state;
  const sub = subProfiles[subKey];
  const meta = SUB_PROFILE_META[subKey];

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`e-tagline-${subKey}`} className="text-sm font-medium">
          Tagline
        </label>
        <input
          id={`e-tagline-${subKey}`}
          type="text"
          maxLength={80}
          placeholder={`e.g. "${meta.label} DJ — modern, warm, dancefloor-first"`}
          value={sub.tagline}
          onChange={(e) => updateSubProfile(subKey, "tagline", e.target.value)}
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {sub.tagline.length}/80 — shown right under your name.
        </p>
      </div>
      <div>
        <label htmlFor={`e-bio-${subKey}`} className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id={`e-bio-${subKey}`}
          rows={4}
          placeholder={`Tell customers what makes you the right ${meta.label.toLowerCase()} DJ. Cover your style, experience, and what you do during the event.`}
          value={sub.bio}
          onChange={(e) => updateSubProfile(subKey, "bio", e.target.value)}
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {sub.bio.length} characters{" "}
          {sub.bio.length < 80 ? `(${80 - sub.bio.length} more needed)` : "✓"}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Vibe-only fields (music style + signature tracks + approach + price). */
/* Mirrors the Tell-only split so each chapter has its own targeted      */
/* inheritance link + inline tip.                                        */
/* -------------------------------------------------------------------- */

function SubProfileVibeFields({
  state,
  subKey,
}: {
  state: DJProfileEditorState;
  subKey: DemoDJSubProfileKey;
}) {
  const { subProfiles, updateSubProfile } = state;
  const sub = subProfiles[subKey];
  const meta = SUB_PROFILE_META[subKey];

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`e-music-${subKey}`} className="text-sm font-medium">
            Music style
          </label>
          <input
            id={`e-music-${subKey}`}
            type="text"
            placeholder="e.g. House, disco, funk — high-energy peaks"
            value={sub.musicStyle}
            onChange={(e) => updateSubProfile(subKey, "musicStyle", e.target.value)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor={`e-sig-${subKey}`} className="text-sm font-medium">
            Signature tracks
          </label>
          <input
            id={`e-sig-${subKey}`}
            type="text"
            placeholder="3–5 tracks customers might recognise"
            value={sub.signatureTracks}
            onChange={(e) => updateSubProfile(subKey, "signatureTracks", e.target.value)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`e-approach-${subKey}`} className="text-sm font-medium">
          Your approach
        </label>
        <textarea
          id={`e-approach-${subKey}`}
          rows={3}
          placeholder={`How do you run a ${meta.label.toLowerCase()}? E.g. when you arrive, how you handle requests, what the typical flow looks like.`}
          value={sub.approach}
          onChange={(e) => updateSubProfile(subKey, "approach", e.target.value)}
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor={`e-price-${subKey}`} className="text-sm font-medium">
          Starting price for this event type (DKK) — optional
        </label>
        <input
          id={`e-price-${subKey}`}
          type="number"
          min={0}
          placeholder="Leave blank to use your default"
          value={sub.priceFromMajor || ""}
          onChange={(e) =>
            updateSubProfile(subKey, "priceFromMajor", Number(e.target.value) || 0)
          }
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Peer benchmarks (mirrored from Variant D, surfaced as inline italics) */
/* -------------------------------------------------------------------- */

const PEER_BENCHMARKS: Record<DemoDJSubProfileKey, { show: string; tell: string; vibe: string }> = {
  general: {
    show: "Top DJs lead with 1 strong featured photo + 5–8 gallery items mixing crowd, gear and venue.",
    tell: "Most-booked profiles use a 5–10 word tagline and an 80–150 word bio.",
    vibe: "DJs listing 4–6 signature tracks get ~30% more profile views.",
  },
  wedding: {
    show: "Wedding DJs typically post 8+ photos: first-dance moments, ceremony setups, dancefloor crowds. 1–2 short clips perform really well.",
    tell: "Couples scan for ceremony / dinner / dancefloor experience and how you read multi-generational rooms.",
    vibe: "Wedding sets average ~5 hours — show you can flow from dinner to peak-hour anthems.",
  },
  birthday: {
    show: "Birthday gallery sweet spot: 6–10 photos with crowd energy; bonus points for milestone-party shots.",
    tell: "Birthday hosts want a DJ who reads a less-formal room. Talk energy and crowd-pleasers, not contracts.",
    vibe: "List at least 6 signature tracks across genres — guests will request, and you want to look ready.",
  },
  corporate: {
    show: "Corporate clients trust polished setups: 5–8 photos including conference rooms, branded booths and tasteful uplighting.",
    tell: "Companies want professionalism. Reference brand-name clients, AV experience and tasteful volume control.",
    vibe: "Corporate gigs are ~60% awareness, 40% peak — show you understand the brand-appropriate balance.",
  },
};
