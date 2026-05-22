import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SUB_PROFILE_META } from "@/lib/demoDJProfile";
import { cn } from "@/lib/utils";
import type { DJProfileEditorState } from "./useEditorState";
import { DJProfileView } from "@/pages/public/DJProfileView";
import { mockReviews } from "@/data/mock";
import type {
  DJEquipmentPhoto,
  DJProfileWithRelations,
  EventType,
} from "@/types/domain";
import type { SetupSize } from "@/types/database";

/**
 * Shared "live preview" rail for the DJ profile editor.
 *
 * Renders the full public DJ profile inline using the exact same
 * {@link DJProfileView} component the live `/djs/<username>` route
 * renders — guaranteeing the editor preview always matches the
 * actual page. The DJ object passed to `DJProfileView` is rebuilt
 * from the editor's reactive state, so every keystroke / upload
 * updates the preview immediately.
 *
 * The component is sticky and has its own internal scroll on `xl+`
 * so the long profile fits next to the form without pushing the
 * page height.
 */
export function LiveProfilePreview({
  state,
  className,
}: {
  state: DJProfileEditorState;
  className?: string;
}) {
  const { seed, activeKey } = state;
  const meta = SUB_PROFILE_META[activeKey];

  const previewDJ = useMemo(() => buildPreviewDJ(state), [state]);
  const previewReviews = useMemo(
    () => mockReviews.filter((r) => r.dj_profile_id === seed.id),
    [seed.id],
  );

  return (
    <div
      className={cn(
        "space-y-2 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
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

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm xl:max-h-[calc(100vh-9rem)] xl:overflow-y-auto">
        <div className="origin-top-left">
          <DJProfileView
            dj={previewDJ}
            reviews={previewReviews}
            similarDJs={[]}
            mode="preview"
          />
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        Switch event types above to preview each version. Edits appear here
        instantly — no save needed.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Build a DJProfileWithRelations from editor state                       */
/* -------------------------------------------------------------------- */

function buildPreviewDJ(state: DJProfileEditorState): DJProfileWithRelations {
  const {
    seed,
    stageName,
    bio,
    equipment,
    setupSize,
    travelRadius,
    priceFrom,
    priceOnRequest,
    selectedEventTypes,
    profilePhotoUrl,
    equipmentPhotoUrls,
    subProfiles,
    activeKey,
  } = state;

  const sub = subProfiles[activeKey];

  /* Photos: featured + sub-profile gallery photos first, then DJ's
     equipment photo library as fallback content. */
  const galleryPhotos: DJEquipmentPhoto[] = [];
  if (sub.featuredPhotoDataUrl) {
    galleryPhotos.push(stubPhoto("featured", sub.featuredPhotoDataUrl));
  }
  sub.gallery
    .filter((g) => g.type === "photo")
    .forEach((g) => galleryPhotos.push(stubPhoto(g.id, g.dataUrl)));
  equipmentPhotoUrls.forEach((url, i) =>
    galleryPhotos.push(stubPhoto(`fallback-${i}`, url)),
  );

  const eventTypes: EventType[] = selectedEventTypes
    .map((id) =>
      seed.event_types.find((et) => et.id === id) ??
      ({
        id,
        label: prettyEventTypeLabel(id),
        sort_order: 0,
      } as EventType),
    )
    .filter(Boolean);

  return {
    ...seed,
    stage_name: stageName || seed.stage_name,
    tagline: sub.tagline || seed.tagline,
    bio: sub.bio?.trim() || bio || seed.bio,
    equipment_description: equipment || seed.equipment_description,
    setup_size: (setupSize as SetupSize) || seed.setup_size,
    travel_radius_km: travelRadius || seed.travel_radius_km,
    price_from_minor: priceOnRequest
      ? seed.price_from_minor
      : Math.round(((sub.priceFromMajor || priceFrom) * 100) || 0) ||
        seed.price_from_minor,
    price_on_request: priceOnRequest,
    profile: {
      ...seed.profile,
      avatar_url: profilePhotoUrl ?? seed.profile.avatar_url,
    },
    equipment_photos: galleryPhotos.length ? galleryPhotos : seed.equipment_photos,
    event_types: eventTypes.length ? eventTypes : seed.event_types,
  };
}

function stubPhoto(id: string, url: string): DJEquipmentPhoto {
  return {
    id,
    dj_profile_id: "preview",
    storage_path: "",
    url,
    sort_order: 0,
    created_at: new Date().toISOString(),
  } as DJEquipmentPhoto;
}

function prettyEventTypeLabel(id: string): string {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
