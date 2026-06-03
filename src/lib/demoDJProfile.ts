/**
 * Local persistence for the "demo" DJ created when a user runs through the
 * `/signup/dj` onboarding flow without a real backend.
 *
 * Lets the DJ signup flow snapshot every input (stage name, bio, equipment,
 * photos, event types, …) and immediately render it back in the DJ
 * dashboard / profile editor so the user can see "their" profile straight
 * away. When Supabase is wired up, this module will be replaced by a real
 * `profiles` row + `dj_profiles` row.
 */

/** Per-event-type sub-profile that customers see based on what they're booking. */
export type DemoDJSubProfileKey = "general" | "wedding" | "birthday" | "corporate";

/** A single photo or video uploaded for a sub-profile gallery. */
export type DemoDJMediaItem = {
  id: string;
  type: "photo" | "video";
  /** Base64 data URL — survives a page reload, unlike `URL.createObjectURL`. */
  dataUrl: string;
  /** Optional caption shown to customers under the asset. */
  caption?: string;
};

export type DemoDJSubProfile = {
  /** Headline displayed at the top of the public profile for this event type. */
  tagline: string;
  /** Long-form bio framed for this event type. */
  bio: string;
  /** Music style summary (e.g. "House, disco, funk — high-energy peaks"). */
  musicStyle: string;
  /** Crowd-pleaser tracks the DJ is known for at this event type. */
  signatureTracks: string;
  /** Concrete approach / story so customers know what to expect. */
  approach: string;
  /** Optional starting price in major units (e.g. DKK). 0 = use account default. */
  priceFromMajor: number;
  /**
   * Hero photo shown on the DJ search-result card and at the top of the
   * public profile when a customer is searching for this event type. If
   * empty, the account-wide profile photo is used as a fallback.
   */
  featuredPhotoDataUrl?: string;
  /**
   * Gallery of photos / short videos that customers see on the public
   * profile. Each event type has its own gallery so a wedding DJ can lead
   * with wedding moments and a corporate DJ can show conference setups.
   */
  gallery: DemoDJMediaItem[];
};

export const SUB_PROFILE_KEYS: DemoDJSubProfileKey[] = [
  "general",
  "wedding",
  "birthday",
  "corporate",
];

export const SUB_PROFILE_META: Record<
  DemoDJSubProfileKey,
  { label: string; eyebrow: string; helper: string }
> = {
  general: {
    label: "Generel",
    eyebrow: "Vises til kunder, der søger efter ethvert andet event",
    helper:
      "Dette er standardprofilen, der bruges, når en kunde ikke søger efter et bryllup, en fødselsdag eller et firmaevent. Hold den bred og selvsikker.",
  },
  wedding: {
    label: "Bryllup",
    eyebrow: "Vises til par, der søger efter bryllups-DJs",
    helper:
      "Par vil have en DJ, der kan aflæse rum med flere generationer. Fortæl om flowet mellem ceremoni / middag / dansegulv, ønsker, og hvordan du håndterer de vigtige øjeblikke.",
  },
  birthday: {
    label: "Fødselsdag",
    eyebrow: "Vises til kunder, der booker en fødselsdagsfest",
    helper:
      "Fødselsdagsværter vil have energi. Fremhæv crowd-pleasers, mærkedagsfester (30-, 40-, 50-års) og hvordan du holder dansegulvet i gang.",
  },
  corporate: {
    label: "Firmaevent",
    eyebrow: "Vises til virksomheder, der booker firmaevents & fester",
    helper:
      "Erhvervskunder vil have professionalisme. Fortæl om brand-passende musik, smagfuld lydstyrkekontrol og din erfaring med firmafester.",
  },
};

export type DemoDJProfile = {
  /** ISO timestamp the profile was created. */
  createdAt: string;
  /** Account fields */
  fullName: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  /** Public DJ fields (shared across all sub-profiles) */
  stageName: string;
  bio: string;
  yearsExperience: string;
  eventTypes: string[];
  equipmentOwned: boolean;
  equipmentPresets: string[];
  equipmentDescription: string;
  setupSize: string;
  eventsPerformed: string;
  notableClients: string;
  /**
   * Persisted image data URLs (base64). Blob URLs created via
   * `URL.createObjectURL` don't survive a page reload, so the signup flow
   * converts uploads to data URLs before saving here.
   */
  profilePhotoDataUrl?: string;
  equipmentPhotoDataUrls?: string[];
  /**
   * Per-event-type sub-profiles. Customers see one of these depending on
   * what kind of event they're searching for. All four are optional at
   * signup time — the DJ fills them in after onboarding from the profile
   * editor (`/dj/profile`).
   */
  subProfiles?: Partial<Record<DemoDJSubProfileKey, DemoDJSubProfile>>;
};

/** Returns true when every required text field on a sub-profile has been filled in. */
export function isSubProfileTextComplete(sp: DemoDJSubProfile | undefined): boolean {
  if (!sp) return false;
  return Boolean(
    sp.tagline.trim() &&
      sp.bio.trim().length >= 80 &&
      sp.musicStyle.trim() &&
      sp.signatureTracks.trim() &&
      sp.approach.trim(),
  );
}

/** Returns true when the sub-profile has a featured photo and at least 3 gallery items. */
export function isSubProfileMediaComplete(sp: DemoDJSubProfile | undefined): boolean {
  if (!sp) return false;
  return Boolean(sp.featuredPhotoDataUrl) && (sp.gallery?.length ?? 0) >= 3;
}

/** Returns true when text + media are both complete. */
export function isSubProfileComplete(sp: DemoDJSubProfile | undefined): boolean {
  return isSubProfileTextComplete(sp) && isSubProfileMediaComplete(sp);
}

/**
 * 0–1 scalar measuring how close a sub-profile is to fully complete.
 * Five required text fields + featured photo + 3 gallery slots = 9 weighted checks.
 */
export function subProfileCompleteness(sp: DemoDJSubProfile | undefined): number {
  if (!sp) return 0;
  const checks: boolean[] = [
    sp.tagline.trim().length > 0,
    sp.bio.trim().length >= 80,
    sp.musicStyle.trim().length > 0,
    sp.signatureTracks.trim().length > 0,
    sp.approach.trim().length > 0,
    Boolean(sp.featuredPhotoDataUrl),
    (sp.gallery?.length ?? 0) >= 1,
    (sp.gallery?.length ?? 0) >= 2,
    (sp.gallery?.length ?? 0) >= 3,
  ];
  return checks.filter(Boolean).length / checks.length;
}

export function emptySubProfile(): DemoDJSubProfile {
  return {
    tagline: "",
    bio: "",
    musicStyle: "",
    signatureTracks: "",
    approach: "",
    priceFromMajor: 0,
    gallery: [],
  };
}

const STORAGE_KEY = "djconnect.demoDJProfile";

export function readDemoDJProfile(): DemoDJProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoDJProfile;
  } catch {
    return null;
  }
}

export function writeDemoDJProfile(profile: DemoDJProfile): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("demoDJProfile:update"));
  } catch {
    // ignore quota / privacy failures
  }
}

export function clearDemoDJProfile(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("demoDJProfile:update"));
  } catch {
    /* ignore */
  }
}

/**
 * Reads a `File`/`Blob` (or any object exposing `.file`) into a base64
 * data URL. Returns `null` on failure so callers can quietly skip.
 */
export function fileToDataUrl(file: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve(null);
      reader.onload = () => {
        const result = reader.result;
        resolve(typeof result === "string" ? result : null);
      };
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
}
