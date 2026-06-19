import { useState } from "react";
import {
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Info,
  Wallet,
  Settings2,
  PackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DottedUploadSlot } from "./profileMockups/shared/DottedUploadSlot";

/* -------------------------------------------------------------------- */
/* Mobildiskotek setups                                                  */
/* -------------------------------------------------------------------- */

type Capacity = "80" | "150" | "200";

const CAPACITY_OPTIONS: { value: Capacity; label: string }[] = [
  { value: "80", label: "Op til 80 gæster" },
  { value: "150", label: "Op til 150 gæster" },
  { value: "200", label: "Op til 200 gæster" },
];

/** Tags that are always included in every setup and cannot be toggled. */
function fixedTags(capacity: Capacity): string[] {
  return [
    `Lyd & lys op til ${capacity} gæster`,
    "Opsætning af udstyr",
    "Nedtagning af udstyr",
  ];
}

/** Optional extras the DJ can choose to include in the setup price. */
const OPTIONAL_INCLUSIONS = [
  "Tidlig opsætning af udstyret",
  "1 stk mikrofon (trådløs)",
  "1 stk mikrofon (ikke trådløs)",
  "Røgmaskine",
];

type Setup = {
  capacity: Capacity;
  description: string;
  price: string;
  extras: string[];
  photo?: string;
};

function emptySetup(): Setup {
  return { capacity: "80", description: "", price: "", extras: [] };
}

/* -------------------------------------------------------------------- */
/* Travel regions                                                        */
/* -------------------------------------------------------------------- */

const REGIONS = [
  "Region Hovedstaden",
  "Region Sjælland",
  "Region Syddanmark",
  "Region Midtjylland",
  "Region Nordjylland",
] as const;

/** Demo home region — registered during signup. */
const HOME_REGION = "Region Hovedstaden";

type RegionState = { active: boolean; price: string };

/* -------------------------------------------------------------------- */
/* Tilkøb (add-ons)                                                      */
/* -------------------------------------------------------------------- */

const ADDON_OPTIONS = [
  "Ekstra time",
  "Fotobooth",
  "Karaoke-anlæg",
  "Konfettiskydere",
  "Ekstra højtaler",
  "Uplights / stemningslys",
];

/* -------------------------------------------------------------------- */
/* Page                                                                  */
/* -------------------------------------------------------------------- */

