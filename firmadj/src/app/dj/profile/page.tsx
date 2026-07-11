"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getSession } from "@/lib/auth";
import { getDJByUserId, updateDJProfile, uploadDJPhoto } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DJProfilePage() {
  const [dj, setDJ] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (s) => {
      if (s) {
        const d = await getDJByUserId(s.userId);
        setDJ(d);
        setForm(d || {});
        setPreview(d?.photo_url || null);
      }
    });
  }, []);

  function update(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: string, value: string) {
    setForm((prev: any) => {
      const arr = (prev[field] || []) as string[];
      if (arr.includes(value)) return { ...prev, [field]: arr.filter((v) => v !== value) };
      return { ...prev, [field]: [...arr, value] };
    });
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !dj) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append("photo", file);
    await uploadDJPhoto(dj.id, formData);
    toast.success("Foto opdateret");
  }

  async function save() {
    if (!dj) return;
    await updateDJProfile(dj.id, form);
    toast.success("Profil gemt");
  }

  if (!dj) return <div className="py-12">Indlæser...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Min profil</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Billede og offentlig profil</h2>
            <div><Label>Profilfoto</Label><Input type="file" accept="image/*" onChange={handlePhoto} /></div>
            {preview && <img src={preview} alt="preview" className="w-32 h-32 rounded-full object-cover" />}
            <div><Label>Offentligt navn</Label><Input value={form.public_display_name || ""} onChange={(e) => update("public_display_name", e.target.value)} /></div>
            <div><Label>Kort bio</Label><Textarea value={form.bio_short || ""} onChange={(e) => update("bio_short", e.target.value)} /></div>
            <div><Label>Sample mix URL</Label><Input value={form.sample_mix_url || ""} onChange={(e) => update("sample_mix_url", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Live kunde-preview</h2>
            <div className="border rounded-2xl p-6 max-w-md mx-auto">
              <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mx-auto mb-4">
                {preview ? <img src={preview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500">{form.public_display_name?.charAt(0)}</div>}
              </div>
              <div className="text-center font-bold text-slate-900 text-xl">{form.public_display_name}</div>
              <div className="text-center text-slate-500 text-sm">{form.city}</div>
              <div className="text-center text-slate-600 text-sm mt-3">{form.bio_short}</div>
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {(form.vibe_tags || []).slice(0, 3).map((tag: string) => <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded-full">{tag}</span>)}
              </div>
              <div className="text-center text-xs text-slate-400 mt-4">Foreløbigt ledig på valgt dato</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Musikprofil og erfaring</h2>
            <div><Label>Års erfaring</Label><Input type="number" value={form.corporate_experience_years || ""} onChange={(e) => update("corporate_experience_years", Number(e.target.value))} /></div>
            <div><Label>Sprog</Label><Input value={(form.languages || []).join(", ")} onChange={(e) => update("languages", e.target.value.split(",").map((s: string) => s.trim()))} /></div>
            <div><Label>Vibe tags</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Bred firmafest for alle aldre", "Elegant middag først, fest senere", "Julefrokost med singalong og klassikere", "Moderne dance/pop", "Disco, funk og 80’er/90’er", "Internationalt publikum", "Rolig lounge og baggrund", "High-energy dansegulv"].map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Checkbox checked={(form.vibe_tags || []).includes(tag)} onCheckedChange={() => toggleArray("vibe_tags", tag)} />
                    <Label className="font-normal">{tag}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Specialiteter</Label><Input value={(form.specialties || []).join(", ")} onChange={(e) => update("specialties", e.target.value.split(",").map((s: string) => s.trim()))} /></div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Udstyr og kapacitet</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_80} onCheckedChange={(v) => update("can_deliver_80", !!v)} /><Label className="font-normal">Op til 80</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_150} onCheckedChange={(v) => update("can_deliver_150", !!v)} /><Label className="font-normal">Op til 150</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_200} onCheckedChange={(v) => update("can_deliver_200", !!v)} /><Label className="font-normal">Op til 200</Label></div>
            </div>
            <div><Label>Lyd</Label><Textarea value={form.equipment_sound || ""} onChange={(e) => update("equipment_sound", e.target.value)} /></div>
            <div><Label>Lys</Label><Textarea value={form.equipment_lighting || ""} onChange={(e) => update("equipment_lighting", e.target.value)} /></div>
            <div className="flex items-center gap-2"><Checkbox checked={form.can_handle_speeches} onCheckedChange={(v) => update("can_handle_speeches", !!v)} /><Label className="font-normal">Kan håndtere mikrofon og taler</Label></div>
            <div><Label>Setup område</Label><Input value={form.setup_area_description || ""} onChange={(e) => update("setup_area_description", e.target.value)} /></div>
            <div><Label>Setup tid (min)</Label><Input type="number" value={form.setup_time_minutes || ""} onChange={(e) => update("setup_time_minutes", Number(e.target.value))} /></div>
            <div><Label>Transport radius (km)</Label><Input type="number" value={form.transport_radius_km || ""} onChange={(e) => update("transport_radius_km", Number(e.target.value))} /></div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={save} className="bg-slate-900 hover:bg-slate-800 text-white">Gem profil</Button>
    </div>
  );
}
