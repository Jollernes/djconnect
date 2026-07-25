import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { mockDJs } from "@/data/mock";
import {
  readDemoDJProfile,
  writeDemoDJProfile,
  isSubProfileComplete,
  isSubProfileTextComplete,
  isSubProfileMediaComplete,
  subProfileCompleteness,
  emptySubProfile,
  SUB_PROFILE_KEYS,
  SUB_PROFILE_META,
  type DemoDJProfile,
  type DemoDJSubProfile,
  type DemoDJSubProfileKey,
  type DemoDJMediaItem,
} from "@/lib/demoDJProfile";

/**
 * Shared state + handlers for the DJ profile editor. The 3 design variants
 * (`VariantA`, `VariantB`, `VariantC`) all consume this hook so they share
 * a single source of truth for the persisted demo DJ profile.
 */
export function useDJProfileEditor() {
  const seed = mockDJs[0]!;
  const initial = readDemoDJProfile();

  /* ------------------------------------------------------------------ */
  /* Account-wide fields (shared across all sub-profiles)                 */
  /* ------------------------------------------------------------------ */
  const [stageName, setStageName] = useState(initial?.stageName?.trim() || seed.stage_name);
  const [bio, setBio] = useState(initial?.bio?.trim() || seed.bio);
  const [equipment, setEquipment] = useState(
    initial?.equipmentDescription?.trim() ||
      buildEquipmentDescriptionFromPresets(initial?.equipmentPresets) ||
      seed.equipment_description,
  );
  const [setupSize, setSetupSize] = useState(initial?.setupSize?.trim() || seed.setup_size);
  const [travelRadius, setTravelRadius] = useState(seed.travel_radius_km);
  const [priceFrom, setPriceFrom] = useState(seed.price_from_minor ? seed.price_from_minor / 100 : 0);
  const [priceOnRequest, setPriceOnRequest] = useState(seed.price_on_request);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    initial?.eventTypes?.length ? initial.eventTypes : seed.event_types.map((et) => et.id),
  );

  const profilePhotoUrl = initial?.profilePhotoDataUrl ?? seed.profile.avatar_url ?? null;
  const equipmentPhotoUrls = initial?.equipmentPhotoDataUrls?.length
    ? initial.equipmentPhotoDataUrls
    : seed.equipment_photos.map((p) => p.url);

  /* ------------------------------------------------------------------ */
  /* Sub-profiles                                                         */
  /* ------------------------------------------------------------------ */
  const [subProfiles, setSubProfiles] = useState<Record<DemoDJSubProfileKey, DemoDJSubProfile>>(
    () => mergeSubProfiles(initial?.subProfiles, initial?.bio),
  );
  const [activeKey, setActiveKey] = useState<DemoDJSubProfileKey>(() =>
    pickFirstIncomplete(initial?.subProfiles) ?? "general",
  );

  function updateSubProfile<K extends keyof DemoDJSubProfile>(
    key: DemoDJSubProfileKey,
    field: K,
    value: DemoDJSubProfile[K],
  ) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function setFeaturedPhoto(key: DemoDJSubProfileKey, dataUrl: string | undefined) {
    updateSubProfile(key, "featuredPhotoDataUrl", dataUrl);
  }

  function appendGalleryItems(key: DemoDJSubProfileKey, items: DemoDJMediaItem[]) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], gallery: [...prev[key].gallery, ...items] },
    }));
  }

  function removeGalleryItem(key: DemoDJSubProfileKey, id: string) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], gallery: prev[key].gallery.filter((g) => g.id !== id) },
    }));
  }

  function setGalleryCaption(key: DemoDJSubProfileKey, id: string, caption: string) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        gallery: prev[key].gallery.map((g) => (g.id === id ? { ...g, caption } : g)),
      },
    }));
  }

  function setGalleryItemDataUrl(
    key: DemoDJSubProfileKey,
    id: string,
    dataUrl: string,
  ) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        gallery: prev[key].gallery.map((g) =>
          g.id === id ? { ...g, dataUrl } : g,
        ),
      },
    }));
  }

  function toggleGalleryItemTag(
    key: DemoDJSubProfileKey,
    id: string,
    tag: DemoDJSubProfileKey,
  ) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        gallery: prev[key].gallery.map((g) => {
          if (g.id !== id) return g;
          const current = g.eventTags ?? [];
          const next = current.includes(tag)
            ? current.filter((t) => t !== tag)
            : [...current, tag];
          return { ...g, eventTags: next };
        }),
      },
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Computed completion                                                  */
  /* ------------------------------------------------------------------ */
  /** Non-general profiles reuse the general "Om mig" bio, so fall back to
   * it when scoring their completeness. */
  function effectiveSub(k: DemoDJSubProfileKey): DemoDJSubProfile {
    const sp = subProfiles[k];
    if (k === "general" || sp.bio?.trim()) return sp;
    return { ...sp, bio: subProfiles.general.bio };
  }

  const completion = useMemo(
    () =>
      SUB_PROFILE_KEYS.map((k) => {
        const sp = effectiveSub(k);
        return {
          key: k,
          textComplete: isSubProfileTextComplete(sp),
          mediaComplete: isSubProfileMediaComplete(sp),
          complete: isSubProfileComplete(sp),
          ratio: subProfileCompleteness(sp),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subProfiles],
  );
  const completedCount = completion.filter((c) => c.complete).length;
  const completionPct = Math.round((completedCount / SUB_PROFILE_KEYS.length) * 100);
  const overallRatio =
    completion.reduce((sum, c) => sum + c.ratio, 0) / SUB_PROFILE_KEYS.length;
  const allComplete = completedCount === SUB_PROFILE_KEYS.length;

  function nextIncompleteAfter(current: DemoDJSubProfileKey): DemoDJSubProfileKey | null {
    const idx = SUB_PROFILE_KEYS.indexOf(current);
    for (let i = 1; i <= SUB_PROFILE_KEYS.length; i++) {
      const next = SUB_PROFILE_KEYS[(idx + i) % SUB_PROFILE_KEYS.length]!;
      if (!isSubProfileComplete(subProfiles[next])) return next;
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Persistence                                                          */
  /* ------------------------------------------------------------------ */
  const selfSaveRef = useRef(false);

  useEffect(() => {
    const onUpdate = () => {
      if (selfSaveRef.current) { selfSaveRef.current = false; return; }
      const next = readDemoDJProfile();
      if (!next) return;
      if (next.stageName?.trim()) setStageName(next.stageName);
      if (next.bio?.trim()) setBio(next.bio);
      if (next.equipmentDescription?.trim()) setEquipment(next.equipmentDescription);
      if (next.setupSize?.trim()) setSetupSize(next.setupSize);
      if (next.eventTypes?.length) setSelectedEventTypes(next.eventTypes);
      setSubProfiles(mergeSubProfiles(next.subProfiles, next.bio));
    };
    window.addEventListener("demoDJProfile:update", onUpdate);
    return () => window.removeEventListener("demoDJProfile:update", onUpdate);
  }, []);

  /* Auto-save: debounce writes so every keystroke is persisted and the
     browsing views pick up the changes via the custom event. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      selfSaveRef.current = true;
      writeDemoDJProfile(buildPersistedProfile(readDemoDJProfile()));
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageName, bio, equipment, setupSize, travelRadius, priceFrom, priceOnRequest, selectedEventTypes, subProfiles]);

  function buildPersistedProfile(existing: DemoDJProfile | null): DemoDJProfile {
    return {
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      fullName: existing?.fullName ?? stageName,
      email: existing?.email ?? "",
      phone: existing?.phone,
      city: existing?.city ?? seed.base_location,
      country: existing?.country ?? "Denmark",
      stageName,
      bio,
      yearsExperience: existing?.yearsExperience ?? "",
      eventTypes: selectedEventTypes,
      equipmentOwned: existing?.equipmentOwned ?? true,
      equipmentPresets: existing?.equipmentPresets ?? [],
      equipmentDescription: equipment,
      setupSize,
      eventsPerformed: existing?.eventsPerformed ?? "",
      notableClients: existing?.notableClients ?? "",
      profilePhotoDataUrl: existing?.profilePhotoDataUrl,
      equipmentPhotoDataUrls: existing?.equipmentPhotoDataUrls,
      subProfiles,
    };
  }

  function handleSaveAll() {
    writeDemoDJProfile(buildPersistedProfile(readDemoDJProfile()));
    toast.success("Profil gemt");
  }

  function handleSaveSubProfile(current: DemoDJSubProfileKey) {
    if (!isSubProfileTextComplete(effectiveSub(current))) {
      toast.error("Udfyld alle tekstfelter for denne underprofil");
      return;
    }
    writeDemoDJProfile(buildPersistedProfile(readDemoDJProfile()));
    const next = nextIncompleteAfter(current);
    if (next) {
      const fromLabel = SUB_PROFILE_META[current].label;
      const nextLabel = SUB_PROFILE_META[next].label;
      toast.success(`${fromLabel} gemt · fortsætter til ${nextLabel}`);
      setActiveKey(next);
    } else {
      toast.success("Alle fire underprofiler er udfyldt — det ser flot ud!");
    }
  }

  function toggleEventType(id: string) {
    setSelectedEventTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return {
    seed,
    /* account-wide */
    stageName, setStageName,
    bio, setBio,
    equipment, setEquipment,
    setupSize, setSetupSize,
    travelRadius, setTravelRadius,
    priceFrom, setPriceFrom,
    priceOnRequest, setPriceOnRequest,
    selectedEventTypes, toggleEventType,
    profilePhotoUrl,
    equipmentPhotoUrls,
    /* sub-profiles */
    subProfiles,
    activeKey, setActiveKey,
    updateSubProfile,
    setFeaturedPhoto,
    appendGalleryItems,
    removeGalleryItem,
    setGalleryCaption,
    setGalleryItemDataUrl,
    toggleGalleryItemTag,
    /* completion */
    completion,
    completedCount,
    completionPct,
    overallRatio,
    allComplete,
    /* actions */
    handleSaveAll,
    handleSaveSubProfile,
  };
}

export type DJProfileEditorState = ReturnType<typeof useDJProfileEditor>;

/* -------------------------------------------------------------------- */
/* Helpers                                                                */
/* -------------------------------------------------------------------- */

function buildEquipmentDescriptionFromPresets(presets: string[] | undefined): string {
  if (!presets?.length) return "";
  return presets.join(", ");
}

function mergeSubProfiles(
  existing: DemoDJProfile["subProfiles"] | undefined,
  defaultBio: string | undefined,
): Record<DemoDJSubProfileKey, DemoDJSubProfile> {
  const out = {} as Record<DemoDJSubProfileKey, DemoDJSubProfile>;
  for (const k of SUB_PROFILE_KEYS) {
    const existingForKey = existing?.[k];
    if (existingForKey) {
      out[k] = { ...existingForKey, gallery: existingForKey.gallery ?? [] };
    } else if (k === "general" && defaultBio?.trim()) {
      out[k] = { ...emptySubProfile(), bio: defaultBio.trim() };
    } else {
      out[k] = emptySubProfile();
    }
  }
  return out;
}

function pickFirstIncomplete(
  existing: DemoDJProfile["subProfiles"] | undefined,
): DemoDJSubProfileKey | null {
  for (const k of SUB_PROFILE_KEYS) {
    if (!isSubProfileComplete(existing?.[k])) return k;
  }
  return null;
}
