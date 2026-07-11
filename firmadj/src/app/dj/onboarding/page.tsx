"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession } from "@/lib/auth";
import { getDJByUserId, updateDJProfile, uploadDJPhoto } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const steps = ["Grundlæggende", "Profil", "Udstyr", "Payout", "Tilgængelighed", "Preview"];

export default function DJOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
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
    toast.success("Foto uploadet");
  }

  async function save() {
    if (!dj) return;
    await updateDJProfile(dj.id, form);
    toast.success("Gemt");
    if (step < steps.length - 1) setStep(step + 1);
    else router.push("/dj");
  }

  if (!dj) return <div className="py-12">Indlæser...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">DJ onboarding</h1>
      <div className="flex gap-2 text-sm text-slate-500 mb-4">
        {steps.map((s, i) => (
          <span key={s} className={`px-3 py-1 rounded-full ${i === step ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{s}</span>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Grundlæggende identitet</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Stage navn</Label><Input value={form.stage_name || ""} onChange={(e) => update("stage_name", e.target.value)} /></div>
                <div><Label>Offentligt navn</Label><Input value={form.public_display_name || ""} onChange={(e) => update("public_display_name", e.target.value)} /></div>
                <div><Label>Juridisk navn</Label><Input value={form.legal_name || ""} onChange={(e) => update("legal_name", e.target.value)} /></div>
                <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
                <div><Label>Telefon</Label><Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
                <div><Label>By</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
              </div>
              <p className="text-sm text-slate-500">Dit juridiske navn og kontaktoplysninger vises ikke til kunder før en booking er bekræftet og kun efter behov.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Profil og positioning</h2>
              <div><Label>Profilfoto</Label><Input type="file" accept="image/*" onChange={handlePhoto} /></div>
              {preview && <img src={preview} alt="preview" className="w-32 h-32 rounded-full object-cover" />}
              <div><Label>Kort offentlig bio</Label><Textarea value={form.bio_short || ""} onChange={(e) => update("bio_short", e.target.value)} /></div>
              <div><Label>Længere intern bio</Label><Textarea value={form.bio_long || ""} onChange={(e) => update("bio_long", e.target.value)} /></div>
              <div><Label>Års erfaring med firmaevents</Label><Input type="number" value={form.corporate_experience_years || ""} onChange={(e) => update("corporate_experience_years", Number(e.target.value))} /></div>
              <div><Label>Sprog (kommasepareret)</Label><Input value={(form.languages || []).join(", ")} onChange={(e) => update("languages", e.target.value.split(",").map((s) => s.trim()))} /></div>
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
              <div><Label>Specialiteter (kommasepareret)</Label><Input value={(form.specialties || []).join(", ")} onChange={(e) => update("specialties", e.target.value.split(",").map((s) => s.trim()))} /></div>
              <div><Label>Sample mix URL</Label><Input value={form.sample_mix_url || ""} onChange={(e) => update("sample_mix_url", e.target.value)} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Udstyr og kapacitet</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_80} onCheckedChange={(v) => update("can_deliver_80", !!v)} /><Label className="font-normal">Op til 80 gæster</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_150} onCheckedChange={(v) => update("can_deliver_150", !!v)} /><Label className="font-normal">Op til 150 gæster</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.can_deliver_200} onCheckedChange={(v) => update("can_deliver_200", !!v)} /><Label className="font-normal">Op til 200 gæster</Label></div>
              </div>
              <div><Label>Lyd setup</Label><Textarea value={form.equipment_sound || ""} onChange={(e) => update("equipment_sound", e.target.value)} /></div>
              <div><Label>Lys setup</Label><Textarea value={form.equipment_lighting || ""} onChange={(e) => update("equipment_lighting", e.target.value)} /></div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><Checkbox checked={form.can_handle_speeches} onCheckedChange={(v) => update("can_handle_speeches", !!v)} /><Label className="font-normal">Kan håndtere mikrofon og taler</Label></div>
              </div>
              <div><Label>Setup område</Label><Input value={form.setup_area_description || ""} onChange={(e) => update("setup_area_description", e.target.value)} /></div>
              <div><Label>Setup tid (minutter)</Label><Input type="number" value={form.setup_time_minutes || ""} onChange={(e) => update("setup_time_minutes", Number(e.target.value))} /></div>
              <div><Label>Transport radius (km)</Label><Input type="number" value={form.transport_radius_km || ""} onChange={(e) => update("transport_radius_km", Number(e.target.value))} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Payout præferencer</h2>
              <p className="text-sm text-slate-500">Kunden ser en samlet platformpris. Dine payout-beløb bruges internt og skal godkendes af admin.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Kompakt Firmafest payout</Label><Input type="number" value={form.payout_kompakt || ""} onChange={(e) => update("payout_kompakt", Number(e.target.value))} /></div>
                <div><Label>Dinner & Party payout</Label><Input type="number" value={form.payout_dinner || ""} onChange={(e) => update("payout_dinner", Number(e.target.value))} /></div>
                <div><Label>Stor Firmafest payout</Label><Input type="number" value={form.payout_stor || ""} onChange={(e) => update("payout_stor", Number(e.target.value))} /></div>
                <div><Label>Ekstra time payout</Label><Input type="number" value={form.payout_extra_hour || ""} onChange={(e) => update("payout_extra_hour", Number(e.target.value))} /></div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tilgængelighed</h2>
              <p className="text-sm text-slate-500">Standard ugentlig tilgængelighed. Du kan opdatere detaljeret kalender under Tilgængelighed.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><Checkbox checked={form.thursday} onCheckedChange={(v) => update("thursday", !!v)} /><Label className="font-normal">Torsdag</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.friday} onCheckedChange={(v) => update("friday", !!v)} /><Label className="font-normal">Fredag</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.saturday} onCheckedChange={(v) => update("saturday", !!v)} /><Label className="font-normal">Lørdag</Label></div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Preview</h2>
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
              <p className="text-center text-sm text-slate-500">Dette er hvad kunder ser i shortlist cards.</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Tilbage</Button>
            <Button onClick={save} className="bg-slate-900 hover:bg-slate-800 text-white">{step === steps.length - 1 ? "Send til godkendelse" : "Gem og fortsæt"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
