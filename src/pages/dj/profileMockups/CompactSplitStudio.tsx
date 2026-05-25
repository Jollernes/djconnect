import { useMemo, useState } from "react";
import { ExternalLink, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EventTypeTabs } from "./shared/EventTypeTabs";
import { CompletionBars } from "./shared/CompletionBars";
import { DottedUploadSlot } from "./shared/DottedUploadSlot";
import { ChipMultiSelect } from "./shared/ChipMultiSelect";
import { DesktopMobilePreview } from "./shared/DesktopMobilePreview";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { MockupSwitcher } from "./shared/MockupSwitcher";
import { useMockupState } from "./shared/useMockupState";
import { MOCKUP_SUB_PROFILE_META, type MockupSubProfileMeta } from "./shared/types";

const MUSIC_STYLE_OPTIONS = [
  "Pop", "Dance", "R&B", "House", "Dansk hits", "Disco", "80'er", "90'er",
  "00'er", "Latin", "Afrobeats", "Techno", "Schlager", "Rock", "Hip-hop",
];

const SPECIAL_SERVICES_OPTIONS = [
  "Lys & stemningslys", "Trådløs mikrofon", "Røgmaskine", "Stemningsopsætning",
  "Konfettiskydere", "Karaoke", "Live MC", "Fotobooth", "Ekstra højtalere",
  "DJ-assistent", "Tidlig setup", "Sen sluttid",
];

const EXPERIENCE_OPTIONS = [
  { value: "1-3", label: "1–3 år" },
  { value: "3-5", label: "3–5 år · 50+ events" },
  { value: "5-10", label: "5–10 år · 150+ events" },
  { value: "10+", label: "10+ år · 250+ bryllupper" },
];

/**
 * Mockup 4 — Compact Split Studio.
 *
 * Tighter, less chaotic variant of Mockup 1 with:
 * - Smaller font sizes throughout
 * - Reduced padding and spacing
 * - More structured preview with appropriately-sized images
 * - Denser form layout using a 3-column grid
 */
