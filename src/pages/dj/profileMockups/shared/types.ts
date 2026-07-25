import type { DemoDJSubProfileKey } from "@/lib/demoDJProfile";

/**
 * The three profile types shown across all redesign mockups: a broad
 * "Generel" profile shown first, plus the wedding and corporate
 * event-type profiles.
 */
export type MockupSubProfileKey = Exclude<DemoDJSubProfileKey, "birthday">;

export const MOCKUP_SUB_PROFILE_KEYS: MockupSubProfileKey[] = [
  "general",
  "wedding",
  "corporate",
];

export type MockupSubProfileMeta = {
  key: MockupSubProfileKey;
  label: string;
  /** Danish label used as the visible tab title in the mockups. */
  tabLabel: string;
  /** Short noun for body copy (e.g. "bryllup"). */
  noun: string;
  icon: "rings" | "cake" | "briefcase" | "sparkles";
  /** Accent color for progress bars / pill backgrounds. */
  accent: "amber" | "rose" | "navy" | "indigo";
};

export const MOCKUP_SUB_PROFILE_META: Record<MockupSubProfileKey, MockupSubProfileMeta> = {
  general: {
    key: "general",
    label: "General",
    tabLabel: "Generel Profil",
    noun: "event",
    icon: "sparkles",
    accent: "indigo",
  },
  wedding: {
    key: "wedding",
    label: "Wedding",
    tabLabel: "Bryllupsprofil",
    noun: "bryllup",
    icon: "rings",
    accent: "amber",
  },
  corporate: {
    key: "corporate",
    label: "Corporate",
    tabLabel: "Firmaeventprofil",
    noun: "firmaevent",
    icon: "briefcase",
    accent: "navy",
  },
};
