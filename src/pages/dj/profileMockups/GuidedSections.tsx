import { useState } from "react";
import {
  Camera, ChevronDown, Eye, EyeOff, Handshake, Sparkles, Tag,
  Wallet, MapPin, Speaker, Check, AlertCircle, Circle,
  ExternalLink, Info, Plus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventTypeTabs } from "./shared/EventTypeTabs";
import { DesktopMobilePreview } from "./shared/DesktopMobilePreview";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { DottedUploadSlot } from "./shared/DottedUploadSlot";
import { ChipMultiSelect } from "./shared/ChipMultiSelect";
import { CompletionBars } from "./shared/CompletionBars";
import { useMockupState } from "./shared/useMockupState";
import {
  MOCKUP_SUB_PROFILE_META,
  type MockupSubProfileKey,
} from "./shared/types";

type SectionStatus = "complete" | "needs-attention" | "empty";

type SectionDef = {
  id: string;
  label: string;
  /** Whether section content is per-sub-profile or shared across the account. */
  scope: "sub-profile" | "shared";
  icon: React.ComponentType<{ className?: string }>;
};

const SECTIONS: SectionDef[] = [
  { id: "visuals", label: "Billeder & video", scope: "sub-profile", icon: Camera },
  { id: "voice", label: "Om mig", scope: "sub-profile", icon: Sparkles },
  { id: "sound", label: "Din tilgang til et event", scope: "sub-profile", icon: Handshake },
  { id: "services", label: "Særlige ydelser", scope: "sub-profile", icon: Tag },
  { id: "price", label: "Pakker & Pris", scope: "shared", icon: Wallet },
  { id: "equipment", label: "Mobildiskotek & udstyr", scope: "shared", icon: Speaker },
  { id: "availability", label: "Tilgængelighed & rejse", scope: "shared", icon: MapPin },
];

const SPECIAL_SERVICES_OPTIONS = [
  "Lys & stemningslys", "Trådløs mikrofon", "Røgmaskine", "Stemningsopsætning",
  "Konfettiskydere", "Karaoke", "Fotobooth", "DJ-assistent",
];

/** A mobildiskotek package the DJ offers, defined by guest range. */
type ProfilePackage = { included: string; photo?: string };

/** Guest-range label derived from a package's position and how many
 * packages the DJ has. With a single package it covers the full range. */
function packageGuestLabel(index: number, total: number): string {
  if (total <= 1) return "Op til 200 gæster";
  return index === 0 ? "Op til 95 gæster" : "96–200 gæster";
}

/**
 * Mockup 2 — Guided Sections.
 *
 * Layout: a single full-width column of collapsible accordion sections.
 * Each section is a "task" the DJ ticks off (visuals, voice, sound,
 * services, price, equipment, availability). A small status badge per
 * section (Done / Needs attention / Empty) lets the DJ scan progress.
 *
 * The right-hand preview is a *pin-able floating panel* — collapsed to
 * an icon by default, expanded on click. This gets the form room to
 * breathe on tablets and narrower laptops, while keeping the preview
 * one click away.
 */
