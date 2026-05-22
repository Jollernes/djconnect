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
  { value: "1-3", label: "1–3 års erfaring" },
  { value: "3-5", label: "3–5 års erfaring · 50+ events" },
  { value: "5-10", label: "5–10 års erfaring · 150+ events" },
  { value: "10+", label: "10+ års erfaring · 250+ bryllupper" },
];

/**
 * Mockup 1 — Split Studio.
 *
 * Layout follows the user's reference screenshot exactly:
 *
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │  [♥ Bryllupsprofil] [🍰 Fødselsdagsprofil] [💼 Firmaeventprofil]   │
 *   ├──────────────────────────────────┬─────────────────────────────────┤
 *   │  Du redigerer indhold til: X     │  Dine profiler                  │
 *   │  [Tilpas specifikt til ⏺ ON]     │  (3 completion bars)            │
 *   ├──────────────────────────────────┼─────────────────────────────────┤
 *   │  Tekst & indhold                 │  Live preview · Desktop / Mobil │
 *   │  ┌─────────┬─────────┐           │  ┌─────────────────────────────┐│
 *   │  │ tagline │ musik   │           │  │                             ││
 *   │  ├─────────┼─────────┤           │  │   full DJ profile preview   ││
 *   │  │ kort    │ erfaring│           │  │                             ││
 *   │  ├─────────┼─────────┤           │  │                             ││
 *   │  │ profil… │ ydelser │           │  │                             ││
 *   │  └─────────┴─────────┘           │  └─────────────────────────────┘│
 *   │  Billeder, video & medier        │                                 │
 *   │  ┌─────────┬─────────┐           │                                 │
 *   │  │ hero    │ profil  │           │                                 │
 *   │  ├─────────┼─────────┤           │                                 │
 *   │  │ galleri │ video   │           │                                 │
 *   │  └─────────┴─────────┘           │                                 │
 *   └──────────────────────────────────┴─────────────────────────────────┘
 */
