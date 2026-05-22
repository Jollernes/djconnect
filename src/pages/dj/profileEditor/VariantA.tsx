import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { SUB_PROFILE_KEYS, SUB_PROFILE_META } from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { LiveProfilePreview } from "./LiveProfilePreview";
import { FeaturedPhotoSlot, GalleryRow } from "./MediaUploader";
import { SubProfileTextFields } from "./SubProfileTextFields";
import type { DJProfileEditorState } from "./useEditorState";
import { cn } from "@/lib/utils";

/**
 * Variant A — Inline media-rich tabs (evolution of the current design).
 *
 * Same 4-tab structure the DJ already saw, but each tab now leads with a
 * featured-photo slot and a gallery row before the text fields. Completion
 * is tracked at 9 checks per tab (5 text fields + featured photo + 3 gallery
 * items) and surfaced as a per-tab progress bar inside each tab plus a
 * global "X of 4 complete" strip at the top.
 */
export function VariantA({ state }: { state: DJProfileEditorState }) {
  const {
    subProfiles, activeKey, setActiveKey, updateSubProfile,
    setFeaturedPhoto, appendGalleryItems, removeGalleryItem,
    completion, completedCount, completionPct, allComplete,
    handleSaveSubProfile, handleSaveAll,
  } = state;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div className="min-w-0 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Edit your profile</h1>
        <p className="text-sm text-muted-foreground">
          Customers see a different version of your profile depending on the kind of event they're booking.
          For each event type, upload a featured photo, a small photo / video gallery, and tailor the text.
        </p>
      </header>

      {/* Global progress strip */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sub-profile completion
            </p>
            <p className="mt-1 text-base font-semibold">
              {completedCount} of {SUB_PROFILE_KEYS.length} fully complete
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{completionPct}%</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-foreground"
            initial={false}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        {!allComplete && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              For each event type: <span className="font-medium text-foreground">1 featured photo</span> +{" "}
              <span className="font-medium text-foreground">3 gallery items</span> + the text fields.
              Start with <span className="font-medium text-foreground">General</span>.
            </span>
          </p>
        )}
      </div>

      {/* Sub-profile tabs */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <Tabs value={activeKey} onValueChange={(v) => setActiveKey(v as typeof activeKey)}>
            <TabsList className="grid h-auto w-full grid-cols-4 gap-1 bg-muted/60 p-1">
              {SUB_PROFILE_KEYS.map((k) => {
                const c = completion.find((x) => x.key === k)!;
                return (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="flex h-auto flex-col items-center gap-1 px-2 py-2 text-xs sm:text-sm"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {SUB_PROFILE_META[k].label}
                      <SubProfileStatusDot complete={c.complete} ratio={c.ratio} />
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {SUB_PROFILE_KEYS.map((k) => {
              const sub = subProfiles[k];
              const c = completion.find((x) => x.key === k)!;
              const meta = SUB_PROFILE_META[k];
              return (
                <TabsContent key={k} value={k} className="mt-5 space-y-6">
                  {/* Header for this sub-profile */}
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {meta.eyebrow}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">{meta.label} profile</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{meta.helper}</p>
                      </div>
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold tabular-nums">
                        {Math.round(c.ratio * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-background">
                      <motion.div
                        className="h-full bg-foreground"
                        initial={false}
                        animate={{ width: `${Math.round(c.ratio * 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Media block */}
                  <div className="grid gap-4 lg:grid-cols-[260px,1fr] lg:gap-6">
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <Sparkles className="h-3.5 w-3.5" /> Featured photo
                      </p>
                      <FeaturedPhotoSlot
                        value={sub.featuredPhotoDataUrl}
                        onChange={(next) => setFeaturedPhoto(k, next)}
                        eventLabel={meta.label}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <ImageIcon className="h-3.5 w-3.5" /> Gallery — photos & videos
                      </p>
                      <GalleryRow
                        items={sub.gallery}
                        onAppend={(items) => appendGalleryItems(k, items)}
                        onRemove={(id) => removeGalleryItem(k, id)}
                        eventLabel={meta.label}
                      />
                    </div>
                  </div>

                  {/* Text fields */}
                  <SubProfileTextFields
                    value={sub}
                    onChange={(field, value) => updateSubProfile(k, field, value)}
                    eventLabel={meta.label}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <p className="text-xs text-muted-foreground">
                      {c.complete ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                          <Check className="h-3.5 w-3.5" /> Featured photo, gallery and text are all set
                        </span>
                      ) : (
                        <span>
                          {c.textComplete ? "Text ready · " : "Tagline / bio (80+) / music style / signature / approach + "}
                          {c.mediaComplete ? "media ready" : "featured photo + 3 gallery items remaining"}
                        </span>
                      )}
                    </p>
                    <Button onClick={() => handleSaveSubProfile(k)} className="gap-1.5">
                      Save & continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <AccountWideSection state={state} />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSaveAll}>Save all changes</Button>
      </div>

      <p className="text-xs text-muted-foreground xl:hidden">
        Live preview is shown alongside the editor on wider screens.
      </p>

      <div className="xl:hidden">
        <LiveProfilePreview state={state} />
      </div>
      </div>

      <aside className="hidden xl:block">
        <LiveProfilePreview state={state} />
      </aside>
    </div>
  );
}

function SubProfileStatusDot({ complete, ratio }: { complete: boolean; ratio: number }) {
  if (complete) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full border",
        ratio > 0 ? "border-foreground bg-foreground/40" : "border-muted-foreground/60",
      )}
    />
  );
}
