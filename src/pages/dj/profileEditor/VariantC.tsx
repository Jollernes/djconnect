import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Camera, Check, Image as ImageIcon, Sparkles,
} from "lucide-react";
import { SUB_PROFILE_KEYS, SUB_PROFILE_META, type DemoDJSubProfileKey } from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { LiveProfilePreview } from "./LiveProfilePreview";
import { FeaturedPhotoSlot, GalleryRow, ProgressRing, describeMedia } from "./MediaUploader";
import { SubProfileTextFields } from "./SubProfileTextFields";
import type { DJProfileEditorState } from "./useEditorState";
import { cn } from "@/lib/utils";

/**
 * Variant C — Card canvas (Pinterest / Notion-style).
 *
 * Main page = a 2x2 grid of large sub-profile cards. Each card uses the
 * featured photo as its background, overlays a completion ring, and
 * surfaces a tiny media tally + summary line. Clicking a card opens a
 * fullscreen editor (large hero photo top, drag-drop gallery, then text
 * fields). The Back button returns to the canvas. Feels less like a form
 * and more like editing a page on a creator platform.
 */
export function VariantC({ state }: { state: DJProfileEditorState }) {
  const [openKey, setOpenKey] = useState<DemoDJSubProfileKey | null>(null);
  const {
    subProfiles, completion, completedCount, completionPct,
    setActiveKey, profilePhotoUrl, handleSaveAll,
  } = state;

  function openCard(k: DemoDJSubProfileKey) {
    setActiveKey(k);
    setOpenKey(k);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-start">
      <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Rediger din profil</h1>
          <p className="text-sm text-muted-foreground">
            Hver eventtype nedenfor er sin egen side, som kunder ser, når de søger efter den slags event.
            Vælg en for at redigere dens foto, galleri og tekst.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing ratio={completionPct / 100} size={48} strokeWidth={4} />
          <div className="text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Underprofiler</p>
            <p className="font-semibold tabular-nums">
              {completedCount} af {SUB_PROFILE_KEYS.length} færdige
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SUB_PROFILE_KEYS.map((k) => {
          const sub = subProfiles[k];
          const c = completion.find((x) => x.key === k)!;
          const meta = SUB_PROFILE_META[k];
          const media = describeMedia(sub);
          const fallbackPhoto = profilePhotoUrl;
          const bg = sub.featuredPhotoDataUrl ?? fallbackPhoto ?? null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => openCard(k)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left ring-1 ring-border transition-shadow hover:shadow-lg"
            >
              {bg ? (
                <img
                  src={bg}
                  alt=""
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                    !sub.featuredPhotoDataUrl && "opacity-50",
                  )}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute right-3 top-3">
                <ProgressRing
                  ratio={c.ratio}
                  size={44}
                  strokeWidth={3}
                  className="text-white drop-shadow-sm"
                />
              </div>

              {!sub.featuredPhotoDataUrl && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                  <Camera className="h-3 w-3" /> Tilføj fremhævet billede
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 space-y-1 p-4 text-white">
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                  {meta.eyebrow}
                </p>
                <h3 className="text-xl font-semibold leading-tight">{meta.label}-profil</h3>
                <p className="text-xs opacity-80">
                  {summary(c.complete, sub.tagline, media.photos, media.videos)}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                  {c.complete ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Færdig
                    </>
                  ) : (
                    <>
                      Rediger <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AccountWideSection state={state} />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSaveAll}>Gem alle ændringer</Button>
      </div>

      </div>

      <aside>
        <LiveProfilePreview state={state} />
      </aside>

      <AnimatePresence>
        {openKey && (
          <FullscreenEditor
            key={openKey}
            keyId={openKey}
            state={state}
            onClose={() => setOpenKey(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function summary(complete: boolean, tagline: string, photos: number, videos: number): string {
  if (complete) {
    return tagline.length ? tagline : "Alt er klar — kunder ser dette ved matchende søgninger.";
  }
  const parts: string[] = [];
  parts.push(tagline ? `“${tagline.slice(0, 48)}${tagline.length > 48 ? "…" : ""}”` : "Slogan mangler");
  if (photos + videos === 0) parts.push("ingen medier endnu");
  else parts.push(`${photos} foto${photos === 1 ? "" : "s"}${videos ? ` · ${videos} video${videos === 1 ? "" : "er"}` : ""}`);
  return parts.join(" · ");
}

/* -------------------------------------------------------------------- */
/* Fullscreen editor                                                      */
/* -------------------------------------------------------------------- */

function FullscreenEditor({
  keyId,
  state,
  onClose,
}: {
  keyId: DemoDJSubProfileKey;
  state: DJProfileEditorState;
  onClose: () => void;
}) {
  const {
    subProfiles, updateSubProfile,
    setFeaturedPhoto, appendGalleryItems, removeGalleryItem, setGalleryCaption,
    completion, handleSaveSubProfile,
  } = state;
  const sub = subProfiles[keyId];
  const meta = SUB_PROFILE_META[keyId];
  const c = completion.find((x) => x.key === keyId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-background"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between gap-3 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Tilbage
          </button>
          <div className="flex items-center gap-3">
            <ProgressRing ratio={c.ratio} size={32} strokeWidth={3} />
            <span className="text-sm font-medium">
              {meta.label}-profil · <span className="text-muted-foreground">{Math.round(c.ratio * 100)}%</span>
            </span>
          </div>
          <Button
            onClick={() => {
              handleSaveSubProfile(keyId);
              onClose();
            }}
            className="gap-1.5"
          >
            Gem
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero featured photo */}
      <div className="container py-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {meta.eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Tilpas {meta.label.toLowerCase()}-versionen af din profil</h1>
        <p className="mt-2 text-sm text-muted-foreground">{meta.helper}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Fremhævet billede
            </p>
            <FeaturedPhotoSlot
              value={sub.featuredPhotoDataUrl}
              onChange={(next) => setFeaturedPhoto(keyId, next)}
              eventLabel={meta.label}
              size="lg"
            />
            <p className="text-xs text-muted-foreground">
              Dette erstatter dit standard DJ-kortfoto, når en kunde søger efter {meta.label.toLowerCase()}.
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <ImageIcon className="h-3.5 w-3.5" /> Galleri
            </p>
            <GalleryRow
              items={sub.gallery}
              onAppend={(items) => appendGalleryItems(keyId, items)}
              onRemove={(id) => removeGalleryItem(keyId, id)}
              onCaption={(id, c2) => setGalleryCaption(keyId, id, c2)}
              eventLabel={meta.label}
            />
            <p className="text-xs text-muted-foreground">
              Træk fotos og korte klip hertil. Billedtekster er valgfrie og vises under hvert element på den offentlige profil.
            </p>
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-semibold">Fortæl kunderne, hvad der gør dig til den rette {meta.label.toLowerCase()}-DJ</p>
            <SubProfileTextFields
              value={sub}
              onChange={(field, v) => updateSubProfile(keyId, field, v)}
              eventLabel={meta.label}
            />
          </CardContent>
        </Card>

        <div className="mt-6">
          <LiveProfilePreview state={state} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            {c.complete ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Foto, galleri og tekst er alle udfyldt
              </span>
            ) : !c.textComplete ? (
              <span>Slogan + bio (80+) + musikstil + signatur + tilgang påkrævet.</span>
            ) : !c.mediaComplete ? (
              <span>Tilføj et fremhævet billede og mindst 3 gallerielementer.</span>
            ) : (
              <span>Alt er klar — gem for at låse det fast.</span>
            )}
          </p>
          <Button
            onClick={() => {
              handleSaveSubProfile(keyId);
              onClose();
            }}
            className="gap-1.5"
          >
            Gem & luk
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
