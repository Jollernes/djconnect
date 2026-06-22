import { useState } from "react";
import {
  Plus,
  Check,
  Users,
  Pencil,
  Copy,
  Trash2,
  X,
  ChevronRight,
  ImageOff,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DottedUploadSlot } from "../profileMockups/shared/DottedUploadSlot";

/* -------------------------------------------------------------------- */
/* Mock data model                                                       */
/* -------------------------------------------------------------------- */

const STANDARD_HOURLY_RATE = "1200";

const EVENT_TAGS = [
  "Alle events",
  "Bryllup",
  "Firmafest",
  "Ungdomsfest",
] as const;
type EventTag = (typeof EVENT_TAGS)[number];

const CAPACITIES = ["80", "150", "200"] as const;
type Capacity = (typeof CAPACITIES)[number];

const OPTIONAL_EXTRAS = [
  "Tidlig opsætning",
  "Trådløs mikrofon",
  "Festbelysning ekstra",
  "Røgmaskine",
];

function fixedIncludes(capacity: Capacity): string[] {
  return [
    `Lyd & lys op til ${capacity} gæster`,
    "Opsætning af udstyr",
    "Nedtagning af udstyr",
    "Transport",
  ];
}

type MockSetup = {
  id: string;
  eventTag: EventTag;
  capacity: Capacity;
  description: string;
  extras: string[];
  price: string;
  hourlyRate: string;
  photo?: string;
};

const SAMPLE_SETUPS: MockSetup[] = [
  {
    id: "s1",
    eventTag: "Alle events",
    capacity: "80",
    description: "Kompakt anlæg med basis-lys — perfekt til mindre fester.",
    extras: ["Trådløs mikrofon"],
    price: "3000",
    hourlyRate: STANDARD_HOURLY_RATE,
    photo:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s2",
    eventTag: "Alle events",
    capacity: "150",
    description: "Kraftigere anlæg og festbelysning til den store fest.",
    extras: ["Trådløs mikrofon", "Festbelysning ekstra"],
    price: "4500",
    hourlyRate: STANDARD_HOURLY_RATE,
    photo:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "s3",
    eventTag: "Bryllup",
    capacity: "150",
    description:
      "Stemningsfuld opsætning til bryllup — ceremoni-lyd og dæmpet lys.",
    extras: ["Tidlig opsætning", "Trådløs mikrofon"],
    price: "5500",
    hourlyRate: STANDARD_HOURLY_RATE,
    photo:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800&auto=format&fit=crop",
  },
];

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function newSetup(): MockSetup {
  return {
    id: uid("new"),
    eventTag: "Alle events",
    capacity: "80",
    description: "",
    extras: [],
    price: "",
    hourlyRate: STANDARD_HOURLY_RATE,
  };
}

/* -------------------------------------------------------------------- */
/* Page                                                                  */
/* -------------------------------------------------------------------- */

/**
 * Mockup — a simplified, less chaotic setups page.
 *
 * Key simplifications vs. the current page:
 *  1. ONE unified list (no separate wedding section). Each setup carries an
 *     event tag (Alle events / Bryllup / …). A wedding variant is just a
 *     duplicate tagged "Bryllup" — same list, no parallel concept.
 *  2. Overview-first: setups are shown as clean cards in a grid; the page is
 *     mostly an overview, not a wall of forms.
 *  3. Editing happens in a focused side panel (one setup at a time), split
 *     into clear steps (Størrelse → Indhold → Pris → Foto).
 */
