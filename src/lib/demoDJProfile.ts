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

export type DemoDJProfile = {
  /** ISO timestamp the profile was created. */
  createdAt: string;
  /** Account fields */
  fullName: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  /** Public DJ fields */
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
};

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
