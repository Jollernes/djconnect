import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Check,
  Users,
  Pencil,
  Copy,
  X,
  ChevronRight,
  ImageOff,
  Sparkles,
  Info,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
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
  type Capacity,
  type Setup,
} from "@/lib/djSetups";
import {
  EVENT_PACKAGE_FIELDS,
  loadEventPackages,
  saveEventPackages,
  type EventPackage,
} from "@/lib/djEventPackages";

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
/* Helpers                                                               */
/* -------------------------------------------------------------------- */

/** Fixed set of size-based setups, in display order. */
const CAPACITY_VALUES: Capacity[] = ["80", "150", "200"];

function capacityLabel(capacity: Capacity): string {
  return CAPACITY_OPTIONS.find((o) => o.value === capacity)?.label ??
    `Op til ${capacity} gæster`;
}

/**
 * Reconcile the persisted list into exactly one setup per capacity
 * (80 / 150 / 200), in order. Missing sizes are seeded as empty setups.
 */
function reconcileByCapacity(list: Setup[], hourlyRate: string): Setup[] {
  return CAPACITY_VALUES.map((cap) => {
    const found = list.find((s) => s.capacity === cap);
    if (found) return { ...found, capacity: cap, eventTag: "Alle events" };
    return { ...emptySetup(hourlyRate, "Alle events"), capacity: cap };
  });
}

const fmt = (n: number) => `${n.toLocaleString("da-DK")} kr`;

/* -------------------------------------------------------------------- */
/* Page                                                                  */
/* -------------------------------------------------------------------- */

/**
 * Priser & Udstyr — three fixed, size-based mobildiskotek setups.
 *
 *  1. Exactly three setups, one per guest capacity: op til 80, 150 and 200.
 *  2. Overview-first: the three sizes are shown as clean cards.
 *  3. A setup's content can be copied from one size to another.
 *  4. Editing happens in a focused side panel (one setup at a time).
 */
