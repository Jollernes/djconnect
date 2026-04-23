import { useState } from "react";
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

export function DJProfileEditorPage() {
  const dj = mockDJs[0]!;
  const [stageName, setStageName] = useState(dj.stage_name);
  const [tagline, setTagline] = useState(dj.tagline ?? "");
  const [bio, setBio] = useState(dj.bio);
  const [equipment, setEquipment] = useState(dj.equipment_description);
  const [setupSize, setSetupSize] = useState(dj.setup_size);
  const [travelRadius, setTravelRadius] = useState(dj.travel_radius_km);
  const [priceFrom, setPriceFrom] = useState(dj.price_from_minor ? dj.price_from_minor / 100 : 0);
  const [priceOnRequest, setPriceOnRequest] = useState(dj.price_on_request);
  const [selectedEventTypes, setSelectedEventTypes] = useState(dj.event_types.map((et) => et.id));

  function toggleEventType(id: string) {
    setSelectedEventTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Edit your profile</h1>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Public profile</h2>
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
        <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
        <Button variant="outline" asChild>
          <a href={`/djs/${dj.username}`} target="_blank" rel="noreferrer">Preview public profile</a>
        </Button>
      </div>
    </div>
  );
}