export function CompactSplitStudioMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];

  const [customizeOn, setCustomizeOn] = useState(true);

  const musicStyles = useMemo(
    () =>
      sub.musicStyle
        ? sub.musicStyle.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Pop", "Dance", "R&B", "House", "Dansk hits"],
    [sub.musicStyle],
  );
  const specialServices = useMemo(
    () =>
      sub.signatureTracks
        ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Lys & stemningslys", "Trådløs mikrofon", "Røgmaskine", "Stemningsopsætning"],
    [sub.signatureTracks],
  );

  function updateMusicStyles(next: string[]) {
    state.updateSubProfile(activeKey, "musicStyle", next.join(", "));
  }
  function updateSpecialServices(next: string[]) {
    state.updateSubProfile(activeKey, "signatureTracks", next.join(", "));
  }

  return (
    <div className="max-w-[1600px] space-y-3 pb-20">
      <CompactHeader state={state} />

      <EventTypeTabs active={activeKey} onChange={setActiveKey} className="text-xs" />

      <CustomizationRow meta={meta} on={customizeOn} onChange={setCustomizeOn} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_540px]">
        {/* Left: editor */}
        <div className="space-y-3">
          <Card title="Tekst & indhold">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Overskrift / tagline">
                <Input
                  value={sub.tagline}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "tagline", e.target.value)
                  }
                  placeholder="Skab magiske øjeblikke med musik"
                  maxLength={80}
                  className="h-8 text-xs"
                />
              </Field>

              <Field label="Kort beskrivelse">
                <Input
                  value={sub.approach}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "approach", e.target.value)
                  }
                  placeholder={`Professionel DJ til ${meta.noun}`}
                  maxLength={140}
                  className="h-8 text-xs"
                />
              </Field>

              <Field label="Erfaring">
                <ExperienceSelect />
              </Field>

              <Field label="Musikstilarter" className="lg:col-span-2">
                <ChipMultiSelect
                  value={musicStyles}
                  options={MUSIC_STYLE_OPTIONS}
                  onChange={updateMusicStyles}
                  placeholder="Vælg stilarter"
                />
              </Field>

              <Field label="Særlige ydelser">
                <ChipMultiSelect
                  value={specialServices}
                  options={SPECIAL_SERVICES_OPTIONS}
                  onChange={updateSpecialServices}
                  placeholder="Vælg ydelser"
                />
              </Field>

              <Field
                label="Profiltekst"
                className="sm:col-span-2 lg:col-span-3"
                hint={`${sub.bio.length} / 1500`}
              >
                <Textarea
                  rows={4}
                  value={sub.bio}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "bio", e.target.value)
                  }
                  maxLength={1500}
                  placeholder="Fortæl om dig selv og din tilgang …"
                  className="text-xs"
                />
              </Field>
            </div>
          </Card>

          <Card title="Billeder & medier" subtitle="16:9 anbefalet for hero. 1:1 for profil.">
            <div className="grid gap-3 sm:grid-cols-3">
              <UploadField label="Hero-billede">
                <DottedUploadSlot
                  value={sub.featuredPhotoDataUrl}
                  onChange={(next) =>
                    state.setFeaturedPhoto(activeKey, next)
                  }
                  hint="16:9"
                />
              </UploadField>

              <UploadField label="Profilbillede">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0">
                    <DottedUploadSlot
                      value={state.profilePhotoUrl ?? undefined}
                      onChange={() => {}}
                      shape="circle"
                      aspectClassName="aspect-square"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    1:1 format. Bruges som avatar.
                  </p>
                </div>
              </UploadField>

              <UploadField label="Video">
                <DottedUploadSlot
                  value={undefined}
                  onChange={(next) => {
                    if (!next) return;
                    state.appendGalleryItems(activeKey, [
                      { id: `v-${Date.now()}`, type: "video", dataUrl: next },
                    ]);
                  }}
                  hint="MP4"
                  accept="video/*"
                />
              </UploadField>
            </div>

            <div className="mt-3">
              <Label className="text-[11px] font-medium text-muted-foreground">Galleri</Label>
              <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                {sub.gallery.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-border"
                  >
                    {g.type === "video" ? (
                      <video src={g.dataUrl} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => state.removeGalleryItem(activeKey, g.id)}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/95 text-[10px] text-foreground shadow-sm ring-1 ring-border"
                      aria-label="Fjern"
                    >
                      ×
                    </button>
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
          </Card>

          <div className="flex items-start gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <p>
              Indhold her er unikt for {meta.tabLabel.toLowerCase()}. Skift profil ovenfor for andre.
            </p>
          </div>
        </div>

        {/* Right: completion + preview */}
        <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <CompletionBars
            entries={completionEntries}
            activeKey={activeKey}
            onJump={setActiveKey}
            heading="Profiler"
            subheading="Alle tre skal være færdige."
          />
          <DesktopMobilePreview
            state={state}
            heading="Preview"
            subheading={`${meta.tabLabel} — kundens visning`}
            maxHeightClass="max-h-[68vh]"
          />
        </div>
      </div>

      <MockupSwitcher />
    </div>
  );
}

/* -------------------------------------------------------------------- */

function CompactHeader({ state }: { state: { subProfiles: unknown } }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup 4
        </p>
        <h1 className="text-lg font-semibold leading-tight">Compact Split Studio</h1>
        <p className="text-xs text-muted-foreground">
          Kompakt editor med live preview. Mindre skriftstørrelser, tættere layout.
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

function CustomizationRow({
  meta,
  on,
  onChange,
}: {
  meta: MockupSubProfileMeta;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-amber-50/40 px-3 py-2">
      <div className="flex items-start gap-1.5">
        <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <Info className="h-2.5 w-2.5" />
        </span>
        <div>
          <p className="text-xs font-medium">
            Redigerer: <span className="font-semibold">{meta.tabLabel}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            Vises på din offentlige {meta.tabLabel.toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Label htmlFor="customize-compact" className="text-[11px] text-muted-foreground">
          Tilpas specifikt
        </Label>
        <Switch id="customize-compact" checked={on} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <header className="mb-3 space-y-0.5">
        <h2 className="text-xs font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
        {hint && (
          <span className="text-[9px] tabular-nums text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function UploadField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ExperienceSelect() {
  return (
    <select
      defaultValue="10+"
      className="h-8 w-full rounded-md border border-input bg-white px-2 text-xs"
    >
      {EXPERIENCE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
