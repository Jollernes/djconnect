import { useState } from "react";
import {
  Camera, ChevronDown, Eye, EyeOff, Handshake, Sparkles,
  Check, AlertCircle, Circle, ExternalLink, Crop, X, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventTypeTabs } from "./shared/EventTypeTabs";
import { DesktopMobilePreview } from "./shared/DesktopMobilePreview";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { DottedUploadSlot } from "./shared/DottedUploadSlot";
import { ImageCropModal } from "./shared/ImageCropModal";
import { CompletionBars } from "./shared/CompletionBars";
import { useMockupState } from "./shared/useMockupState";
import {
  MOCKUP_SUB_PROFILE_META,
  type MockupSubProfileKey,
} from "./shared/types";
import {
  PACKAGE_KEYS,
  PACKAGE_META,
  getSubProfilePackages,
  type DemoDJPackageKey,
  type DemoDJSubProfileKey,
} from "@/lib/demoDJProfile";

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
  { id: "packages", label: "Pakker", scope: "sub-profile", icon: Package },
];

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
    if (id === "packages") {
      const pkgs = getSubProfilePackages(sub);
      return PACKAGE_KEYS.some((k) => pkgs[k].enabled && pkgs[k].description.trim())
        ? "complete"
        : "empty";
    }
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
                  <SectionBody section={section} activeKey={activeKey} state={state} />
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

  const [adjustGalleryId, setAdjustGalleryId] = useState<string | null>(null);
  const adjustGallerySrc = sub.gallery.find((g) => g.id === adjustGalleryId)
    ?.dataUrl;

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
              cropAspect={16 / 9}
              cropPreviewVariant="hero"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Galleri ({sub.gallery.length} / mindst 3)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {sub.gallery.map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-border">
                    {g.type === "video" ? (
                      <video src={g.dataUrl} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <div className="absolute right-1 top-1 flex items-center gap-1">
                      {g.type !== "video" && (
                        <button
                          type="button"
                          onClick={() => setAdjustGalleryId(g.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border hover:bg-white"
                          aria-label="Tilpas billede"
                          title="Tilpas billede"
                        >
                          <Crop className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => state.removeGalleryItem(activeKey, g.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border hover:bg-white"
                        aria-label="Fjern"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {g.type !== "video" && (
                    <GalleryTagPicker
                      selected={g.eventTags ?? []}
                      onToggle={(tag) =>
                        state.toggleGalleryItemTag(activeKey, g.id, tag)
                      }
                    />
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
                cropAspect={1}
                cropPreviewVariant="gallery"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tag hvert billede med den festtype, det passer bedst til, så
              kunderne ser de mest relevante billeder.
            </p>
            <ImageCropModal
              open={adjustGalleryId !== null}
              src={adjustGallerySrc}
              aspect={1}
              previewVariant="gallery"
              onCancel={() => setAdjustGalleryId(null)}
              onConfirm={(cropped) => {
                if (adjustGalleryId)
                  state.setGalleryItemDataUrl(activeKey, adjustGalleryId, cropped);
                setAdjustGalleryId(null);
              }}
            />
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

    case "packages":
      return <PackagesSection activeKey={activeKey} state={state} />;

    default:
      return null;
  }
}

/** Per-sub-profile packages editor: three fixed packages (Festpakke,
 * Middag + Fest, Andet) the DJ can toggle on/off and describe. */
function PackagesSection({
  activeKey,
  state,
}: {
  activeKey: MockupSubProfileKey;
  state: ReturnType<typeof useMockupState>["state"];
}) {
  const sub = state.subProfiles[activeKey];
  const packages = getSubProfilePackages(sub);

  function updatePackage(key: DemoDJPackageKey, patch: Partial<{ description: string; enabled: boolean }>) {
    state.updateSubProfile(activeKey, "packages", {
      ...packages,
      [key]: { ...packages[key], ...patch },
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Vælg hvilke pakker du tilbyder til denne profil, og beskriv kort hvad hver pakke indeholder.
      </p>
      {PACKAGE_KEYS.map((key) => {
        const pkg = packages[key];
        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              pkg.enabled ? "border-border bg-card" : "border-dashed bg-muted/20",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">{PACKAGE_META[key].label}</p>
              </div>
              <button
                type="button"
                onClick={() => updatePackage(key, { enabled: !pkg.enabled })}
                aria-pressed={pkg.enabled}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  pkg.enabled ? "bg-accent" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    pkg.enabled ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
            {pkg.enabled && (
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Beskrivelse
                </Label>
                <Textarea
                  value={pkg.description}
                  onChange={(e) => updatePackage(key, { description: e.target.value })}
                  rows={3}
                  placeholder={`Hvad indeholder ${PACKAGE_META[key].label.toLowerCase()}? Fx varighed, lyd/lys, opsætning …`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Event types a gallery photo can be tagged with. "Generel" is
 * intentionally excluded — a tag only marks a photo as *specifically*
 * relevant for a named party type. */
const GALLERY_TAG_OPTIONS: { key: DemoDJSubProfileKey; label: string }[] = [
  { key: "wedding", label: "Bryllup" },
  { key: "corporate", label: "Firmafest" },
  { key: "birthday", label: "Fødselsdag" },
];

/** Row of toggle chips letting the DJ tag which party types a photo is
 * specifically relevant for (wedding / corporate / birthday). */
function GalleryTagPicker({
  selected,
  onToggle,
}: {
  selected: DemoDJSubProfileKey[];
  onToggle: (tag: DemoDJSubProfileKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {GALLERY_TAG_OPTIONS.map((opt) => {
        const active = selected.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onToggle(opt.key)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
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
