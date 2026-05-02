import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChevronDown, Check, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_TYPES, SETUP_SIZES } from "@/lib/constants";
import { mockDJs } from "@/data/mock";
import {
  readDemoDJProfile,
  writeDemoDJProfile,
  isSubProfileComplete,
  emptySubProfile,
  SUB_PROFILE_KEYS,
  SUB_PROFILE_META,
  type DemoDJProfile,
  type DemoDJSubProfile,
  type DemoDJSubProfileKey,
} from "@/lib/demoDJProfile";
import { cn } from "@/lib/utils";

/**
 * DJ profile editor.
 *
 * Top of the page is a 4-tab "sub-profile" editor — one variant per event
 * category (general / wedding / birthday / corporate). The tab labels
 * carry completion indicators and the page shows overall progress so the
 * DJ understands they need to fill in all four. Below the tabs is a
 * collapsible "Account-wide details" section for fields that apply to
 * every sub-profile (stage name, photo, equipment, pricing, travel).
 */
export function DJProfileEditorPage() {
  const seed = mockDJs[0]!;
  const initial = readDemoDJProfile();

  /* ---------------------------------------------------------------- */
  /* Account-wide fields                                                */
  /* ---------------------------------------------------------------- */
  const [stageName, setStageName] = useState(initial?.stageName?.trim() || seed.stage_name);
  const [bio, setBio] = useState(initial?.bio?.trim() || seed.bio);
  const [equipment, setEquipment] = useState(
    initial?.equipmentDescription?.trim() ||
      buildEquipmentDescriptionFromPresets(initial?.equipmentPresets) ||
      seed.equipment_description,
  );
  const [setupSize, setSetupSize] = useState(initial?.setupSize?.trim() || seed.setup_size);
  const [travelRadius, setTravelRadius] = useState(seed.travel_radius_km);
  const [priceFrom, setPriceFrom] = useState(seed.price_from_minor ? seed.price_from_minor / 100 : 0);
  const [priceOnRequest, setPriceOnRequest] = useState(seed.price_on_request);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    initial?.eventTypes?.length ? initial.eventTypes : seed.event_types.map((et) => et.id),
  );
  const [accountOpen, setAccountOpen] = useState(false);

  const profilePhotoUrl = initial?.profilePhotoDataUrl ?? seed.profile.avatar_url ?? null;
  const equipmentPhotoUrls = initial?.equipmentPhotoDataUrls?.length
    ? initial.equipmentPhotoDataUrls
    : seed.equipment_photos.map((p) => p.url);

  /* ---------------------------------------------------------------- */
  /* Sub-profile tabs                                                   */
  /* ---------------------------------------------------------------- */
  const [subProfiles, setSubProfiles] = useState<Record<DemoDJSubProfileKey, DemoDJSubProfile>>(
    () => mergeSubProfiles(initial?.subProfiles, initial?.bio),
  );
  const [activeTab, setActiveTab] = useState<DemoDJSubProfileKey>(() =>
    pickFirstIncomplete(initial?.subProfiles) ?? "general",
  );

  function updateSubProfile<K extends keyof DemoDJSubProfile>(
    key: DemoDJSubProfileKey,
    field: K,
    value: DemoDJSubProfile[K],
  ) {
    setSubProfiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  const completion = useMemo(
    () => SUB_PROFILE_KEYS.map((k) => ({ key: k, complete: isSubProfileComplete(subProfiles[k]) })),
    [subProfiles],
  );
  const completedCount = completion.filter((c) => c.complete).length;
  const completionPct = Math.round((completedCount / SUB_PROFILE_KEYS.length) * 100);
  const allComplete = completedCount === SUB_PROFILE_KEYS.length;

  function nextIncompleteAfter(current: DemoDJSubProfileKey): DemoDJSubProfileKey | null {
    const idx = SUB_PROFILE_KEYS.indexOf(current);
    for (let i = 1; i <= SUB_PROFILE_KEYS.length; i++) {
      const next = SUB_PROFILE_KEYS[(idx + i) % SUB_PROFILE_KEYS.length]!;
      if (!isSubProfileComplete(subProfiles[next])) return next;
    }
    return null;
  }

  /* ---------------------------------------------------------------- */
  /* Persistence                                                        */
  /* ---------------------------------------------------------------- */
  // React to demo profile changes coming from elsewhere (e.g. a fresh
  // signup completing) without forcing a full page reload.
  useEffect(() => {
    const onUpdate = () => {
      const next = readDemoDJProfile();
      if (!next) return;
      if (next.stageName?.trim()) setStageName(next.stageName);
      if (next.bio?.trim()) setBio(next.bio);
      if (next.equipmentDescription?.trim()) setEquipment(next.equipmentDescription);
      if (next.setupSize?.trim()) setSetupSize(next.setupSize);
      if (next.eventTypes?.length) setSelectedEventTypes(next.eventTypes);
      setSubProfiles(mergeSubProfiles(next.subProfiles, next.bio));
    };
    window.addEventListener("demoDJProfile:update", onUpdate);
    return () => window.removeEventListener("demoDJProfile:update", onUpdate);
  }, []);

  function buildPersistedProfile(existing: DemoDJProfile | null): DemoDJProfile {
    return {
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      fullName: existing?.fullName ?? stageName,
      email: existing?.email ?? "",
      phone: existing?.phone,
      city: existing?.city ?? seed.base_location,
      country: existing?.country ?? "Denmark",
      stageName,
      bio,
      yearsExperience: existing?.yearsExperience ?? "",
      eventTypes: selectedEventTypes,
      equipmentOwned: existing?.equipmentOwned ?? true,
      equipmentPresets: existing?.equipmentPresets ?? [],
      equipmentDescription: equipment,
      setupSize,
      eventsPerformed: existing?.eventsPerformed ?? "",
      notableClients: existing?.notableClients ?? "",
      profilePhotoDataUrl: existing?.profilePhotoDataUrl,
      equipmentPhotoDataUrls: existing?.equipmentPhotoDataUrls,
      subProfiles,
    };
  }

  function handleSaveAll() {
    writeDemoDJProfile(buildPersistedProfile(readDemoDJProfile()));
    toast.success("Profile saved");
  }

  function handleSaveSubProfile(current: DemoDJSubProfileKey) {
    if (!isSubProfileComplete(subProfiles[current])) {
      toast.error("Please fill in all fields for this sub-profile");
      return;
    }
    writeDemoDJProfile(buildPersistedProfile(readDemoDJProfile()));
    const next = nextIncompleteAfter(current);
    if (next) {
      toast.success(`${SUB_PROFILE_META[current].label} saved · continuing to ${SUB_PROFILE_META[next].label}`);
      setActiveTab(next);
    } else {
      toast.success("All four sub-profiles complete — looking great!");
    }
  }

  function toggleEventType(id: string) {
    setSelectedEventTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Edit your profile</h1>
        <p className="text-sm text-muted-foreground">
          Customers see a different version of your profile depending on the kind of event they're booking.
          Filling in all four sub-profiles boosts how often you appear in each search.
        </p>
      </header>

      {/* Progress strip */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sub-profile completion</p>
            <p className="mt-1 text-base font-semibold">
              {completedCount} of {SUB_PROFILE_KEYS.length} sub-profiles complete
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{completionPct}%</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-foreground"
            initial={false}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        {!allComplete && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Tip: start with <span className="font-medium text-foreground">General</span> — it's used everywhere unless a customer is searching specifically for weddings, birthdays or corporate events.
            </span>
          </p>
        )}
      </div>

      {/* Sub-profile tabs */}
      <Card>
        <CardContent className="space-y-5 p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DemoDJSubProfileKey)}>
            <TabsList className="grid h-auto w-full grid-cols-4 gap-1 bg-muted/60 p-1">
              {SUB_PROFILE_KEYS.map((k) => {
                const complete = completion.find((c) => c.key === k)!.complete;
                return (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="flex h-auto flex-col items-center gap-1 px-2 py-2 text-xs sm:text-sm"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {SUB_PROFILE_META[k].label}
                      <SubProfileStatusDot complete={complete} />
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {SUB_PROFILE_KEYS.map((k) => (
              <TabsContent key={k} value={k} className="mt-5 space-y-5">
                <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {SUB_PROFILE_META[k].eyebrow}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{SUB_PROFILE_META[k].label} profile</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{SUB_PROFILE_META[k].helper}</p>
                </div>

                <SubProfileForm
                  value={subProfiles[k]}
                  onChange={(field, value) => updateSubProfile(k, field, value)}
                  eventLabel={SUB_PROFILE_META[k].label}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <p className="text-xs text-muted-foreground">
                    {isSubProfileComplete(subProfiles[k]) ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                        <Check className="h-3.5 w-3.5" /> This sub-profile looks complete
                      </span>
                    ) : (
                      <span>Tagline, bio (80+ chars), music style, signature tracks and approach are required.</span>
                    )}
                  </p>
                  <Button onClick={() => handleSaveSubProfile(k)} className="gap-1.5">
                    Save & continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Account-wide details */}
      <Card>
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Shared across all sub-profiles</p>
              <h2 className="mt-1 text-lg font-semibold">Account-wide details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Stage name, photo, equipment, pricing and travel — these stay the same regardless of event type.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                accountOpen && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {accountOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-5 border-t border-border/60 px-6 py-5">
                  {profilePhotoUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={profilePhotoUrl}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the photo customers see in search and on every sub-profile.
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="stageName">Stage name</Label>
                    <Input id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="generalBio">Default bio</Label>
                    <Textarea id="generalBio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      A short generic bio. Each sub-profile has its own bio that customers see for that event type.
                    </p>
                  </div>

                  {equipmentPhotoUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {equipmentPhotoUrls.slice(0, 6).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="aspect-square w-full rounded-md object-cover ring-1 ring-border"
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="equipment">Equipment description</Label>
                    <Textarea id="equipment" rows={4} value={equipment} onChange={(e) => setEquipment(e.target.value)} />
                  </div>
                  <div>
                    <Label>Setup size</Label>
                    <Select value={setupSize} onValueChange={(v) => setSetupSize(v as typeof setupSize)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SETUP_SIZES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label} — {s.description}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Event types you accept</Label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {EVENT_TYPES.map((et) => (
                        <label key={et.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                          <Checkbox
                            checked={selectedEventTypes.includes(et.id)}
                            onCheckedChange={() => toggleEventType(et.id)}
                          />
                          {et.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="flex items-center justify-between gap-3">
                        <span className="text-sm">Price on request</span>
                        <Switch checked={priceOnRequest} onCheckedChange={setPriceOnRequest} />
                      </label>
                      {!priceOnRequest && (
                        <div className="mt-3">
                          <Label htmlFor="priceFrom">Default starting price (DKK)</Label>
                          <Input
                            id="priceFrom"
                            type="number"
                            min={0}
                            value={priceFrom}
                            onChange={(e) => setPriceFrom(Number(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="travelRadius">Travel radius (km)</Label>
                      <Input
                        id="travelRadius"
                        type="number"
                        min={0}
                        value={travelRadius}
                        onChange={(e) => setTravelRadius(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSaveAll}>Save all changes</Button>
        <Button variant="outline" asChild>
          <a href={`/djs/${seed.username}`} target="_blank" rel="noreferrer">Preview public profile</a>
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Sub-components                                                      */
/* ----------------------------------------------------------------- */

function SubProfileStatusDot({ complete }: { complete: boolean }) {
  return complete ? (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  ) : (
    <span className="h-2 w-2 rounded-full border border-muted-foreground/60" />
  );
}

function SubProfileForm({
  value,
  onChange,
  eventLabel,
}: {
  value: DemoDJSubProfile;
  onChange: <K extends keyof DemoDJSubProfile>(field: K, value: DemoDJSubProfile[K]) => void;
  eventLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`tagline-${eventLabel}`}>Tagline</Label>
        <Input
          id={`tagline-${eventLabel}`}
          maxLength={80}
          placeholder={`e.g. "${eventLabel} DJ — modern, warm, dancefloor-first"`}
          value={value.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">{value.tagline.length}/80 — shown right under your name.</p>
      </div>

      <div>
        <Label htmlFor={`bio-${eventLabel}`}>Bio</Label>
        <Textarea
          id={`bio-${eventLabel}`}
          rows={5}
          placeholder={`Tell customers what makes you the right ${eventLabel.toLowerCase()} DJ. Cover your style, experience, and what you do during the event.`}
          value={value.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {value.bio.length} characters {value.bio.length < 80 ? `(${80 - value.bio.length} more needed)` : "✓"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`musicStyle-${eventLabel}`}>Music style</Label>
          <Input
            id={`musicStyle-${eventLabel}`}
            placeholder="e.g. House, disco, funk — high-energy peaks"
            value={value.musicStyle}
            onChange={(e) => onChange("musicStyle", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`signature-${eventLabel}`}>Signature tracks</Label>
          <Input
            id={`signature-${eventLabel}`}
            placeholder="3–5 tracks customers might recognise"
            value={value.signatureTracks}
            onChange={(e) => onChange("signatureTracks", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`approach-${eventLabel}`}>Your approach</Label>
        <Textarea
          id={`approach-${eventLabel}`}
          rows={3}
          placeholder={`How do you run a ${eventLabel.toLowerCase()}? E.g. when you arrive, how you handle requests, what the typical flow looks like.`}
          value={value.approach}
          onChange={(e) => onChange("approach", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`price-${eventLabel}`}>Starting price for this event type (DKK)</Label>
        <Input
          id={`price-${eventLabel}`}
          type="number"
          min={0}
          placeholder="Optional — leave at 0 to use your default"
          value={value.priceFromMajor || ""}
          onChange={(e) => onChange("priceFromMajor", Number(e.target.value) || 0)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          You can charge differently per event type. Leave at 0 to use the default in Account-wide details.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* Helpers                                                             */
/* ----------------------------------------------------------------- */

function buildEquipmentDescriptionFromPresets(presets: string[] | undefined): string {
  if (!presets?.length) return "";
  return presets.join(", ");
}

function mergeSubProfiles(
  existing: DemoDJProfile["subProfiles"] | undefined,
  defaultBio: string | undefined,
): Record<DemoDJSubProfileKey, DemoDJSubProfile> {
  const out = {} as Record<DemoDJSubProfileKey, DemoDJSubProfile>;
  for (const k of SUB_PROFILE_KEYS) {
    const existingForKey = existing?.[k];
    if (existingForKey) {
      out[k] = existingForKey;
    } else if (k === "general" && defaultBio?.trim()) {
      // First time landing here after signup — pre-seed the General sub-profile
      // bio from the signup-supplied bio so the DJ has a head-start.
      out[k] = { ...emptySubProfile(), bio: defaultBio.trim() };
    } else {
      out[k] = emptySubProfile();
    }
  }
  return out;
}

function pickFirstIncomplete(
  existing: DemoDJProfile["subProfiles"] | undefined,
): DemoDJSubProfileKey | null {
  for (const k of SUB_PROFILE_KEYS) {
    if (!isSubProfileComplete(existing?.[k])) return k;
  }
  return null;
}