export function SplitStudioMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];

  /* Mockup-only local state for the sub-profile customisation toggle.
   * Defaults ON so the form is interactive — flipping it off would, in a
   * real implementation, show the inherited values from the shared block. */
  const [customizeOn, setCustomizeOn] = useState(true);

  /* Mockup-only local state for music styles and special services that
   * don't have backing fields in the existing data model yet. */
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
    <div className="max-w-[1600px] space-y-5 pb-24">
      <SplitStudioHeader state={state} />

      <EventTypeTabs active={activeKey} onChange={setActiveKey} />

      <CustomizationRow meta={meta} on={customizeOn} onChange={setCustomizeOn} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_640px]">
        {/* Left: editor */}
        <div className="space-y-5">
          <Card title="Tekst & indhold">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Overskrift / tagline">
                <Input
                  value={sub.tagline}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "tagline", e.target.value)
                  }
                  placeholder="Skab magiske øjeblikke med musik"
                  maxLength={80}
                />
              </Field>

              <Field label="Musikstilarter">
                <ChipMultiSelect
                  value={musicStyles}
                  options={MUSIC_STYLE_OPTIONS}
                  onChange={updateMusicStyles}
                  placeholder="Vælg stilarter"
                />
              </Field>

              <Field label="Kort beskrivelse">
                <Input
                  value={sub.approach}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "approach", e.target.value)
                  }
                  placeholder={`Professionel DJ til ${meta.noun} med sans for stemning og detaljer.`}
                  maxLength={140}
                />
              </Field>

              <Field label="Erfaring">
                <ExperienceSelect />
              </Field>

              <Field
                label="Længere profiltekst"
                className="sm:col-span-1"
                hint={`${sub.bio.length} / 1500`}
              >
                <Textarea
                  rows={6}
                  value={sub.bio}
                  onChange={(e) =>
                    state.updateSubProfile(activeKey, "bio", e.target.value)
                  }
                  maxLength={1500}
                  placeholder={`Jeg hedder Mads, og jeg skaber uforglemmelige fester med den helt rigtige musik. Fra romantisk ceremoni til dansegulv fyldt hele natten — jeg tilpasser musikken til jeres ønsker og gæsterne …`}
                />
              </Field>

              <Field label="Særlige ydelser" className="sm:col-span-1">
                <ChipMultiSelect
                  value={specialServices}
                  options={SPECIAL_SERVICES_OPTIONS}
                  onChange={updateSpecialServices}
                  placeholder="Vælg ydelser"
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Billeder, video & medier"
            subtitle="Upload billeder og video specifikt til denne profil. Anbefalet billedformat: 16:9 (1920×1080)."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <UploadField label="Hero-billede (forside)">
                <DottedUploadSlot
                  value={sub.featuredPhotoDataUrl}
                  onChange={(next) =>
                    state.setFeaturedPhoto(activeKey, next)
                  }
                  hint="16:9 anbefales"
                />
              </UploadField>

              <UploadField label="Profilbillede">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 shrink-0">
                    <DottedUploadSlot
                      value={state.profilePhotoUrl ?? undefined}
                      onChange={() => {
                        /* mockup only — wire to a real profilePhoto setter
                         * when promoting one of these to /dj/profile. */
                      }}
                      shape="circle"
                      aspectClassName="aspect-square"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1:1 anbefales. Dette billede bruges på din DJ-card og som
                    avatar i preview-sektionen.
                  </p>
                </div>
              </UploadField>

              <UploadField label="Galleri">
                <div className="grid grid-cols-4 gap-2">
                  {sub.gallery.slice(0, 4).map((g) => (
                    <div
                      key={g.id}
                      className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-border"
                    >
                      {g.type === "video" ? (
                        <video
                          src={g.dataUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={g.dataUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          state.removeGalleryItem(activeKey, g.id)
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border"
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
                        {
                          id: `g-${Date.now()}`,
                          type: "photo",
                          dataUrl: next,
                        },
                      ]);
                    }}
                    hint="Tilføj flere"
                    aspectClassName="aspect-square"
                  />
                </div>
              </UploadField>

              <UploadField label="Video (vises som featured)">
                <div className="grid grid-cols-2 gap-2">
                  {sub.gallery
                    .filter((g) => g.type === "video")
                    .slice(0, 1)
                    .map((g) => (
                      <div
                        key={g.id}
                        className="group relative aspect-video overflow-hidden rounded-md ring-1 ring-border"
                      >
                        <video
                          src={g.dataUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                        <button
                          type="button"
                          onClick={() =>
                            state.removeGalleryItem(activeKey, g.id)
                          }
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border"
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
                        {
                          id: `v-${Date.now()}`,
                          type: "video",
                          dataUrl: next,
                        },
                      ]);
                    }}
                    hint="MP4 anbefales"
                    accept="video/*"
                  />
                </div>
              </UploadField>
            </div>
          </Card>

          <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p>
              Indhold her er unikt for {meta.tabLabel.toLowerCase()}. Skift til
              de andre profiler ovenfor for at tilpasse deres indhold.
            </p>
          </div>
        </div>

        {/* Right: completion + preview */}
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <CompletionBars
            entries={completionEntries}
            activeKey={activeKey}
            onJump={setActiveKey}
          />
          <DesktopMobilePreview
            state={state}
            heading="Live preview"
            subheading={`Sådan vil din ${meta.tabLabel.toLowerCase()} se ud for dine kunder.`}
          />
        </div>
      </div>

      <MockupSwitcher />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Building blocks                                                        */
/* -------------------------------------------------------------------- */

function SplitStudioHeader({ state }: { state: { subProfiles: unknown } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup 1
        </p>
        <h1 className="text-2xl font-semibold">Split Studio</h1>
        <p className="text-sm text-muted-foreground">
          Redigér én sub-profil ad gangen. Status og live preview altid i højre side.
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-amber-50/40 px-4 py-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <Info className="h-3 w-3" />
        </span>
        <div>
          <p className="text-sm font-medium">
            Du redigerer indhold til:{" "}
            <span className="font-semibold">{meta.tabLabel}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Indholdet der vises på din offentlige {meta.tabLabel.toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="customize" className="text-xs text-muted-foreground">
          Tilpas indhold specifikt til denne profil
        </Label>
        <Switch id="customize" checked={on} onCheckedChange={onChange} />
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
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
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
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint && (
          <span className="text-[10px] tabular-nums text-muted-foreground">{hint}</span>
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
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ExperienceSelect() {
  return (
    <select
      defaultValue="10+"
      className="h-[42px] w-full rounded-lg border border-input bg-white px-3 text-sm"
    >
      {EXPERIENCE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
