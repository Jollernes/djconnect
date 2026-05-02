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
    label: "General",
    eyebrow: "Shown to customers searching for any other event",
    helper:
      "This is the fallback profile used whenever a customer isn't searching for a wedding, birthday or corporate event. Keep it broad and confident.",
  },
  wedding: {
    label: "Wedding",
    eyebrow: "Shown to couples searching for wedding DJs",
    helper:
      "Couples want a DJ who reads multi-generational rooms. Talk about ceremony / dinner / dancefloor flow, requests, and how you handle key moments.",
  },
  birthday: {
    label: "Birthday",
    eyebrow: "Shown to customers booking a birthday party",
    helper:
      "Birthday hosts want energy. Highlight crowd-pleasers, milestone parties (30th, 40th, 50th), and how you keep the dancefloor moving.",
  },
  corporate: {
    label: "Corporate Event",
    eyebrow: "Shown to companies booking corporate events & parties",
    helper:
      "Corporate clients want professionalism. Talk about brand-appropriate music, tasteful volume control, and your experience with company parties.",
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

/** Returns true when every required field on a sub-profile has been filled in. */
export function isSubProfileComplete(sp: DemoDJSubProfile | undefined): boolean {
  if (!sp) return false;
  return Boolean(
    sp.tagline.trim() &&
      sp.bio.trim().length >= 80 &&
      sp.musicStyle.trim() &&
      sp.signatureTracks.trim() &&
      sp.approach.trim(),
  );
}

export function emptySubProfile(): DemoDJSubProfile {
  return {
    tagline: "",
    bio: "",
    musicStyle: "",
    signatureTracks: "",
    approach: "",
    priceFromMajor: 0,
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
