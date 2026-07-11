"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { submitBrief } from "@/lib/server";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const steps = [
  "Eventtype",
  "Dato & tid",
  "Lokation",
  "Gæster",
  "Teknik",
  "Vibe & musik",
  "Budget",
  "Succes",
  "Kontakt",
];

export default function BriefPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="py-24 text-center text-slate-500">Indlæser...</div>}>
        <BriefForm />
      </Suspense>
    </PublicLayout>
  );
}

function BriefForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    event_type: params.get("event_type") || "",
    event_date: params.get("date") || "",
    city: params.get("city") || "",
    guest_count_range: params.get("guests") || "",
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: string, value: string) {
    setForm((prev) => {
      const arr = (prev[field] || []) as string[];
      if (arr.includes(value)) return { ...prev, [field]: arr.filter((v) => v !== value) };
      return { ...prev, [field]: [...arr, value] };
    });
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.delete(key);
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.set(key, value || "");
      }
    });
    const result = await submitBrief(formData);
    setLoading(false);
    if (result.success && result.proposalId) {
      toast.success("Brief indsendt!");
      router.push(`/proposal/${result.proposalId}`);
    } else {
      toast.error(result.error || "Kunne ikke indsende brief");
    }
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvilken type event holder I?</h2>
            <RadioGroup value={form.event_type} onValueChange={(v) => update("event_type", v)} className="grid sm:grid-cols-2 gap-3">
              {["Firmafest", "Julefrokost", "Sommerfest", "Middag og efterfest", "Kick-off", "Jubilæum", "Reception", "Andet firmaarrangement"].map((type) => (
                <div key={type} className={`border rounded-xl p-4 cursor-pointer transition ${form.event_type === type ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <RadioGroupItem value={type} id={type} className="sr-only" />
                  <Label htmlFor={type} className="font-semibold cursor-pointer">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Dato og tidspunkt</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Dato</Label><Input type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} /></div>
              <div><Label>Starttid</Label><Input type="time" value={form.start_time || ""} onChange={(e) => update("start_time", e.target.value)} /></div>
            </div>
            <div><Label>Forventet sluttid</Label><Input type="time" value={form.end_time || ""} onChange={(e) => update("end_time", e.target.value)} /></div>
            <div><Label>Datoens status</Label>
              <Select value={form.date_flexibility} onValueChange={(v) => update("date_flexibility", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fast dato">Fast dato</SelectItem>
                  <SelectItem value="Muligvis fleksibel">Muligvis fleksibel</SelectItem>
                  <SelectItem value="Ikke besluttet endnu">Ikke besluttet endnu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvor skal eventet holdes?</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>By</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="F.eks. København" /></div>
              <div><Label> Venue navn (valgfri)</Label><Input value={form.venue_name || ""} onChange={(e) => update("venue_name", e.target.value)} placeholder=" Venue" /></div>
            </div>
            <div><Label> Venue status</Label>
              <Select value={form.venue_status} onValueChange={(v) => update("venue_status", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vi har booket venue">Vi har booket venue</SelectItem>
                  <SelectItem value="Vi er tæt på at booke venue">Vi er tæt på at booke venue</SelectItem>
                  <SelectItem value="Vi mangler stadig venue">Vi mangler stadig venue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Region</Label>
              <Select value={form.region} onValueChange={(v) => update("region", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="København / Sjælland">København / Sjælland</SelectItem>
                  <SelectItem value="Fyn">Fyn</SelectItem>
                  <SelectItem value="Aarhus / Østjylland">Aarhus / Østjylland</SelectItem>
                  <SelectItem value="Aalborg / Nordjylland">Aalborg / Nordjylland</SelectItem>
                  <SelectItem value="Sydjylland">Sydjylland</SelectItem>
                  <SelectItem value="Hele Danmark / andet">Hele Danmark / andet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvor mange gæster?</h2>
            <RadioGroup value={form.guest_count_range} onValueChange={(v) => update("guest_count_range", v)} className="grid sm:grid-cols-2 gap-3">
              {["Under 50", "50 to 80", "80 to 150", "150 to 200", "200+", "Not sure"].map((range) => (
                <div key={range} className={`border rounded-xl p-4 cursor-pointer transition ${form.guest_count_range === range ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <RadioGroupItem value={range} id={range} className="sr-only" />
                  <Label htmlFor={range} className="font-semibold cursor-pointer">{range === "200+" ? "200+" : range === "Not sure" ? "Ikke sikker" : range}</Label>
                </div>
              ))}
            </RadioGroup>
            {form.guest_count_range === "200+" && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">Større firmaevents kræver typisk en kort teknisk vurdering. I kan stadig sende briefen, og vi vender tilbage med den rette løsning.</p>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvad har I brug for?</h2>
            {[
              { key: "needs_sound", label: "Lydanlæg" },
              { key: "needs_lighting", label: "Dansebelysning" },
              { key: "needs_microphone", label: "Mikrofon til taler" },
              { key: "needs_dinner_music", label: "Middags- eller baggrundsmusik" },
              { key: "needs_venue_coordination", label: "Hjælp til koordinering med venue" },
            ].map((q) => (
              <div key={q.key} className="border rounded-xl p-4">
                <Label className="font-semibold block mb-2">{q.label}</Label>
                <RadioGroup value={form[q.key]} onValueChange={(v) => update(q.key, v)} className="flex gap-4">
                  {["Ja", "Nej", "Ikke sikker"].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`${q.key}-${v}`} />
                      <Label htmlFor={`${q.key}-${v}`} className="font-normal">{v}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvilken stemning skal musikken skabe?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Elegant middag først, fest senere", "Bred firmafest for alle aldre", "Julefrokost med singalong og klassikere", "Moderne dance/pop", "Disco, funk og 80’er/90’er", "Internationalt publikum", "Rolig lounge og baggrund", "High-energy dansegulv", "Andet"].map((tag) => (
                <div key={tag} className={`border rounded-xl p-4 cursor-pointer transition ${(form.music_vibe_tags || []).includes(tag) ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`} onClick={() => toggleArray("music_vibe_tags", tag)}>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={(form.music_vibe_tags || []).includes(tag)} onCheckedChange={() => toggleArray("music_vibe_tags", tag)} />
                    <Label className="font-semibold cursor-pointer">{tag}</Label>
                  </div>
                </div>
              ))}
            </div>
            <div><Label>Must-play sange</Label><Textarea value={form.must_play || ""} onChange={(e) => update("must_play", e.target.value)} placeholder="F.eks. Dancing Queen, Last Christmas" /></div>
            <div><Label>Do-not-play sange</Label><Textarea value={form.do_not_play || ""} onChange={(e) => update("do_not_play", e.target.value)} placeholder="F.eks. Hård techno" /></div>
            <div><Label>Foretrukket sprog</Label>
              <Select value={form.language_preference} onValueChange={(v) => update("language_preference", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dansk">Dansk</SelectItem>
                  <SelectItem value="Engelsk">Engelsk</SelectItem>
                  <SelectItem value="Begge">Begge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvad er budgettet?</h2>
            <RadioGroup value={form.budget_band} onValueChange={(v) => update("budget_band", v)} className="grid sm:grid-cols-2 gap-3">
              {["8.000 to 12.000 DKK", "12.000 to 18.000 DKK", "18.000 to 25.000 DKK", "25.000+ DKK", "Ikke sikker"].map((b) => (
                <div key={b} className={`border rounded-xl p-4 cursor-pointer transition ${form.budget_band === b ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <RadioGroupItem value={b} id={b} className="sr-only" />
                  <Label htmlFor={b} className="font-semibold cursor-pointer">{b}</Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-slate-500">Vi bruger budgettet til at anbefale en realistisk løsning. Prisen låses først, når tekniske behov og transport er bekræftet.</p>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Hvad skal være lykkedes?</h2>
            <p className="text-slate-600">Hvad skal være lykkedes, for at I bagefter siger: det fungerede virkelig godt?</p>
            <Textarea value={form.success_description || ""} onChange={(e) => update("success_description", e.target.value)} placeholder="Fx at middagen føles professionel, at dansegulvet kommer i gang efter talerne, og at musikken passer til både unge og ældre medarbejdere." className="min-h-[160px]" />
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Dine kontaktoplysninger</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Navn</Label><Input value={form.contact_name || ""} onChange={(e) => update("contact_name", e.target.value)} required /></div>
              <div><Label>Firma</Label><Input value={form.company_name || ""} onChange={(e) => update("company_name", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.contact_email || ""} onChange={(e) => update("contact_email", e.target.value)} required /></div>
              <div><Label>Telefon (valgfri)</Label><Input value={form.contact_phone || ""} onChange={(e) => update("contact_phone", e.target.value)} /></div>
            </div>
            <div><Label>Din rolle</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Office manager">Office manager</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                  <SelectItem value="Event committee">Event committee</SelectItem>
                  <SelectItem value="Founder/management">Founder/management</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="bg-slate-50 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Trin {step + 1} af {steps.length}</span>
            <span className="text-sm font-medium text-slate-500">{steps[step]}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-6 sm:p-8">
            <form action={handleSubmit} className="min-h-[400px]">
              {renderStep()}

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Tilbage
                </Button>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="bg-slate-900 hover:bg-slate-800 text-white">
                    Næste <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                    {loading ? "Indsender..." : "Se anbefalet løsning"} <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