export function GuidedSectionsMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];

  /** Track which sections are currently expanded. The first incomplete
   * section auto-expands on mount; the DJ can open / close any of them
   * after that. */
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(["visuals"]));
  const [previewOpen, setPreviewOpen] = useState(true);

  /** Shared pricing: one hourly rate + up to 2 guest-range packages. */
  const [hourlyRate, setHourlyRate] = useState("");
  const [packages, setPackages] = useState<ProfilePackage[]>([
    { included: "" },
    { included: "" },
  ]);

  function setPackageField(
    index: number,
    field: keyof ProfilePackage,
    value: string | undefined,
  ) {
    setPackages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }
  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }
  function addPackage() {
    setPackages((prev) => (prev.length >= 2 ? prev : [...prev, { included: "" }]));
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Compute a section status from current sub-profile content. */
  function statusFor(id: string): SectionStatus {
    if (id === "visuals") {
      if (sub.featuredPhotoDataUrl && sub.gallery.length >= 3) return "complete";
      if (sub.featuredPhotoDataUrl || sub.gallery.length > 0) return "needs-attention";
      return "empty";
    }
    if (id === "voice") {
      if (sub.bio.length >= 80) return "complete";
      if (sub.bio) return "needs-attention";
      return "empty";
    }
    if (id === "sound") return sub.approach ? "complete" : "empty";
    if (id === "services") return sub.signatureTracks ? "complete" : "empty";
    if (id === "price") {
      const anyIncluded = packages.some((p) => p.included.trim());
      const allIncluded = packages.every((p) => p.included.trim());
      if (hourlyRate.trim() && allIncluded) return "complete";
      if (hourlyRate.trim() || anyIncluded) return "needs-attention";
      return "empty";
    }
    if (id === "equipment") return state.equipment ? "complete" : "empty";
    if (id === "availability") return state.travelRadius > 0 ? "complete" : "empty";
    return "empty";
  }

  return (
    <div
      className={cn(
        "relative max-w-[1400px] space-y-5 pb-24 transition-[padding] duration-200",
        previewOpen ? "lg:pr-[620px]" : "lg:pr-16",
      )}
    >
      <GuidedHeader state={state} />
      <EventTypeTabs active={activeKey} onChange={setActiveKey} />

      <CompletionBars
        entries={completionEntries}
        activeKey={activeKey}
        onJump={setActiveKey}
        subheading="Klik på en profil for at skifte. Hvert afsnit nedenfor er specifikt for den aktive profil, medmindre andet er angivet."
      />

      {/* Sections accordion */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const status = statusFor(section.id);
          const isOpen = openSections.has(section.id);
          return (
            <section
              key={section.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors",
                isOpen && "ring-1 ring-foreground/5",
              )}
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    status === "complete"
                      ? "bg-emerald-50 text-emerald-700"
                      : status === "needs-attention"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{section.label}</p>
                    {section.scope === "shared" && (
                      <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Delt
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {section.scope === "shared"
                      ? "Gemmes ét sted og bruges på alle dine sub-profiler."
                      : `Specifikt for din ${meta.tabLabel.toLowerCase()}.`}
                  </p>
                </div>
                <StatusBadge status={status} />
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-border/60 px-5 py-5">
                  {section.id === "price" ? (
                    <PackagesPricingSection
                      hourlyRate={hourlyRate}
                      onHourlyRateChange={setHourlyRate}
                      packages={packages}
                      onPackageFieldChange={setPackageField}
                      onAddPackage={addPackage}
                      onRemovePackage={removePackage}
                    />
                  ) : (
                    <SectionBody section={section} activeKey={activeKey} state={state} />
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Floating preview drawer (right side) */}
      <aside
        className={cn(
          "fixed inset-y-20 right-4 z-30 hidden flex-col rounded-2xl border bg-card shadow-xl transition-all lg:flex",
          previewOpen ? "w-[580px]" : "w-12",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
          {previewOpen && (
            <p className="flex-1 truncate text-xs font-semibold">
              Live forhåndsvisning · {meta.tabLabel}
            </p>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={previewOpen ? "Skjul forhåndsvisning" : "Vis forhåndsvisning"}
          >
            {previewOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {previewOpen && (
          <div className="flex-1 overflow-hidden p-3">
            <DesktopMobilePreview
              state={state}
              heading=""
              subheading=""
              className="border-none shadow-none"
              innerClassName="p-0"
              maxHeightClass="max-h-[calc(100vh-12rem)]"
            />
          </div>
        )}
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Section bodies                                                         */
/* -------------------------------------------------------------------- */

function SectionBody({
  section,
  activeKey,
  state,
}: {
  section: SectionDef;
  activeKey: MockupSubProfileKey;
  state: ReturnType<typeof useMockupState>["state"];
}) {
  const sub = state.subProfiles[activeKey];
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];

  switch (section.id) {
    case "visuals":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Hero-billede (forside)
            </Label>
            <DottedUploadSlot
              value={sub.featuredPhotoDataUrl}
              onChange={(v) => state.setFeaturedPhoto(activeKey, v)}
              hint="16:9 anbefales"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Galleri ({sub.gallery.length} / mindst 3)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {sub.gallery.slice(0, 3).map((g) => (
                <div key={g.id} className="aspect-square overflow-hidden rounded-md ring-1 ring-border">
                  {g.type === "video" ? (
                    <video src={g.dataUrl} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
              <DottedUploadSlot
                value={undefined}
                onChange={(next) => {
                  if (!next) return;
                  state.appendGalleryItems(activeKey, [
                    { id: `g-${Date.now()}`, type: "photo", dataUrl: next },
                  ]);
                }}
                hint="Tilføj"
                aspectClassName="aspect-square"
              />
            </div>
          </div>
        </div>
      );

    case "voice":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Længere profiltekst (min. 80 tegn)
              </Label>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {sub.bio.length} / 1500
              </span>
            </div>
            <Textarea
              value={sub.bio}
              onChange={(e) => state.updateSubProfile(activeKey, "bio", e.target.value)}
              rows={5}
              maxLength={1500}
              placeholder={`Fortæl kunderne hvorfor du er den rigtige DJ til et ${meta.noun.toLowerCase()}.`}
            />
          </div>
        </div>
      );

    case "sound":
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Din tilgang</Label>
          <Textarea
            value={sub.approach}
            onChange={(e) => state.updateSubProfile(activeKey, "approach", e.target.value)}
            rows={4}
            placeholder="Beskriv din tilgang til et event og hvordan du er i kontakt med kunderne — fx hvordan du planlægger sammen med kunden, kommunikerer op til dagen og aflæser stemningen undervejs."
          />
        </div>
      );

    case "services":
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Særlige ydelser</Label>
          <ChipMultiSelect
            value={sub.signatureTracks ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean) : []}
            options={SPECIAL_SERVICES_OPTIONS}
            onChange={(next) => state.updateSubProfile(activeKey, "signatureTracks", next.join(", "))}
            placeholder="Vælg ydelser inkluderet"
          />
        </div>
      );

    case "equipment":
      return (
        <div className="space-y-1.5">
          <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Disse oplysninger deles på alle dine sub-profiler — du har kun ét mobildiskotek.
          </p>
          <Label className="text-xs font-medium text-muted-foreground">Udstyrsbeskrivelse</Label>
          <Textarea
            value={state.equipment}
            onChange={(e) => state.setEquipment(e.target.value)}
            rows={4}
            placeholder="Beskriv dit setup — højtalere, lys, mikrofoner, backup …"
          />
        </div>
      );

    case "availability":
      return (
        <div className="space-y-1.5">
          <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Disse oplysninger deles på alle dine sub-profiler.
          </p>
          <Label className="text-xs font-medium text-muted-foreground">Rejseradius (km)</Label>
          <Input
            type="number"
            value={state.travelRadius || ""}
            onChange={(e) => state.setTravelRadius(Number(e.target.value) || 0)}
            placeholder="Hvor langt rejser du for et event?"
          />
        </div>
      );

    default:
      return null;
  }
}

function PackagesPricingSection({
  hourlyRate,
  onHourlyRateChange,
  packages,
  onPackageFieldChange,
  onAddPackage,
  onRemovePackage,
}: {
  hourlyRate: string;
  onHourlyRateChange: (value: string) => void;
  packages: ProfilePackage[];
  onPackageFieldChange: (
    index: number,
    field: keyof ProfilePackage,
    value: string | undefined,
  ) => void;
  onAddPackage: () => void;
  onRemovePackage: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Dine pakker og priser deles på alle dine profiler — du tilbyder det
        samme uanset eventtype.
      </p>

      {/* Shared hourly rate */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Generel timepris (DKK)
        </Label>
        <Input
          type="number"
          value={hourlyRate}
          onChange={(e) => onHourlyRateChange(e.target.value)}
          placeholder="fx 1.200"
        />
        <p className="text-[11px] text-muted-foreground">
          Din timepris gælder for alle dine pakker.
        </p>
      </div>

      {/* How packages work */}
      <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Vælger du kun én pakke, gælder den op til 200 gæster, når kunder
          søger efter DJs på platformen.
        </p>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Kunder kan altid anmode om en lavere eller højere pakke end den, deres
          gæsteantal ellers anbefaler.
        </p>
      </div>

      {/* Packages */}
      <div className="space-y-3">
        {packages.map((pkg, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">Pakke {index + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {packageGuestLabel(index, packages.length)}
                  </p>
                </div>
              </div>
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemovePackage(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Fjern
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Hvad er inkluderet?
              </Label>
              <Textarea
                value={pkg.included}
                onChange={(e) =>
                  onPackageFieldChange(index, "included", e.target.value)
                }
                rows={2}
                placeholder="fx Lydanlæg, basis-lys, trådløs mikrofon og DJ hele aftenen"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Foto af udstyret
              </Label>
              <DottedUploadSlot
                value={pkg.photo}
                onChange={(v) => onPackageFieldChange(index, "photo", v)}
                hint="Valgfrit, men stærkt anbefalet"
              />
            </div>
          </div>
        ))}

        {packages.length < 2 && (
          <button
            type="button"
            onClick={onAddPackage}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Tilføj pakke 2 (96–200 gæster)
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-3 w-3" /> Færdig
      </span>
    );
  }
  if (status === "needs-attention") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
        <AlertCircle className="h-3 w-3" /> Mangler
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Circle className="h-3 w-3" /> Tom
    </span>
  );
}

function GuidedHeader({
  state,
}: {
  state: ReturnType<typeof useMockupState>["state"];
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold">Rediger profil</h1>
        <p className="text-sm text-muted-foreground">
          Arbejd dig igennem hver sektion én efter én. Pinbar preview til højre.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AutosaveIndicator value={state.subProfiles} />
        <a
          href="/djs/alex-holm"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Åbn offentlig profil
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
