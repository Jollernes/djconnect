import { useState } from "react";
import {
  Camera, ChevronDown, Eye, EyeOff, Music, Sparkles, Tag,
  Wallet, MapPin, Speaker, Check, AlertCircle, Circle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventTypeTabs } from "./shared/EventTypeTabs";
import { DesktopMobilePreview } from "./shared/DesktopMobilePreview";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { MockupSwitcher } from "./shared/MockupSwitcher";
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
  scope: "sub-profile" | "shared";
  icon: React.ComponentType<{ className?: string }>;
};

const SECTIONS: SectionDef[] = [
  { id: "visuals", label: "Billeder & video", scope: "sub-profile", icon: Camera },
  { id: "voice", label: "Tagline & beskrivelse", scope: "sub-profile", icon: Sparkles },
  { id: "sound", label: "Musik & approach", scope: "sub-profile", icon: Music },
  { id: "services", label: "Særlige ydelser", scope: "sub-profile", icon: Tag },
  { id: "price", label: "Pris", scope: "sub-profile", icon: Wallet },
  { id: "equipment", label: "Mobildiskotek & udstyr", scope: "shared", icon: Speaker },
  { id: "availability", label: "Tilgængelighed & rejse", scope: "shared", icon: MapPin },
];

const MUSIC_STYLE_OPTIONS = [
  "Pop", "Dance", "R&B", "House", "Dansk hits", "Disco", "80'er", "90'er",
  "Latin", "Afrobeats", "Techno", "Schlager",
];
const SPECIAL_SERVICES_OPTIONS = [
  "Lys & stemningslys", "Trådløs mikrofon", "Røgmaskine", "Stemningsopsætning",
  "Konfettiskydere", "Karaoke", "Fotobooth", "DJ-assistent",
];

/**
 * Mockup 5 — Compact Guided Sections.
 *
 * Tighter variant of Mockup 2 with:
 * - Reduced vertical spacing between accordion rows
 * - Smaller icon containers and font sizes
 * - Narrower accordion padding
 * - Preview drawer with better-sized content
 * - Completion bars inline in header to save vertical space
 */
