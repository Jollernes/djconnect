/** Editable per-event-type "story" packages shown on the DJ profile. */
export const DJ_EVENT_PACKAGES_KEY = "djconnect.dj.eventPackages.v1";

export type EventPackageKey = "standard" | "wedding" | "corporate";

/** The four content sections every event package shares. */
export const EVENT_PACKAGE_FIELDS = [
  { key: "goodParty", label: "Sådan skaber jeg en god fest" },
  { key: "typicalSetup", label: "Mit typiske setup" },
  { key: "party", label: "Til festen" },
  { key: "food", label: "Til mad (og festen)" },
] as const;

export type EventPackageField = (typeof EVENT_PACKAGE_FIELDS)[number]["key"];

export type EventPackage = {
  key: EventPackageKey;
  title: string;
  goodParty: string;
  typicalSetup: string;
  party: string;
  food: string;
};

export const DEFAULT_EVENT_PACKAGES: EventPackage[] = [
  {
    key: "standard",
    title: "Standard Pakke",
    goodParty:
      "Jeg læser stemningen i rummet og bygger aftenen op, så dansegulvet er fyldt fra første til sidste nummer.",
    typicalSetup:
      "Komplet lyd- og lysanlæg tilpasset lokalet, trådløs mikrofon og en flot DJ-booth.",
    party:
      "Musik på tværs af genrer og årtier — jeg mixer efter jeres ønsker og gæsternes energi hele aftenen.",
    food: "Rolig baggrundsmusik under maden, der lægger op til en hyggelig stemning inden dansen går i gang.",
  },
  {
    key: "wedding",
    title: "Bryllupspakke",
    goodParty:
      "Jeg sørger for, at jeres store dag flyder ubesværet — fra den første dans til det allersidste nummer.",
    typicalSetup:
      "Diskret opsætning der passer ind i rammerne, ekstra mikrofoner til taler og stemningsfuldt festlys.",
    party:
      "Jeres ønskeliste er i centrum, blandet med sikre gulvfyldere der får alle generationer med på dansegulvet.",
    food: "Stemningsfuld musik til middagen og klar, god lyd til taler, sange og indslag.",
  },
  {
    key: "corporate",
    title: "Firmafestpakke",
    goodParty:
      "Jeg skaber en professionel men festlig ramme, der løsner op og får kollegerne ud på gulvet.",
    typicalSetup:
      "Skalerbart lyd- og lysanlæg til alt fra receptioner til store firmafester, med mikrofon til taler.",
    party:
      "Bred musikprofil der rammer hele personalet — fra sikre klassikere til de nyeste hits.",
    food: "Afdæmpet lounge-musik under middagen, der understøtter networking og en god stemning.",
  },
];

type StoredPackage = Partial<EventPackage> & { key?: EventPackageKey };

export function loadEventPackages(): EventPackage[] {
  try {
    const raw = localStorage.getItem(DJ_EVENT_PACKAGES_KEY);
    if (!raw) return DEFAULT_EVENT_PACKAGES.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw) as StoredPackage[];
    if (!Array.isArray(parsed)) return DEFAULT_EVENT_PACKAGES.map((p) => ({ ...p }));
    return DEFAULT_EVENT_PACKAGES.map((base) => {
      const stored = parsed.find((p) => p.key === base.key);
      return stored ? { ...base, ...stored, key: base.key, title: base.title } : { ...base };
    });
  } catch {
    return DEFAULT_EVENT_PACKAGES.map((p) => ({ ...p }));
  }
}

export function saveEventPackages(packages: EventPackage[]): void {
  try {
    localStorage.setItem(DJ_EVENT_PACKAGES_KEY, JSON.stringify(packages));
  } catch {
    /* ignore */
  }
}