export function DJPricingEquipmentPage() {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["standard"]));

  const [hourlyRate, setHourlyRate] = useState("");
  const [setups, setSetups] = useState<Setup[]>([emptySetup()]);

  const [regions, setRegions] = useState<Record<string, RegionState>>(() =>
    Object.fromEntries(
      REGIONS.map((r) => [
        r,
        { active: r === HOME_REGION, price: "" } as RegionState,
      ]),
    ),
  );

  const [addons, setAddons] = useState<Record<string, string>>(() =>
    Object.fromEntries(ADDON_OPTIONS.map((a) => [a, ""])),
  );

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateSetup<K extends keyof Setup>(
    index: number,
    field: K,
    value: Setup[K],
  ) {
    setSetups((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  function toggleExtra(index: number, extra: string) {
    setSetups((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              extras: s.extras.includes(extra)
                ? s.extras.filter((e) => e !== extra)
                : [...s.extras, extra],
            }
          : s,
      ),
    );
  }

  function addSetup() {
    setSetups((prev) => (prev.length >= 3 ? prev : [...prev, emptySetup()]));
  }

  function removeSetup(index: number) {
    setSetups((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Priser & Udstyr</h1>
        <p className="text-sm text-muted-foreground">
          Sæt dine mobildiskotek-opsætninger, din rejseradius og dine tilkøb ét
          samlet sted.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Settings2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Timepris & rejse</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Dine standard-indstillinger — gælder for alle opsætninger.
            </p>
          </div>
        </div>
        <StandardSettingsSection
          hourlyRate={hourlyRate}
          onHourlyRateChange={setHourlyRate}
          regions={regions}
          onRegionChange={(region, next) =>
            setRegions((prev) => ({ ...prev, [region]: next }))
          }
        />
      </div>

      <Accordion
        id="setups"
        icon={PackagePlus}
        title="Mobildiskotek-opsætninger"
        subtitle="Op til 3 opsætninger (størrelser) med pris og indhold."
        open={open.has("setups")}
        onToggle={() => toggle("setups")}
      >
        <SetupsSection
          hourlyRate={hourlyRate}
          setups={setups}
          onUpdateSetup={updateSetup}
          onToggleExtra={toggleExtra}
          onAddSetup={addSetup}
          onRemoveSetup={removeSetup}
        />
      </Accordion>

      <Accordion
        id="addons"
        icon={Wallet}
        title="Tilkøb"
        subtitle="Sæt priser på de tilkøb kunderne kan vælge til."
        open={open.has("addons")}
        onToggle={() => toggle("addons")}
      >
        <AddonsSection
          addons={addons}
          onChange={(name, price) =>
            setAddons((prev) => ({ ...prev, [name]: price }))
          }
        />
      </Accordion>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Accordion shell                                                       */
/* -------------------------------------------------------------------- */

function Accordion({
  icon: Icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors",
        open && "ring-1 ring-foreground/5",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border/60 px-5 py-5">{children}</div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Setups section                                                        */
/* -------------------------------------------------------------------- */

function SetupsSection({
  hourlyRate,
  setups,
  onUpdateSetup,
  onToggleExtra,
  onAddSetup,
  onRemoveSetup,
}: {
  hourlyRate: string;
  setups: Setup[];
  onUpdateSetup: <K extends keyof Setup>(
    index: number,
    field: K,
    value: Setup[K],
  ) => void;
  onToggleExtra: (index: number, extra: string) => void;
  onAddSetup: () => void;
  onRemoveSetup: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        En opsætning svarer til en mobildiskotek-størrelse. To opsætninger må
        gerne passe til samme antal gæster — fx hvis de inkluderer noget
        forskelligt og derfor har forskellige priser. Opsætningens pris lægges
        oveni din timepris.
      </p>

      {/* Over 200 guests note */}
      <p className="flex items-start gap-1.5 rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        Til events med over 200 gæster laver du et individuelt tilbud til
        kunden.
      </p>

      {/* Setups */}
      <div className="space-y-3">
        {setups.map((setup, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold">Opsætning {index + 1}</p>
              </div>
              {setups.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSetup(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Fjern
                </button>
              )}
            </div>

            {/* Guest capacity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Egnet til
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {CAPACITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateSetup(index, "capacity", opt.value)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                      setup.capacity === opt.value
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Kort beskrivelse af opsætningen
              </Label>
              <Textarea
                value={setup.description}
                onChange={(e) =>
                  onUpdateSetup(index, "description", e.target.value)
                }
                rows={2}
                placeholder="Beskriv opsætningen og hvilket udstyr der er inkluderet — fx lydanlæg, festbelysning og evt. andet."
              />
            </div>

            {/* Fixed (locked) tags */}
            <div className="space-y-1.5 rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-[11px] font-medium text-foreground">
                Altid inkluderet:
              </p>
              <ul className="space-y-1">
                {fixedTags(setup.capacity).map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Optional inclusions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Tilvalg du inkluderer i prisen
              </Label>
              <div className="flex flex-wrap gap-2">
                {OPTIONAL_INCLUSIONS.map((extra) => {
                  const active = setup.extras.includes(extra);
                  return (
                    <button
                      key={extra}
                      type="button"
                      onClick={() => onToggleExtra(index, extra)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                          : "border-border text-muted-foreground hover:border-foreground/30",
                      )}
                    >
                      {active ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      {extra}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Pakkepris (DKK)
              </Label>
              <Input
                type="number"
                value={setup.price}
                onChange={(e) => onUpdateSetup(index, "price", e.target.value)}
                placeholder="fx 3.500"
              />
              <p className="text-[11px] text-muted-foreground">
                Pakkeprisen lægges oveni prisen for spilletid (timepris × antal
                timer).
              </p>
            </div>

            <PriceExample hourlyRate={hourlyRate} packagePrice={setup.price} />

            {/* Photo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Foto af opsætningen
              </Label>
              <div className="w-40">
                <DottedUploadSlot
                  value={setup.photo}
                  onChange={(v) => onUpdateSetup(index, "photo", v)}
                  aspectClassName="h-24"
                />
              </div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Valgfrit, men stærkt anbefalet
              </p>
            </div>
          </div>
        ))}

        {setups.length < 3 && (
          <button
            type="button"
            onClick={onAddSetup}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Tilføj opsætning ({setups.length}/3)
          </button>
        )}
      </div>
    </div>
  );
}

/** Worked example for a 5-hour booking: package price + 5 × hourly rate. */
function PriceExample({
  hourlyRate,
  packagePrice,
}: {
  hourlyRate: string;
  packagePrice: string;
}) {
  const hours = 5;
  const rate = Number(hourlyRate) || 0;
  const pkg = Number(packagePrice) || 0;
  if (rate <= 0 && pkg <= 0) return null;

  const playtime = rate * hours;
  const total = playtime + pkg;
  const fmt = (n: number) => `${n.toLocaleString("da-DK")} kr`;

  return (
    <div className="space-y-1 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
      <p className="font-medium text-foreground">Eksempel · 5 timers spilletid</p>
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Pakkepris</span>
        <span>{fmt(pkg)}</span>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span>+ Spilletid (5 t × {fmt(rate)})</span>
        <span>{fmt(playtime)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-accent/20 pt-1 font-semibold text-foreground">
        <span>Total for kunden</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Standard settings: hourly rate + travel                               */
/* -------------------------------------------------------------------- */

function StandardSettingsSection({
  hourlyRate,
  onHourlyRateChange,
  regions,
  onRegionChange,
}: {
  hourlyRate: string;
  onHourlyRateChange: (value: string) => void;
  regions: Record<string, RegionState>;
  onRegionChange: (region: string, next: RegionState) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Din timepris og rejseradius er dine standard-indstillinger — de gælder
        på tværs af alle dine mobildiskotek-opsætninger.
      </p>

      {/* Hourly rate */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Timepris (DKK)
        </Label>
        <Input
          type="number"
          value={hourlyRate}
          onChange={(e) => onHourlyRateChange(e.target.value)}
          placeholder="fx 1.200"
        />
        <p className="text-[11px] text-muted-foreground">
          Timeprisen er grundprisen pr. times spilletid. Prisen på den valgte
          mobildiskotek-opsætning lægges oveni (timepris × antal timer +
          opsætningens pris).
        </p>
      </div>

      {/* Travel radius */}
      <div className="space-y-2 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-medium text-foreground">
            Rejseradius
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Pris pr. region · gælder hele regionen
          </span>
        </div>

        <div className="divide-y divide-border/60 rounded-xl border">
          {REGIONS.map((region) => {
            const state = regions[region];
            const isHome = region === HOME_REGION;
            return (
              <div
                key={region}
                className="flex items-center gap-2 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    onRegionChange(region, { ...state, active: !state.active })
                  }
                  aria-pressed={state.active}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    state.active
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-transparent hover:border-foreground/30",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 truncate text-sm text-foreground">
                  {region}
                  {isHome && (
                    <span className="ml-1.5 text-[10px] font-medium text-accent">
                      · hjemsted
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={state.price}
                    onChange={(e) =>
                      onRegionChange(region, { ...state, price: e.target.value })
                    }
                    disabled={!state.active}
                    placeholder="—"
                    className="h-8 w-24 text-right disabled:opacity-40"
                  />
                  <span className="text-[11px] text-muted-foreground">kr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Add-ons section                                                       */
/* -------------------------------------------------------------------- */

function AddonsSection({
  addons,
  onChange,
}: {
  addons: Record<string, string>;
  onChange: (name: string, price: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Sæt en pris på de tilkøb kunderne kan vælge til ud over en opsætning.
        Lad feltet stå tomt for de tilkøb du ikke tilbyder. Listen af tilkøb
        udvides senere.
      </p>

      <div className="space-y-2">
        {ADDON_OPTIONS.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 rounded-xl border p-3"
          >
            <span className="text-sm font-medium text-foreground">{name}</span>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={addons[name]}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder="Pris"
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">DKK</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
