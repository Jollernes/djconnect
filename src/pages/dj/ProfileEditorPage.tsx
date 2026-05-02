import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EVENT_TYPES, SETUP_SIZES } from "@/lib/constants";
import { mockDJs } from "@/data/mock";
import { readDemoDJProfile, writeDemoDJProfile } from "@/lib/demoDJProfile";

/**
 * DJ profile editor.
 *
 * For Supabase-backed accounts this would load the DJ's row from
 * `dj_profiles`. In demo mode we layer the locally-stored "demo DJ profile"
 * (built up by `/signup/dj`) on top of the seed `mockDJs[0]` so a freshly
 * onboarded DJ sees their own stage name, bio, equipment list and event
 * types — not Alex Holm's.
 */
export function DJProfileEditorPage() {
  const seed = mockDJs[0]!;
  const demo = readDemoDJProfile();

  const [stageName, setStageName] = useState(demo?.stageName?.trim() || seed.stage_name);
  const [tagline, setTagline] = useState(seed.tagline ?? "");
  const [bio, setBio] = useState(demo?.bio?.trim() || seed.bio);
  const [equipment, setEquipment] = useState(
    demo?.equipmentDescription?.trim() ||
      buildEquipmentDescriptionFromPresets(demo?.equipmentPresets) ||
      seed.equipment_description,
  );
  const [setupSize, setSetupSize] = useState(demo?.setupSize?.trim() || seed.setup_size);
  const [travelRadius, setTravelRadius] = useState(seed.travel_radius_km);
  const [priceFrom, setPriceFrom] = useState(seed.price_from_minor ? seed.price_from_minor / 100 : 0);
  const [priceOnRequest, setPriceOnRequest] = useState(seed.price_on_request);
  const [selectedEventTypes, setSelectedEventTypes] = useState(
    demo?.eventTypes?.length
      ? demo.eventTypes
      : seed.event_types.map((et) => et.id),
  );

  // Photos & profile photo come straight from the demo profile. The seed
  // photos are used purely as visual fallbacks if the user skipped uploads.
  const profilePhotoUrl = demo?.profilePhotoDataUrl ?? seed.profile.avatar_url ?? null;
  const equipmentPhotoUrls =
    demo?.equipmentPhotoDataUrls?.length
      ? demo.equipmentPhotoDataUrls
      : seed.equipment_photos.map((p) => p.url);

  // If we ever want this page to react to a fresh signup completing without
  // a full reload, we listen for the demo profile update event.
  useEffect(() => {
    const onUpdate = () => {
      const next = readDemoDJProfile();
      if (!next) return;
      setStageName(next.stageName?.trim() || stageName);
      setBio(next.bio?.trim() || bio);
      if (next.equipmentDescription?.trim()) setEquipment(next.equipmentDescription);
      if (next.setupSize?.trim()) setSetupSize(next.setupSize);
      if (next.eventTypes?.length) setSelectedEventTypes(next.eventTypes);
    };
    window.addEventListener("demoDJProfile:update", onUpdate);
    return () => window.removeEventListener("demoDJProfile:update", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleEventType(id: string) {
    setSelectedEventTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    // Persist back into the demo profile so refreshing the page keeps the
    // edits. We only update the fields exposed on this editor; account
    // info (email, phone) and signup-only fields stay untouched.
    const existing = readDemoDJProfile();
    writeDemoDJProfile({
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
    });
    toast.success("Profile updated");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Edit your profile</h1>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Public profile</h2>
          {profilePhotoUrl && (
            <div className="flex items-center gap-3">
              <img
                src={profilePhotoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
              />
              <p className="text-xs text-muted-foreground">
                This is the photo customers see in search and on your profile.
              </p>
            </div>
          )}
          <div>
            <Label htmlFor="stageName">Stage name</Label>
            <Input id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline (max 80 chars)</Label>
            <Input id="tagline" maxLength={80} value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{tagline.length}/80</p>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Equipment & event types</h2>
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
            <Label>Event types</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {EVENT_TYPES.map((et) => (
                <label key={et.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <Checkbox checked={selectedEventTypes.includes(et.id)} onCheckedChange={() => toggleEventType(et.id)} />
                  {et.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Pricing & travel</h2>
          <label className="flex items-center justify-between">
            <span className="text-sm">Price on request (customers submit a request, you reply with a quote)</span>
            <Switch checked={priceOnRequest} onCheckedChange={setPriceOnRequest} />
          </label>
          {!priceOnRequest && (
            <div>
              <Label htmlFor="priceFrom">Starting price (DKK)</Label>
              <Input
                id="priceFrom"
                type="number"
                min={0}
                value={priceFrom}
                onChange={(e) => setPriceFrom(Number(e.target.value))}
              />
            </div>
          )}
          <div>
            <Label htmlFor="travelRadius">Travel radius (km)</Label>
            <Input
              id="travelRadius"
              type="number"
              min={0}
              value={travelRadius}
              onChange={(e) => setTravelRadius(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave}>Save changes</Button>
        <Button variant="outline" asChild>
          <a href={`/djs/${seed.username}`} target="_blank" rel="noreferrer">Preview public profile</a>
        </Button>
      </div>
    </div>
  );
}

function buildEquipmentDescriptionFromPresets(presets: string[] | undefined): string {
  if (!presets?.length) return "";
  return presets.join(", ");
}