export function SimplifiedSetupsMockup() {
  const [setups, setSetups] = useState<MockSetup[]>(SAMPLE_SETUPS);
  const [editing, setEditing] = useState<MockSetup | null>(null);
  /** Whether the panel is creating a brand-new setup (vs. editing one). */
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing(newSetup());
    setIsNew(true);
  }

  function openEdit(setup: MockSetup) {
    setEditing({ ...setup });
    setIsNew(false);
  }

  function duplicateToWedding(setup: MockSetup) {
    setSetups((prev) => [
      ...prev,
      { ...setup, id: uid("dup"), eventTag: "Bryllup", photo: undefined },
    ]);
  }

  function removeSetup(id: string) {
    setSetups((prev) => prev.filter((s) => s.id !== id));
  }

  function saveEditing() {
    if (!editing) return;
    setSetups((prev) => {
      const exists = prev.some((s) => s.id === editing.id);
      return exists
        ? prev.map((s) => (s.id === editing.id ? editing : s))
        : [...prev, editing];
    });
    setEditing(null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Opsætninger</h1>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              Forsimplet visning · mockup
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Dine mobildiskotek-opsætninger samlet ét sted. Tilføj en
            event-version (fx bryllup) med ét klik.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          Din timepris:{" "}
          <span className="font-semibold text-foreground">
            {Number(STANDARD_HOURLY_RATE).toLocaleString("da-DK")} kr/t
          </span>
        </span>
      </div>

      {/* How it works */}
      <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p>
          <span className="font-medium text-foreground">Sådan virker det:</span>{" "}
          Opret én opsætning ad gangen i et fokuseret panel. Vil du have en
          bryllups-version, så tryk{" "}
          <span className="font-medium text-foreground">Dupliker til bryllup</span>{" "}
          på et kort og tilpas tekst, pris og billede.
        </p>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {setups.map((setup, index) => (
          <SetupCard
            key={setup.id}
            setup={setup}
            index={index}
            onEdit={() => openEdit(setup)}
            onDuplicate={() => duplicateToWedding(setup)}
            onRemove={() => removeSetup(setup.id)}
          />
        ))}

        <button
          type="button"
          onClick={openNew}
          className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/10 p-4 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:bg-accent/5 hover:text-foreground"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Plus className="h-5 w-5" />
          </span>
          Tilføj opsætning
        </button>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        Til events med over 200 gæster laver du et individuelt tilbud til kunden.
      </p>

      {/* Focused editor panel */}
      {editing && (
        <EditorPanel
          setup={editing}
          isNew={isNew}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={saveEditing}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Setup card (overview)                                                 */
/* -------------------------------------------------------------------- */

function SetupCard({
  setup,
  index,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  setup: MockSetup;
  index: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const pkg = Number(setup.price) || 0;
  const rate = Number(setup.hourlyRate) || 0;
  const total = pkg + rate * 5;
  const fmt = (n: number) => `${n.toLocaleString("da-DK")} kr`;
  const isWedding = setup.eventTag === "Bryllup";

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
        <span
          className={cn(
            "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
            isWedding
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-foreground backdrop-blur",
          )}
        >
          {setup.eventTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-sm font-semibold">Opsætning {index + 1}</p>
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
          {!isWedding && (
            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Copy className="h-3.5 w-3.5" /> Dupliker til bryllup
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Fjern"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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
  isNew,
  onChange,
  onClose,
  onSave,
}: {
  setup: MockSetup;
  isNew: boolean;
  onChange: (next: MockSetup) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function update<K extends keyof MockSetup>(field: K, value: MockSetup[K]) {
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
              {isNew ? "Ny opsætning" : "Rediger opsætning"}
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
          {/* Event target */}
          <Field step="1" label="Hvilke events passer den til?">
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TAGS.map((tag) => {
                const active = setup.eventTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => update("eventTag", tag)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? tag === "Bryllup"
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : "border-accent bg-accent/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Capacity */}
          <Field step="2" label="Størrelse — egnet til">
            <div className="grid grid-cols-3 gap-2">
              {CAPACITIES.map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => update("capacity", cap)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    setup.capacity === cap
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  Op til {cap}
                </button>
              ))}
            </div>
          </Field>

          {/* Content */}
          <Field step="3" label="Indhold">
            <div className="space-y-1.5 rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-[11px] font-medium text-foreground">
                Altid inkluderet:
              </p>
              <ul className="space-y-1">
                {fixedIncludes(setup.capacity).map((item) => (
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
              {OPTIONAL_EXTRAS.map((extra) => {
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
          <Field step="4" label="Pris">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Pakkepris (DKK)
                </Label>
                <Input
                  type="number"
                  step={50}
                  value={setup.price}
                  onChange={(e) => update("price", e.target.value)}
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
                  value={setup.hourlyRate}
                  onChange={(e) => update("hourlyRate", e.target.value)}
                  placeholder="fx 1.200"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Timeprisen er udfyldt fra din standard, men kan rettes her.
            </p>
          </Field>

          {/* Photo */}
          <Field step="5" label="Foto af opsætningen">
            <div className="w-40">
              <DottedUploadSlot
                value={setup.photo}
                onChange={(v) => update("photo", v)}
                aspectClassName="aspect-square"
              />
            </div>
            {setup.eventTag === "Bryllup" && (
              <p className="flex items-start gap-1.5 text-[11px] text-rose-600">
                <Copy className="mt-0.5 h-3 w-3 shrink-0" />
                Tip: vælg et billede der viser en bryllupskontekst.
              </p>
            )}
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

/* -------------------------------------------------------------------- */
/* Mini preview card                                                     */
/* -------------------------------------------------------------------- */

function MiniPreview({ setup }: { setup: MockSetup }) {
  const pkg = Number(setup.price) || 0;
  const rate = Number(setup.hourlyRate) || 0;
  const total = pkg + rate * 5;
  const fmt = (n: number) => `${n.toLocaleString("da-DK")} kr`;
  const isWedding = setup.eventTag === "Bryllup";

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
        <span
          className={cn(
            "absolute right-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
            isWedding
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-foreground backdrop-blur",
          )}
        >
          {setup.eventTag}
        </span>
      </div>
      <div className="space-y-2 p-3">
        {setup.description.trim() && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {setup.description}
          </p>
        )}
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
