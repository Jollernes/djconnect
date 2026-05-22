import type { DemoDJSubProfileKey } from "@/lib/demoDJProfile";

/**
 * The three event-type sub-profiles shown across all redesign mockups.
 * The legacy "general" sub-profile is intentionally omitted from the
 * mockups — its content lives in the shared/account-wide block instead.
 */
export type MockupSubProfileKey = Exclude<DemoDJSubProfileKey, "general">;

export const MOCKUP_SUB_PROFILE_KEYS: MockupSubProfileKey[] = [
  "wedding",
  "birthday",
  "corporate",
];

export type MockupSubProfileMeta = {
  key: MockupSubProfileKey;
  label: string;
  /** Danish label used as the visible tab title in the mockups. */
  tabLabel: string;
  /** Short noun for body copy (e.g. "bryllup"). */
  noun: string;
  icon: "rings" | "cake" | "briefcase";
  /** Accent color for progress bars / pill backgrounds. */
  accent: "amber" | "rose" | "navy";
};

export const MOCKUP_SUB_PROFILE_META: Record<MockupSubProfileKey, MockupSubProfileMeta> = {
  wedding: {
    key: "wedding",
    label: "Wedding",
    tabLabel: "Bryllupsprofil",
    noun: "bryllup",
    icon: "rings",
    accent: "amber",
  },
  birthday: {
    key: "birthday",
    label: "Birthday",
    tabLabel: "Fødselsdagsprofil",
    noun: "fødselsdag",
    icon: "cake",
    accent: "rose",
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
