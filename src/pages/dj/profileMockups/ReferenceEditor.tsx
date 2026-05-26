import { useMemo, useState } from "react";
import {
  Eye, Move, Save, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompletionBars } from "./shared/CompletionBars";
import { DottedUploadSlot } from "./shared/DottedUploadSlot";
import { ChipMultiSelect } from "./shared/ChipMultiSelect";
import { DesktopMobilePreview } from "./shared/DesktopMobilePreview";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { MockupSwitcher } from "./shared/MockupSwitcher";
import { useMockupState } from "./shared/useMockupState";
import {
  MOCKUP_SUB_PROFILE_META,
  MOCKUP_SUB_PROFILE_KEYS,
} from "./shared/types";

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
 * Mockup 7 — Reference Editor.
 *
 * Based on the provided reference screenshot:
 * - Clean split-panel: left editor card + right live preview card
 * - Header with title, subtitle, Preview & Save buttons
 * - Left card contains: sub-profile tabs, profile picture + upload,
 *   "Profilside / DJ Kort" toggle, hero image drag-to-position area,
 *   bio textarea, approach textarea, music styles, special services,
 *   price, equipment, gallery
 * - Right card: scrollable live preview matching the public DJ profile
 * - All features from previous mockups included
 */
export function ReferenceEditorMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];

  const [editorView, setEditorView] = useState<"profile" | "card">("profile");

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
    <div className="max-w-[1600px] space-y-4 pb-24">
      {/* Header row — matches reference: title + Preview / Save buttons */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mockup 7
          </p>
          <h1 className="text-xl font-bold">Online Profile</h1>
          <p className="text-sm text-muted-foreground">
            Edit how customers see your profile when they're choosing a DJ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AutosaveIndicator value={state.subProfiles} />
          <Button variant="outline" size="sm" asChild>
            <a href="/djs/alex-holm" target="_blank" rel="noreferrer">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </a>
          </Button>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Main grid: left editor card + right live preview */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_560px]">
        {/* ─── Left: Edit Profile Content card ─── */}
        <div className="rounded-xl border bg-card shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">✏️</span>
              <h2 className="text-sm font-semibold">Edit Profile Content</h2>
            </div>
            <span className="text-xs text-muted-foreground">Your online profile ▾</span>
          </div>

          <div className="px-5 py-4">
            {/* Sub-profile tabs — matches reference "Allgemeines Profil | Hochzeitsprofil | Firmenfeier-Profil" */}
            <div className="flex gap-1 rounded-lg bg-muted/40 p-0.5">
              {MOCKUP_SUB_PROFILE_KEYS.map((key) => {
                const m = MOCKUP_SUB_PROFILE_META[key];
                const isActive = activeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveKey(key)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m.tabLabel}
                    {key !== "wedding" && (
                      <span className="ml-1 text-[10px] text-muted-foreground/70">default</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-6">
              {/* ── Profile Picture ── */}
              <Section title="Profile Picture">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0">
                    <DottedUploadSlot
                      value={state.profilePhotoUrl ?? undefined}
                      onChange={() => {}}
                      shape="circle"
                      aspectClassName="aspect-square"
                    />
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="text-xs">
                      Upload Photo
                    </Button>
                    <p className="text-[10px] text-muted-foreground">
                      JPG, PNG or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── View toggle: Profilside / DJ Kort ── */}
              <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border">
                <button
                  type="button"
                  onClick={() => setEditorView("profile")}
                  className={cn(
                    "px-4 py-2 text-xs font-medium transition-colors",
                    editorView === "profile"
                      ? "bg-white"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  Profilside
                </button>
                <button
                  type="button"
                  onClick={() => setEditorView("card")}
                  className={cn(
                    "border-l px-4 py-2 text-xs font-medium transition-colors",
                    editorView === "card"
                      ? "bg-white"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  DJ Kort
                </button>
              </div>

              {editorView === "profile" ? (
                <>
                  {/* ── Hero image area — matches drag-to-position ── */}
                  <Section title="Hero-billede">
                    <p className="mb-2 text-[10px] text-muted-foreground">
                      <Move className="mr-1 inline h-3 w-3" />
                      Træk for at positionere dit profilbillede i hero-området
                    </p>
                    <DottedUploadSlot
                      value={sub.featuredPhotoDataUrl}
                      onChange={(next) => state.setFeaturedPhoto(activeKey, next)}
                      hint="16:9 anbefalet"
                    />
                  </Section>

                  {/* ── About Me (Bio) ── */}
                  <Section
                    title="About Me (Bio)"
                    trailing={
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {sub.bio.length}/1500
                      </span>
                    }
                  >
                    <Textarea
                      value={sub.bio}
                      onChange={(e) =>
                        state.updateSubProfile(activeKey, "bio", e.target.value)
                      }
                      rows={5}
                      maxLength={1500}
                      placeholder="Write about yourself and your experience as a DJ…"
                      className="text-sm"
                    />
                  </Section>

                  {/* ── Approach ── */}
                  <Section title="My Approach">
                    <Textarea
                      value={sub.approach}
                      onChange={(e) =>
                        state.updateSubProfile(activeKey, "approach", e.target.value)
                      }
                      rows={3}
                      placeholder={`Describe your approach for a ${meta.noun.toLowerCase()}…`}
                      className="text-sm"
                    />
                  </Section>

                  {/* ── Tagline ── */}
                  <Section title="Tagline">
                    <Input
                      value={sub.tagline}
                      onChange={(e) =>
                        state.updateSubProfile(activeKey, "tagline", e.target.value)
                      }
                      placeholder="Create magical moments with music"
                      maxLength={80}
                      className="text-sm"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Short headline shown on your profile. Max 80 characters.
                    </p>
                  </Section>

                  {/* ── Music Styles ── */}
                  <Section title="Music Styles">
                    <ChipMultiSelect
                      value={musicStyles}
                      options={MUSIC_STYLE_OPTIONS}
                      onChange={updateMusicStyles}
                      placeholder="Select your music styles"
                    />
                  </Section>

                  {/* ── Special Services ── */}
                  <Section title="Special Services">
                    <ChipMultiSelect
                      value={specialServices}
                      options={SPECIAL_SERVICES_OPTIONS}
                      onChange={updateSpecialServices}
                      placeholder="Select included services"
                    />
                  </Section>

                  {/* ── Experience ── */}
                  <Section title="Experience">
                    <select
                      defaultValue="10+"
                      className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
                    >
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Section>

                  {/* ── Price ── */}
                  <Section title="Starting Price">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={sub.priceFromMajor || ""}
                        onChange={(e) =>
                          state.updateSubProfile(
                            activeKey,
                            "priceFromMajor",
                            Number(e.target.value) || 0,
                          )
                        }
                        placeholder="Leave blank for default"
                        className="text-sm"
                      />
                      <span className="shrink-0 text-sm text-muted-foreground">DKK</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Default: {state.priceFrom.toLocaleString("da-DK")} kr. per {meta.noun.toLowerCase()}.
                    </p>
                  </Section>

                  {/* ── Gallery ── */}
                  <Section title="Photo & Video Gallery">
                    <div className="grid grid-cols-4 gap-2">
                      {sub.gallery.map((g) => (
                        <div
                          key={g.id}
                          className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-border"
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
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-xs text-foreground shadow-sm ring-1 ring-border"
                            aria-label="Remove"
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
                        hint="+"
                        aspectClassName="aspect-square"
                      />
                    </div>
                    <div className="mt-2">
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
                        hint="Upload video (MP4)"
                        accept="video/*"
                        aspectClassName="aspect-[3/1]"
                      />
                    </div>
                  </Section>

                  {/* ── Equipment (shared) ── */}
                  <Section
                    title="Equipment & Mobile Disco"
                    badge="Shared across all profiles"
                  >
                    <Textarea
                      value={state.equipment}
                      onChange={(e) => state.setEquipment(e.target.value)}
                      rows={3}
                      placeholder="Describe your speakers, lights, microphones, backup…"
                      className="text-sm"
                    />
                  </Section>

                  {/* ── Travel (shared) ── */}
                  <Section
                    title="Availability & Travel"
                    badge="Shared across all profiles"
                  >
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={state.travelRadius || ""}
                        onChange={(e) =>
                          state.setTravelRadius(Number(e.target.value) || 0)
                        }
                        placeholder="Travel radius"
                        className="text-sm"
                      />
                      <span className="shrink-0 text-sm text-muted-foreground">km</span>
                    </div>
                  </Section>
                </>
              ) : (
                /* ── DJ Card view ── */
                <div className="space-y-4">
                  <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    <p className="font-medium">DJ Card Preview</p>
                    <p className="mt-1 text-xs">
                      This is how your profile appears in search results and listing cards.
                      The card uses your profile picture, name, tagline, and starting price.
                    </p>
                  </div>
                  <Section title="Card Tagline">
                    <Input
                      value={sub.tagline}
                      onChange={(e) =>
                        state.updateSubProfile(activeKey, "tagline", e.target.value)
                      }
                      placeholder="Short tagline for your DJ card"
                      maxLength={80}
                      className="text-sm"
                    />
                  </Section>
                  <Section title="Card Price Display">
                    <Input
                      type="number"
                      value={sub.priceFromMajor || ""}
                      onChange={(e) =>
                        state.updateSubProfile(
                          activeKey,
                          "priceFromMajor",
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Price shown on card"
                      className="text-sm"
                    />
                  </Section>
                </div>
              )}

              {/* Info bar */}
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p>
                  Content here is specific to your{" "}
                  <strong>{meta.tabLabel.toLowerCase()}</strong> profile.
                  Switch tabs above to edit other event types.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Live Preview + Completion ─── */}
        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          {/* Live Preview card — matches reference right panel */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
                <h2 className="text-sm font-semibold">Live Preview</h2>
              </div>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Updates in real-time
              </span>
            </div>
            <div className="p-3">
              <DesktopMobilePreview
                state={state}
                heading=""
                subheading=""
                className="border-none shadow-none"
                innerClassName="p-0"
                maxHeightClass="max-h-[60vh]"
              />
            </div>
          </div>

          {/* Completion bars */}
          <CompletionBars
            entries={completionEntries}
            activeKey={activeKey}
            onJump={setActiveKey}
            heading="Profile Completion"
            subheading="All three profiles must be complete to go live."
          />
        </div>
      </div>

      <MockupSwitcher />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Helpers                                                                */
/* -------------------------------------------------------------------- */

function Section({
  title,
  trailing,
  badge,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{title}</Label>
          {badge && (
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-medium text-sky-700 ring-1 ring-sky-200">
              {badge}
            </span>
          )}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  );
}