export function CompactGuidedSectionsMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];

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

  function statusFor(id: string): SectionStatus {
    if (id === "visuals") {
      if (sub.featuredPhotoDataUrl && sub.gallery.length >= 3) return "complete";
      if (sub.featuredPhotoDataUrl || sub.gallery.length > 0) return "needs-attention";
      return "empty";
    }
    if (id === "voice") {
      if (sub.tagline && sub.bio.length >= 80) return "complete";
      if (sub.tagline || sub.bio) return "needs-attention";
      return "empty";
    }
    if (id === "sound") {
      if (sub.musicStyle && sub.approach) return "complete";
      if (sub.musicStyle || sub.approach) return "needs-attention";
      return "empty";
    }
    if (id === "services") return sub.signatureTracks ? "complete" : "empty";
    if (id === "price") return sub.priceFromMajor > 0 ? "complete" : "empty";
    if (id === "equipment") return state.equipment ? "complete" : "empty";
    if (id === "availability") return state.travelRadius > 0 ? "complete" : "empty";
    return "empty";
  }

  return (
    <div
      className={cn(
        "relative max-w-[1300px] space-y-3 pb-20 transition-[padding] duration-200",
        previewOpen ? "lg:pr-[540px]" : "lg:pr-12",
      )}
    >
      <CompactGuidedHeader state={state} />
      <EventTypeTabs active={activeKey} onChange={setActiveKey} className="text-xs" />

      <CompletionBars
        entries={completionEntries}
        activeKey={activeKey}
        onJump={setActiveKey}
        heading="Profiler"
        subheading="Klik for at skifte. Sektionerne nedenfor er profil-specifikke."
      />

      {/* Sections accordion */}
      <div className="space-y-1.5">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const status = statusFor(section.id);
          const isOpen = openSections.has(section.id);
          return (
            <section
              key={section.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card shadow-sm transition-colors",
                isOpen && "ring-1 ring-foreground/5",
              )}
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/30"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md",
                    status === "complete"
                      ? "bg-emerald-50 text-emerald-700"
                      : status === "needs-attention"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold">{section.label}</p>
                    {section.scope === "shared" && (
                      <span className="rounded-full bg-muted/60 px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        Delt
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {section.scope === "shared"
                      ? "Deles på alle sub-profiler."
                      : `Specifikt for ${meta.tabLabel.toLowerCase()}.`}
                  </p>
                </div>
                <StatusBadge status={status} />
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-border/60 px-3 py-3">
                  <SectionBody section={section} activeKey={activeKey} state={state} />
                </div>
              )}
            </section>
          );
        })}
      </div>

      <MockupSwitcher />

      {/* Floating preview drawer */}
      <aside
        className={cn(
          "fixed inset-y-16 right-3 z-30 hidden flex-col rounded-xl border bg-card shadow-lg transition-all lg:flex",
          previewOpen ? "w-[520px]" : "w-10",
        )}
      >
        <div className="flex items-center justify-between gap-1.5 border-b border-border/60 px-2.5 py-1.5">
          {previewOpen && (
            <p className="flex-1 truncate text-[11px] font-semibold">
              Preview · {meta.tabLabel}
            </p>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={previewOpen ? "Skjul preview" : "Vis preview"}
          >
            {previewOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        </div>
        {previewOpen && (
          <div className="flex-1 overflow-hidden p-2">
            <DesktopMobilePreview
              state={state}
              heading=""
              subheading=""
              className="border-none shadow-none"
              innerClassName="p-0"
              maxHeightClass="max-h-[calc(100vh-10rem)]"
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
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Hero-billede
            </Label>
            <DottedUploadSlot
              value={sub.featuredPhotoDataUrl}
              onChange={(v) => state.setFeaturedPhoto(activeKey, v)}
              hint="16:9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Galleri ({sub.gallery.length} / 3+)
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
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
                hint="+"
                aspectClassName="aspect-square"
              />
            </div>
          </div>
        </div>
      );

    case "voice":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Tagline (80 tegn)
            </Label>
            <Input
              value={sub.tagline}
              onChange={(e) => state.updateSubProfile(activeKey, "tagline", e.target.value)}
              maxLength={80}
              placeholder={`Skab magiske øjeblikke til ${meta.noun.toLowerCase()}`}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Profiltekst (min. 80)
              </Label>
              <span className="text-[9px] tabular-nums text-muted-foreground">
                {sub.bio.length} / 1500
              </span>
            </div>
            <Textarea
              value={sub.bio}
              onChange={(e) => state.updateSubProfile(activeKey, "bio", e.target.value)}
              rows={3}
              maxLength={1500}
              placeholder={`Fortæl kunderne hvorfor du er den rigtige DJ til et ${meta.noun.toLowerCase()}.`}
              className="text-xs"
            />
          </div>
        </div>
      );

    case "sound":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Musikstilarter</Label>
            <ChipMultiSelect
              value={sub.musicStyle ? sub.musicStyle.split(",").map((s) => s.trim()).filter(Boolean) : []}
              options={MUSIC_STYLE_OPTIONS}
              onChange={(next) => state.updateSubProfile(activeKey, "musicStyle", next.join(", "))}
              placeholder="Vælg stilarter"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Din tilgang</Label>
            <Input
              value={sub.approach}
              onChange={(e) => state.updateSubProfile(activeKey, "approach", e.target.value)}
              placeholder="Hvordan kører du et event af denne type?"
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case "services":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">Særlige ydelser</Label>
          <ChipMultiSelect
            value={sub.signatureTracks ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean) : []}
            options={SPECIAL_SERVICES_OPTIONS}
            onChange={(next) => state.updateSubProfile(activeKey, "signatureTracks", next.join(", "))}
            placeholder="Vælg ydelser inkluderet"
          />
        </div>
      );

    case "price":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Startpris for {meta.noun.toLowerCase()} (DKK)
            </Label>
            <Input
              type="number"
              value={sub.priceFromMajor || ""}
              onChange={(e) =>
                state.updateSubProfile(activeKey, "priceFromMajor", Number(e.target.value) || 0)
              }
              placeholder="Lad stå tom for standardpris"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-end pb-1">
            <p className="text-[10px] text-muted-foreground">
              Standard: {state.priceFrom.toLocaleString("da-DK")} kr.
            </p>
          </div>
        </div>
      );

    case "equipment":
      return (
        <div className="space-y-1.5">
          <p className="rounded-md border border-dashed bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
            Deles på alle sub-profiler — ét mobildiskotek.
          </p>
          <Label className="text-[11px] font-medium text-muted-foreground">Udstyrsbeskrivelse</Label>
          <Textarea
            value={state.equipment}
            onChange={(e) => state.setEquipment(e.target.value)}
            rows={3}
            placeholder="Højtalere, lys, mikrofoner, backup …"
            className="text-xs"
          />
        </div>
      );

    case "availability":
      return (
        <div className="space-y-1.5">
          <p className="rounded-md border border-dashed bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
            Deles på alle sub-profiler.
          </p>
          <Label className="text-[11px] font-medium text-muted-foreground">Rejseradius (km)</Label>
          <Input
            type="number"
            value={state.travelRadius || ""}
            onChange={(e) => state.setTravelRadius(Number(e.target.value) || 0)}
            placeholder="Hvor langt rejser du?"
            className="h-8 text-xs"
          />
        </div>
      );

    default:
      return null;
  }
}

function StatusBadge({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-2.5 w-2.5" /> Færdig
      </span>
    );
  }
  if (status === "needs-attention") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-px text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
        <AlertCircle className="h-2.5 w-2.5" /> Mangler
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
      <Circle className="h-2.5 w-2.5" /> Tom
    </span>
  );
}

function CompactGuidedHeader({
  state,
}: {
  state: ReturnType<typeof useMockupState>["state"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup 5
        </p>
        <h1 className="text-lg font-semibold leading-tight">Compact Guided Sections</h1>
        <p className="text-xs text-muted-foreground">
          Tættere sektioner, mindre badges, kompakt preview-drawer.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AutosaveIndicator value={state.subProfiles} />
        <a
          href="/djs/alex-holm"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Åbn profil
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
