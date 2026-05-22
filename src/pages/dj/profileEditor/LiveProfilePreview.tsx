import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SUB_PROFILE_META } from "@/lib/demoDJProfile";
import { cn } from "@/lib/utils";
import type { DJProfileEditorState } from "./useEditorState";
import { CustomerCardPreview, CustomerProfilePreview } from "./VariantB";

/**
 * Shared "live customer preview" rail for the DJ profile editor.
 *
 * Renders an always-on, sticky preview that mirrors how the active
 * sub-profile will appear to a customer browsing for that kind of event.
 * The rail composes two existing surface previews (the search-result
 * card + the public-profile snippet) plus a small heading with a live
 * indicator and an "open the full page" escape hatch.
 *
 * The component is intentionally state-driven (no props beyond `state`)
 * so any variant in the editor can drop it into a right-rail slot
 * without wiring per-field props, and the preview will always reflect
 * whichever sub-profile the DJ is currently editing.
 */
export function LiveProfilePreview({
  state,
  className,
  density = "default",
}: {
  state: DJProfileEditorState;
  className?: string;
  /**
   * `compact` trims the heading / spacing so the rail fits inside a
   * fullscreen editor overlay (e.g. Variant C) where vertical real
   * estate is tighter.
   */
  density?: "default" | "compact";
}) {
  const {
    subProfiles,
    activeKey,
    stageName,
    profilePhotoUrl,
    priceFrom,
    priceOnRequest,
    seed,
  } = state;

  const sub = subProfiles[activeKey];
  const meta = SUB_PROFILE_META[activeKey];

  return (
    <div
      className={cn(
        density === "default"
          ? "space-y-3 lg:sticky lg:top-20 lg:h-fit"
          : "space-y-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <LivePulse />
          Live preview · {meta.label}
        </p>
        <a
          href={`/djs/${seed.username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open in new tab
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

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

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Switch event types above to preview each version. Edits appear here
        instantly — no save needed.
      </p>
    </div>
  );
}

/** Soft pulsing dot to signal "this is reactive". */
function LivePulse() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/60"
        animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}
