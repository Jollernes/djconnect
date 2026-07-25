import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Check,
  Users,
  Trash2,
  Info,
  Wallet,
  Calculator,
  CalendarHeart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDJStandardSettings } from "@/hooks/useDJStandardSettings";
import { snapTo50 } from "@/lib/djStandardSettings";
import {
  CALC_HOURS,
  EVENT_TYPES,
  MAX_GUESTS,
  eventHourlyRate,
  fiveHourTotal,
  loadPricing,
  newId,
  savePricing,
  type AddonState,
  type EventTypeKey,
  type PricingState,
  type SetupState,
} from "@/lib/djPricing";

const fmt = (n: number) => `${n.toLocaleString("da-DK")} kr`;

/* -------------------------------------------------------------------- */
/* Page                                                                  */
/* -------------------------------------------------------------------- */

export function DJPricingEquipmentPage() {
  const { settings, setHourlyRate } = useDJStandardSettings();

  const [state, setState] = useState<PricingState>(() =>
    loadPricing(settings.hourlyRate),
  );

  /** Standard rate lives in the shared settings store; mirror it in here. */
  const pricing: PricingState = useMemo(
    () => ({ ...state, standardRate: settings.hourlyRate }),
    [state, settings.hourlyRate],
  );

  useEffect(() => {
    savePricing(pricing);
  }, [pricing]);

  /* Event types ----------------------------------------------------- */
  function toggleEvent(key: EventTypeKey) {
    setState((prev) => ({
      ...prev,
      eventTypes: {
        ...prev.eventTypes,
        [key]: { ...prev.eventTypes[key], active: !prev.eventTypes[key].active },
      },
    }));
  }
  function setEventRate(key: EventTypeKey, rate: string) {
    setState((prev) => ({
      ...prev,
      eventTypes: { ...prev.eventTypes, [key]: { ...prev.eventTypes[key], rate } },
    }));
  }

  /* Setups ---------------------------------------------------------- */
  function updateSetup(id: string, patch: Partial<SetupState>) {
    setState((prev) => ({
      ...prev,
      setups: prev.setups.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function addSetup() {
    setState((prev) =>
      prev.setups.length >= 3
        ? prev
        : {
            ...prev,
            setups: [
              ...prev.setups,
              { id: newId("setup"), capacity: "", price: "" },
            ],
          },
    );
  }
  function removeSetup(id: string) {
    setState((prev) =>
      prev.setups.length <= 1
        ? prev
        : { ...prev, setups: prev.setups.filter((s) => s.id !== id) },
    );
  }
  function setOver200(over200: boolean) {
    setState((prev) => ({ ...prev, over200 }));
  }

  /* Add-ons --------------------------------------------------------- */
  function updateAddon(id: string, patch: Partial<AddonState>) {
    setState((prev) => ({
      ...prev,
      addons: prev.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }
  function addAddon() {
    setState((prev) => ({
      ...prev,
      addons: [
        ...prev.addons,
        { id: newId("addon"), name: "", price: "", free: false },
      ],
    }));
  }
  function removeAddon(id: string) {
    setState((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.id !== id),
    }));
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">Priser & Udstyr</h1>
        <p className="text-sm text-muted-foreground">
          Vælg hvilke events du spiller til, sæt dine timepriser og opsætninger,
          og se hvad en fest koster. Rejseradius styres under{" "}
          <Link
            to="/dj/settings"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Indstillinger
          </Link>
          .
        </p>
      </div>

      <EventTypesSection
        pricing={pricing}
        standardRate={settings.hourlyRate}
        onStandardRate={setHourlyRate}
        onToggle={toggleEvent}
        onRate={setEventRate}
      />

      <SetupsSection
        setups={pricing.setups}
        over200={pricing.over200}
        onUpdate={updateSetup}
        onAdd={addSetup}
        onRemove={removeSetup}
        onOver200={setOver200}
      />

      <CalculatorSection pricing={pricing} />

      <AddonsSection
        addons={pricing.addons}
        onUpdate={updateAddon}
        onAdd={addAddon}
        onRemove={removeAddon}
      />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Section shell                                                         */
/* -------------------------------------------------------------------- */

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Toggle                                                                */
/* -------------------------------------------------------------------- */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-accent" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* -------------------------------------------------------------------- */
/* Event types + hourly rates                                            */
/* -------------------------------------------------------------------- */

function EventTypesSection({
  pricing,
  standardRate,
  onStandardRate,
  onToggle,
  onRate,
}: {
  pricing: PricingState;
  standardRate: string;
  onStandardRate: (v: string) => void;
  onToggle: (key: EventTypeKey) => void;
  onRate: (key: EventTypeKey, rate: string) => void;
}) {
  const std = Number(standardRate) || 0;

  return (
    <SectionCard
      icon={<CalendarHeart className="h-4 w-4" />}
      title="Eventtyper & timepriser"
      description="Aktivér de events du spiller til. Bryllup og firmafest kan have en højere timepris."
    >
      {/* Standard rate */}
      <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-medium">Standard timepris</Label>
          <p className="text-xs text-muted-foreground">
            Bruges til alle events medmindre du sætter en højere pris.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            step={50}
            min={0}
            value={standardRate}
            onChange={(e) => onStandardRate(e.target.value)}
            onBlur={(e) => onStandardRate(snapTo50(e.target.value))}
            placeholder="fx 1.200"
            className="w-32"
          />
          <span className="text-xs text-muted-foreground">DKK / time</span>
        </div>
      </div>

      <div className="space-y-2">
        {EVENT_TYPES.map((et) => {
          const st = pricing.eventTypes[et.key];
          const effective = eventHourlyRate(et.key, pricing);
          return (
            <div
              key={et.key}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors",
                st.active ? "bg-card" : "bg-muted/30 opacity-70",
              )}
            >
              <Toggle
                checked={st.active}
                onChange={() => onToggle(et.key)}
                label={`Aktivér ${et.label}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {et.label}
                </p>
                {!et.adjustable && (
                  <p className="text-[11px] text-muted-foreground">
                    Følger standard timepris
                  </p>
                )}
              </div>

              {et.adjustable ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    step={50}
                    min={0}
                    value={st.rate}
                    disabled={!st.active}
                    onChange={(e) => onRate(et.key, e.target.value)}
                    onBlur={(e) => onRate(et.key, snapTo50(e.target.value))}
                    placeholder={std > 0 ? String(std) : "Timepris"}
                    className="w-28"
                  />
                  <span className="text-xs text-muted-foreground">DKK/t</span>
                </div>
              ) : (
                <span className="inline-flex items-center rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
                  {std > 0 ? `${fmt(std)}/t` : "—"}
                </span>
              )}

              {et.adjustable && st.active && (
                <p className="w-full pl-12 text-[11px] text-muted-foreground sm:w-auto sm:pl-0">
                  Aktiv timepris: {fmt(effective)}/t
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------- */
/* Setups                                                                */
/* -------------------------------------------------------------------- */

function SetupsSection({
  setups,
  over200,
  onUpdate,
  onAdd,
  onRemove,
  onOver200,
}: {
  setups: SetupState[];
  over200: boolean;
  onUpdate: (id: string, patch: Partial<SetupState>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onOver200: (v: boolean) => void;
}) {
  return (
    <SectionCard
      icon={<Users className="h-4 w-4" />}
      title="Opsætninger"
      description="Angiv op til tre opsætninger — hvor mange gæster hver dækker (max 200) og hvad den koster."
    >
      <div className="space-y-3">
        {setups.map((s, i) => (
          <div key={s.id} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Opsætning {i + 1}</p>
              {setups.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Fjern
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Op til antal gæster
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={MAX_GUESTS}
                    value={s.capacity}
                    onChange={(e) => onUpdate(s.id, { capacity: e.target.value })}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n > MAX_GUESTS)
                        onUpdate(s.id, { capacity: String(MAX_GUESTS) });
                    }}
                    placeholder="fx 150"
                    className="w-28"
                  />
                  <span className="text-xs text-muted-foreground">
                    gæster (max {MAX_GUESTS})
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Pris for opsætning (DKK)
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    step={50}
                    min={0}
                    value={s.price}
                    onChange={(e) => onUpdate(s.id, { price: e.target.value })}
                    onBlur={(e) =>
                      onUpdate(s.id, { price: snapTo50(e.target.value) })
                    }
                    placeholder="fx 3.500"
                    className="w-32"
                  />
                  <span className="text-xs text-muted-foreground">DKK</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {setups.length < 3 && (
        <Button type="button" variant="outline" onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tilføj opsætning
        </Button>
      )}

      <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
        <Toggle
          checked={over200}
          onChange={onOver200}
          label="Jeg har udstyr til over 200 gæster"
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            Jeg har udstyr til over 200 gæster
          </p>
          <p className="text-[11px] text-muted-foreground">
            Til større events laver du et individuelt tilbud til kunden.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------- */
/* Calculator                                                            */
/* -------------------------------------------------------------------- */

function CalculatorSection({ pricing }: { pricing: PricingState }) {
  const activeEvents = EVENT_TYPES.filter((e) => pricing.eventTypes[e.key].active);
  const setups = pricing.setups;

  const firstEvent = activeEvents[0]?.key ?? null;
  const firstSetup = setups[0]?.id ?? null;
  const [selected, setSelected] = useState<{
    setupId: string;
    eventKey: EventTypeKey;
  } | null>(
    firstEvent && firstSetup
      ? { setupId: firstSetup, eventKey: firstEvent }
      : null,
  );

  // Keep selection valid when setups/events change.
  useEffect(() => {
    if (!selected) return;
    const stillValid =
      setups.some((s) => s.id === selected.setupId) &&
      activeEvents.some((e) => e.key === selected.eventKey);
    if (!stillValid) {
      setSelected(
        firstEvent && firstSetup
          ? { setupId: firstSetup, eventKey: firstEvent }
          : null,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing]);

  const selSetup = setups.find((s) => s.id === selected?.setupId) ?? null;
  const selRate = selected ? eventHourlyRate(selected.eventKey, pricing) : 0;

  if (activeEvents.length === 0) {
    return (
      <SectionCard
        icon={<Calculator className="h-4 w-4" />}
        title="Prisberegner"
        description={`Se hvad ${CALC_HOURS} timer koster for hver opsætning og eventtype.`}
      >
        <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Aktivér mindst én eventtype for at se beregninger.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={<Calculator className="h-4 w-4" />}
      title="Prisberegner"
      description={`Klik på en pris for at se hvad ${CALC_HOURS} timer koster pr. opsætning og eventtype.`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                Opsætning
              </th>
              {activeEvents.map((e) => (
                <th
                  key={e.key}
                  className="p-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {e.label}
                  <span className="block font-normal">
                    {fmt(eventHourlyRate(e.key, pricing))}/t
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {setups.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 align-middle">
                  <p className="text-xs font-semibold text-foreground">
                    {s.capacity ? `Op til ${s.capacity}` : `Opsætning ${i + 1}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Setup {s.price ? fmt(Number(s.price)) : "—"}
                  </p>
                </td>
                {activeEvents.map((e) => {
                  const rate = eventHourlyRate(e.key, pricing);
                  const total = fiveHourTotal(s.price, rate);
                  const isSel =
                    selected?.setupId === s.id && selected?.eventKey === e.key;
                  return (
                    <td key={e.key} className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected({ setupId: s.id, eventKey: e.key })
                        }
                        className={cn(
                          "w-full rounded-lg border px-2 py-2 text-sm font-semibold transition-colors",
                          isSel
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-transparent bg-muted/40 text-foreground hover:border-accent/40 hover:bg-accent/5",
                        )}
                      >
                        {fmt(total)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && selSetup && (
        <div className="space-y-1 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
          <p className="font-medium text-foreground">
            {CALC_HOURS} timer ·{" "}
            {EVENT_TYPES.find((e) => e.key === selected.eventKey)?.label} ·{" "}
            {selSetup.capacity
              ? `op til ${selSetup.capacity} gæster`
              : "opsætning"}
          </p>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Opsætning</span>
            <span>{fmt(Number(selSetup.price) || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              + Spilletid ({CALC_HOURS} t × {fmt(selRate)})
            </span>
            <span>{fmt(selRate * CALC_HOURS)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-accent/20 pt-1 font-semibold text-foreground">
            <span>Total for kunden</span>
            <span>{fmt(fiveHourTotal(selSetup.price, selRate))}</span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------- */
/* Add-ons (Tilvalg)                                                     */
/* -------------------------------------------------------------------- */

function AddonsSection({
  addons,
  onUpdate,
  onAdd,
  onRemove,
}: {
  addons: AddonState[];
  onUpdate: (id: string, patch: Partial<AddonState>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <SectionCard
      icon={<Wallet className="h-4 w-4" />}
      title="Tilvalg"
      description="Sæt priser på de tilvalg kunderne kan vælge til. Marker et tilvalg som gratis, hvis det er inkluderet."
    >
      <p className="flex items-start gap-1.5 rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        Lad prisen stå tom for de tilvalg du ikke tilbyder.
      </p>

      <div className="space-y-2">
        {addons.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
          >
            <Input
              value={a.name}
              onChange={(e) => onUpdate(a.id, { name: e.target.value })}
              placeholder="Navn på tilvalg"
              className="min-w-0 flex-1"
            />
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step={50}
                min={0}
                value={a.free ? "" : a.price}
                disabled={a.free}
                onChange={(e) => onUpdate(a.id, { price: e.target.value })}
                onBlur={(e) => onUpdate(a.id, { price: snapTo50(e.target.value) })}
                placeholder="Pris"
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">DKK</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdate(a.id, { free: !a.free })}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                a.free
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                  : "border-border text-muted-foreground hover:border-foreground/30",
              )}
            >
              {a.free ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              Gratis
            </button>
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              aria-label="Fjern tilvalg"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={onAdd} className="gap-1.5">
        <Plus className="h-4 w-4" /> Tilføj tilvalg
      </Button>
    </SectionCard>
  );
}
