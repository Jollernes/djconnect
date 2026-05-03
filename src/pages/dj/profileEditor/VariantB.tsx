import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Check, MapPin, Shield, Sparkles, Star } from "lucide-react";
import { SUB_PROFILE_KEYS, SUB_PROFILE_META } from "@/lib/demoDJProfile";
import { AccountWideSection } from "./AccountWideSection";
import { FeaturedPhotoSlot, GalleryRow, ProgressRing } from "./MediaUploader";
import { SubProfileTextFields } from "./SubProfileTextFields";
import type { DJProfileEditorState } from "./useEditorState";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Variant B — Side-by-side editor + live customer preview.
 *
 * Top: a small horizontal sub-profile switcher with progress rings.
 * Below: split view. Left = editor for the active sub-profile (featured
 * photo, gallery, text). Right = sticky live preview that renders exactly
 * what a customer searching for that event type sees: a DJ search-result
 * card on top + a snippet of the public profile underneath. Updates as the
 * DJ types or uploads.
 */
export function VariantB({ state }: { state: DJProfileEditorState }) {
  const {
    subProfiles, activeKey, setActiveKey, updateSubProfile,
    setFeaturedPhoto, appendGalleryItems, removeGalleryItem,
    completion, completedCount, completionPct, allComplete,
    handleSaveSubProfile, handleSaveAll, seed,
    stageName, profilePhotoUrl, priceFrom, priceOnRequest,
  } = state;

  const sub = subProfiles[activeKey];
  const meta = SUB_PROFILE_META[activeKey];
  const c = completion.find((x) => x.key === activeKey)!;

  return (
    <div className="space-y-6">
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
            {completedCount} / {SUB_PROFILE_KEYS.length} <span className="text-muted-foreground">· {completionPct}%</span>
          </p>
        </div>
      </header>

      {/* Sub-profile switcher row */}
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
        {/* Editor panel (left) */}
        <Card>
          <CardContent className="space-y-6 p-6">
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
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Featured photo
              </p>
              <FeaturedPhotoSlot
                value={sub.featuredPhotoDataUrl}
                onChange={(next) => setFeaturedPhoto(activeKey, next)}
                eventLabel={meta.label}
                size="md"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Gallery — photos & videos</p>
              <GalleryRow
                items={sub.gallery}
                onAppend={(items) => appendGalleryItems(activeKey, items)}
                onRemove={(id) => removeGalleryItem(activeKey, id)}
                eventLabel={meta.label}
              />
            </div>

            <SubProfileTextFields
              value={sub}
              onChange={(field, value) => updateSubProfile(activeKey, field, value)}
              eventLabel={meta.label}
            />

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

        {/* Live preview (right) — sticky on lg+ */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
          <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Live customer preview</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Updates as you edit
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
/* Live preview pieces                                                    */
/* -------------------------------------------------------------------- */

export function CustomerCardPreview({
  stageName,
  tagline,
  featuredPhoto,
  location,
  priceFromMajor,
  priceOnRequest,
  currency,
  ratingAverage,
  ratingCount,
  eventLabel,
}: {
  stageName: string;
  tagline: string;
  featuredPhoto?: string;
  location: string;
  priceFromMajor: number;
  priceOnRequest: boolean;
  currency: string;
  ratingAverage: number;
  ratingCount: number;
  eventLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {featuredPhoto ? (
          <img src={featuredPhoto} alt={stageName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Featured photo placeholder
          </div>
        )}
        <Badge variant="success" className="absolute right-3 top-3 gap-1">
          <Shield className="h-3 w-3" /> Verified
        </Badge>
      </div>
      <div className="space-y-2 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold">{stageName}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {tagline || `Your ${eventLabel.toLowerCase()} tagline appears here`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{ratingAverage.toFixed(1)}</span>
          <span className="text-muted-foreground">({ratingCount})</span>
          <Badge variant="secondary" className="ml-1">
            {eventLabel}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" /> {location}
          </span>
          <span className="font-semibold">
            {priceOnRequest
              ? "Price on request"
              : priceFromMajor
              ? `From ${formatCurrency(priceFromMajor * 100, currency)}`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CustomerProfilePreview({
  stageName,
  sub,
  profilePhoto,
  eventLabel,
}: {
  stageName: string;
  sub: { tagline: string; bio: string; musicStyle: string; signatureTracks: string; gallery: { id: string; type: "photo" | "video"; dataUrl: string }[] };
  profilePhoto?: string;
  eventLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Public profile preview
      </p>
      <div className="flex items-start gap-3">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={stageName}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-full bg-muted ring-1 ring-border" />
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{stageName}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {sub.tagline || `${eventLabel} tagline shown here.`}
          </p>
        </div>
      </div>
      {sub.gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {sub.gallery.slice(0, 6).map((g) => (
            <div key={g.id} className="aspect-square overflow-hidden rounded-md ring-1 ring-border">
              {g.type === "video" ? (
                <video src={g.dataUrl} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About for {eventLabel.toLowerCase()}s</p>
        <p className="line-clamp-4 text-xs text-foreground/80">
          {sub.bio || "Your event-specific bio shows up here. Customers see this when they search for this kind of event."}
        </p>
      </div>
      {(sub.musicStyle || sub.signatureTracks) && (
        <div className="space-y-1 rounded-md bg-muted/40 p-2 text-xs">
          {sub.musicStyle && (
            <p>
              <span className="font-semibold">Music style:</span>{" "}
              <span className="text-muted-foreground">{sub.musicStyle}</span>
            </p>
          )}
          {sub.signatureTracks && (
            <p>
              <span className="font-semibold">Signature:</span>{" "}
              <span className="text-muted-foreground">{sub.signatureTracks}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Small re-used animated dot — kept here so VariantB stays self-contained. */
export function PreviewDot() {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
  );
}
