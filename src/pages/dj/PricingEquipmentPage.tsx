import { useEffect, useState } from "react";
import {
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Info,
  Wallet,
  PackagePlus,
  Pencil,
  ImageOff,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DottedUploadSlot } from "./profileMockups/shared/DottedUploadSlot";
import { useDJStandardSettings } from "@/hooks/useDJStandardSettings";
import { snapTo50 } from "@/lib/djStandardSettings";
import {
  CAPACITY_OPTIONS,
  OPTIONAL_INCLUSIONS,
  emptySetup,
  fixedTags,
  loadSetups,
  saveSetups,
  type Setup,
} from "@/lib/djSetups";

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
  const { settings } = useDJStandardSettings();
  const [open, setOpen] = useState<Set<string>>(() => new Set(["setups"]));

  const [setups, setSetups] = useState<Setup[]>(
    () => loadSetups() ?? [emptySetup(settings.hourlyRate)],
  );

  useEffect(() => {
    saveSetups(setups);
  }, [setups]);

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
    setSetups((prev) =>
      prev.length >= 3 ? prev : [...prev, emptySetup(settings.hourlyRate)],
    );
  }

  function removeSetup(index: number) {
    setSetups((prev) => prev.filter((_, i) => i !== index));
  }

  function setSaved(index: number, saved: boolean) {
    setSetups((prev) =>
      prev.map((s, i) => (i === index ? { ...s, saved } : s)),
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Priser & Udstyr</h1>
        <p className="text-sm text-muted-foreground">
          Sæt dine mobildiskotek-opsætninger og dine tilkøb. Din timepris og
          rejseradius styres under{" "}
          <span className="font-medium text-foreground">Indstillinger</span>.
        </p>
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
          setups={setups}
          onUpdateSetup={updateSetup}
          onToggleExtra={toggleExtra}
          onAddSetup={addSetup}
          onRemoveSetup={removeSetup}
          onSetSaved={setSaved}
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
  setups,
  onUpdateSetup,
  onToggleExtra,
  onAddSetup,
  onRemoveSetup,
  onSetSaved,
}: {
  setups: Setup[];
  onUpdateSetup: <K extends keyof Setup>(
    index: number,
    field: K,
    value: Setup[K],
  ) => void;
  onToggleExtra: (index: number, extra: string) => void;
  onAddSetup: () => void;
  onRemoveSetup: (index: number) => void;
  onSetSaved: (index: number, saved: boolean) => void;
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
        {setups.map((setup, index) =>
          setup.saved ? (
            <SetupPreviewCard
              key={index}
              setup={setup}
              index={index}
              onEdit={() => onSetSaved(index, false)}
              onRemove={
                setups.length > 1 ? () => onRemoveSetup(index) : undefined
              }
            />
          ) : (
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

            {/* Price + hourly rate */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Pakkepris (DKK)
                </Label>
                <Input
                  type="number"
                  step={50}
                  min={0}
                  value={setup.price}
                  onChange={(e) => onUpdateSetup(index, "price", e.target.value)}
                  onBlur={(e) =>
                    onUpdateSetup(index, "price", snapTo50(e.target.value))
                  }
                  placeholder="fx 3.500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Timepris (DKK)
                </Label>
                <Input
                  type="number"
                  step={50}
                  min={0}
                  value={setup.hourlyRate}
                  onChange={(e) =>
                    onUpdateSetup(index, "hourlyRate", e.target.value)
                  }
                  onBlur={(e) =>
                    onUpdateSetup(index, "hourlyRate", snapTo50(e.target.value))
                  }
                  placeholder="fx 1.200"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Angives i intervaller af 50 kr. Timeprisen er udfyldt med din
              standard-timepris fra Indstillinger, men kan rettes for denne
              opsætning. Pakkeprisen lægges oveni prisen for spilletid (timepris
              × antal timer).
            </p>

            <PriceExample
              hourlyRate={setup.hourlyRate}
              packagePrice={setup.price}
            />

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

            {/* Live preview */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Forhåndsvisning af pakken
              </p>
              <SetupPreviewCard setup={setup} index={index} />
            </div>

            {/* Save */}
            <div className="flex justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                onClick={() => onSetSaved(index, true)}
                disabled={!setup.price.trim()}
                className="gap-1.5"
              >
                <Check className="h-4 w-4" /> Gem opsætning
              </Button>
            </div>
          </div>
          ),
        )}

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
/* Setup preview card (live preview + saved view)                        */
/* -------------------------------------------------------------------- */

function SetupPreviewCard({
  setup,
  index,
  onEdit,
  onRemove,
}: {
  setup: Setup;
  index: number;
  /** When provided the card is shown in its saved state with edit/remove. */
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  const saved = Boolean(onEdit);
  const fmt = (v: string) =>
    v.trim() === "" ? "—" : `${Number(v).toLocaleString("da-DK")} kr`;
  const inclusions = [...fixedTags(setup.capacity), ...setup.extras];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        saved && "ring-1 ring-emerald-500/30",
      )}
    >
      {setup.photo ? (
        <img
          src={setup.photo}
          alt=""
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-full items-center justify-center gap-1.5 bg-muted text-xs text-muted-foreground">
          <ImageOff className="h-4 w-4" /> Intet foto endnu
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Opsætning {index + 1}</p>
              {saved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <Check className="h-3 w-3" /> Gemt
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <Users className="h-3.5 w-3.5" /> Op til {setup.capacity} gæster
            </span>
          </div>
          {saved && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" /> Rediger
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Fjern
                </button>
              )}
            </div>
          )}
        </div>

        {setup.description.trim() && (
          <p className="text-sm text-muted-foreground">{setup.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {inclusions.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
            >
              <Check className="h-3 w-3" /> {item}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border/60 pt-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Pakkepris </span>
            <span className="font-semibold text-foreground">
              {fmt(setup.price)}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Timepris </span>
            <span className="font-semibold text-foreground">
              {fmt(setup.hourlyRate)}
              {setup.hourlyRate.trim() && (
                <span className="font-normal text-muted-foreground">/t</span>
              )}
            </span>
          </div>
        </div>

        <PriceExample
          hourlyRate={setup.hourlyRate}
          packagePrice={setup.price}
        />
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