export function DJPricingEquipmentPage() {
  const { settings } = useDJStandardSettings();
  const standardRate = settings.hourlyRate;

  const [setups, setSetups] = useState<Setup[]>(() =>
    reconcileByCapacity(loadSetups(), ""),
  );
  const [editing, setEditing] = useState<Setup | null>(null);

  const [eventPackages, setEventPackages] = useState<EventPackage[]>(() =>
    loadEventPackages(),
  );
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(
    null,
  );

  const [addons, setAddons] = useState<Record<string, string>>(() =>
    Object.fromEntries(ADDON_OPTIONS.map((a) => [a, ""])),
  );

  useEffect(() => {
    saveSetups(setups);
  }, [setups]);

  useEffect(() => {
    saveEventPackages(eventPackages);
  }, [eventPackages]);

  function saveEditingPackage() {
    if (!editingPackage) return;
    setEventPackages((prev) =>
      prev.map((p) => (p.key === editingPackage.key ? editingPackage : p)),
    );
    setEditingPackage(null);
  }

  function openEdit(setup: Setup) {
    setEditing({ ...setup });
  }

  /** Copy the content of one size setup into another (keeps the target size). */
  function copyTo(from: Setup, targetCapacity: Capacity) {
    setSetups((prev) =>
      prev.map((s) =>
        s.capacity === targetCapacity
          ? {
              ...s,
              description: from.description,
              price: from.price,
              hourlyRate: from.hourlyRate,
              extras: [...from.extras],
              photo: from.photo,
            }
          : s,
      ),
    );
  }

  function saveEditing() {
    if (!editing) return;
    setSetups((prev) =>
      prev.map((s) => (s.capacity === editing.capacity ? editing : s)),
    );
    setEditing(null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Priser & Udstyr</h1>
          <p className="text-sm text-muted-foreground">
            Tre faste opsætninger efter eventstørrelse — op til 80, 150 og 200
            gæster. Din timepris og rejseradius styres under{" "}
            <Link
              to="/dj/settings"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Indstillinger
            </Link>
            .
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          Din timepris:{" "}
          {standardRate ? (
            <span className="font-semibold text-foreground">
              {Number(standardRate).toLocaleString("da-DK")} kr/t
            </span>
          ) : (
            <Link
              to="/dj/settings"
              className="font-medium text-accent underline underline-offset-2"
            >
              sæt i Indstillinger
            </Link>
          )}
        </span>
      </div>

      {/* How it works */}
      <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p>
          <span className="font-medium text-foreground">Sådan virker det:</span>{" "}
          Udfyld hver størrelse for sig. Har to størrelser samme indhold, så
          tryk{" "}
          <span className="font-medium text-foreground">Kopiér til</span> på et
          kort for at overføre indhold, pris og billede til en anden størrelse.
        </p>
      </div>

      {/* Overview — three fixed setups by guest capacity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Opsætninger efter antal gæster
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {setups.map((setup) => (
            <SetupCard
              key={setup.capacity}
              setup={setup}
              onEdit={() => openEdit(setup)}
              copyTargets={CAPACITY_VALUES.filter(
                (c) => c !== setup.capacity,
              )}
              onCopyTo={(target) => copyTo(setup, target)}
            />
          ))}
        </div>
      </section>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        Til events med over 200 gæster laver du et individuelt tilbud til
        kunden.
      </p>

      {/* Event Pakker */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Event Pakker
          </h2>
          <p className="text-xs text-muted-foreground">
            Fortæl kunderne hvordan du gør deres event til noget særligt —
            skræddersyet til hver type fest.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventPackages.map((pkg) => (
            <EventPackageCard
              key={pkg.key}
              pkg={pkg}
              onEdit={() => setEditingPackage({ ...pkg })}
            />
          ))}
        </div>
      </section>

      {/* Tilkøb */}
      <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Tilkøb</p>
            <p className="text-xs text-muted-foreground">
              Sæt priser på de tilkøb kunderne kan vælge til.
            </p>
          </div>
        </div>
        <AddonsSection
          addons={addons}
          onChange={(name, price) =>
            setAddons((prev) => ({ ...prev, [name]: price }))
          }
        />
      </section>

      {/* Focused editor panel */}
      {editing && (
        <EditorPanel
          setup={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={saveEditing}
        />
      )}

      {editingPackage && (
        <EventPackageEditor
          pkg={editingPackage}
          onChange={setEditingPackage}
          onClose={() => setEditingPackage(null)}
          onSave={saveEditingPackage}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Event package card + editor                                           */
/* -------------------------------------------------------------------- */

function EventPackageCard({
  pkg,
  onEdit,
}: {
  pkg: EventPackage;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{pkg.title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" /> Rediger
        </button>
      </div>
      <div className="space-y-3">
        {EVENT_PACKAGE_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
              {label}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {pkg[key].trim() || (
                <span className="italic">Ikke udfyldt endnu</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventPackageEditor({
  pkg,
  onChange,
  onClose,
  onSave,
}: {
  pkg: EventPackage;
  onChange: (next: EventPackage) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Luk"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Rediger — {pkg.title}</p>
            <p className="text-xs text-muted-foreground">
              Skræddersy teksterne til denne type event.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Luk"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {EVENT_PACKAGE_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-medium">{label}</Label>
              <Textarea
                value={pkg[key]}
                onChange={(e) => onChange({ ...pkg, [key]: e.target.value })}
                rows={3}
                placeholder={`Beskriv "${label.toLowerCase()}" for ${pkg.title.toLowerCase()}.`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuller
          </Button>
          <Button type="button" onClick={onSave} className="gap-1.5">
            <Check className="h-4 w-4" /> Gem pakke
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Setup card (overview)                                                 */
/* -------------------------------------------------------------------- */

function SetupCard({
  setup,
  onEdit,
  copyTargets,
  onCopyTo,
}: {
  setup: Setup;
  onEdit: () => void;
  copyTargets: Capacity[];
  onCopyTo: (target: Capacity) => void;
}) {
  const pkg = Number(setup.price) || 0;
  const rate = Number(setup.hourlyRate) || 0;
  const total = pkg + rate * 5;
  const [copyOpen, setCopyOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!copyOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCopyOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [copyOpen]);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {setup.photo ? (
          <img
            src={setup.photo}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">Intet foto endnu</span>
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <Users className="h-3.5 w-3.5 text-accent" /> Op til {setup.capacity}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-sm font-semibold">{capacityLabel(setup.capacity)}</p>
        {setup.description.trim() && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {setup.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Pakkepris
            </p>
            <p className="text-base font-semibold">{pkg > 0 ? fmt(pkg) : "—"}</p>
          </div>
          {total > 0 && (
            <p className="text-[11px] text-muted-foreground">
              5 t i alt {fmt(total)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1 border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" /> Rediger
          </button>
          <div className="relative ml-auto" ref={menuRef}>
            <button
              type="button"
              onClick={() => setCopyOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
            >
              <Copy className="h-3.5 w-3.5" /> Kopiér til
            </button>
            {copyOpen && (
              <div className="absolute bottom-full right-0 z-20 mb-1 w-44 overflow-hidden rounded-lg border bg-background shadow-lg">
                {copyTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => {
                      onCopyTo(target);
                      setCopyOpen(false);
                    }}
                    className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    <Users className="h-3.5 w-3.5 text-accent" />
                    {capacityLabel(target)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Focused editor panel (slide-over)                                     */
/* -------------------------------------------------------------------- */

function EditorPanel({
  setup,
  onChange,
  onClose,
  onSave,
}: {
  setup: Setup;
  onChange: (next: Setup) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function update<K extends keyof Setup>(field: K, value: Setup[K]) {
    onChange({ ...setup, [field]: value });
  }

  function toggleExtra(extra: string) {
    onChange({
      ...setup,
      extras: setup.extras.includes(extra)
        ? setup.extras.filter((e) => e !== extra)
        : [...setup.extras, extra],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Luk"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">
              Rediger — {capacityLabel(setup.capacity)}
            </p>
            <p className="text-xs text-muted-foreground">
              Udfyld trin for trin — du ser et live-kort nederst.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Luk"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {/* Capacity (fixed for this card) */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2.5">
            <Users className="h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm font-medium text-foreground">
              {capacityLabel(setup.capacity)}
            </p>
          </div>

          {/* Content */}
          <Field step="1" label="Indhold">
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
            <div className="flex flex-wrap gap-1.5">
              {OPTIONAL_INCLUSIONS.map((extra) => {
                const active = setup.extras.includes(extra);
                return (
                  <button
                    key={extra}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-foreground/30",
                    )}
                  >
                    {active ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {extra}
                  </button>
                );
              })}
            </div>
            <Textarea
              value={setup.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Kort beskrivelse — fx hvilket udstyr der er med."
            />
          </Field>

          {/* Price */}
          <Field step="2" label="Pris">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Pakkepris (DKK)
                </Label>
                <Input
                  type="number"
                  step={50}
                  min={0}
                  value={setup.price}
                  onChange={(e) => update("price", e.target.value)}
                  onBlur={(e) => update("price", snapTo50(e.target.value))}
                  placeholder="fx 3.500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Timepris (DKK)
                </Label>
                <Input
                  type="number"
                  step={50}
                  min={0}
                  value={setup.hourlyRate}
                  onChange={(e) => update("hourlyRate", e.target.value)}
                  onBlur={(e) => update("hourlyRate", snapTo50(e.target.value))}
                  placeholder="fx 1.200"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Angives i intervaller af 50 kr. Timeprisen er udfyldt fra din
              standard, men kan rettes her. Pakkeprisen lægges oveni prisen for
              spilletid (timepris × antal timer).
            </p>
            <PriceExample
              hourlyRate={setup.hourlyRate}
              packagePrice={setup.price}
            />
          </Field>

          {/* Photo */}
          <Field step="3" label="Foto af opsætningen">
            <div className="w-40">
              <DottedUploadSlot
                value={setup.photo}
                onChange={(v) => update("photo", v)}
                aspectClassName="aspect-square"
                cropAspect={1}
              />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Valgfrit, men stærkt anbefalet
            </p>
          </Field>

          {/* Live preview */}
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Sådan ser kortet ud
            </p>
            <MiniPreview setup={setup} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuller
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={!setup.price.trim()}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" /> Gem opsætning
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  step,
  label,
  children,
}: {
  step: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
          {step}
        </span>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="space-y-2 pl-7">{children}</div>
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

  return (
    <div className="space-y-1 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
      <p className="font-medium text-foreground">
        Eksempel · 5 timers spilletid
      </p>
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
/* Mini preview card                                                     */
/* -------------------------------------------------------------------- */

function MiniPreview({ setup }: { setup: Setup }) {
  const pkg = Number(setup.price) || 0;
  const rate = Number(setup.hourlyRate) || 0;
  const total = pkg + rate * 5;
  const inclusions = [...fixedTags(setup.capacity), ...setup.extras];

  return (
    <div className="w-full max-w-[260px] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {setup.photo ? (
          <img src={setup.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">Intet foto endnu</span>
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <Users className="h-3.5 w-3.5 text-accent" /> Op til {setup.capacity}
        </span>
      </div>
      <div className="space-y-2 p-3">
        {setup.description.trim() && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {setup.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {inclusions.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
            >
              <Check className="h-2.5 w-2.5" /> {item}
            </span>
          ))}
          {inclusions.length > 3 && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{inclusions.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between border-t border-border/60 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Pakkepris
            </p>
            <p className="text-base font-semibold">{pkg > 0 ? fmt(pkg) : "—"}</p>
          </div>
          {total > 0 && (
            <p className="text-[11px] text-muted-foreground">
              5 t i alt {fmt(total)}
            </p>
          )}
        </div>
        <p className="flex items-center gap-1 pt-0.5 text-[11px] font-medium text-accent">
          Klik for mere info <ChevronRight className="h-3 w-3" />
        </p>
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
