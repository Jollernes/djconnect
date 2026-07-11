import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { submitDJApplication } from "@/lib/server";
import { redirect } from "next/navigation";

export default function DJPartnerPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    await submitDJApplication(formData);
    redirect("/bliv-dj-partner?success=1");
  }

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Bliv en del af et kurateret netværk for professionelle firmafest-DJs</h1>
          <p className="text-slate-300">Vi arbejder med DJs, der kan levere pålidelige corporate events, kommunikere professionelt, holde tilgængelighed opdateret og arbejde inden for standardiserede pakker.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-slate-200">
            <CardContent className="p-6 sm:p-8">
              <form action={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="stage_name">Stage navn</Label><Input id="stage_name" name="stage_name" required /></div>
                  <div><Label htmlFor="legal_name">Juridisk navn</Label><Input id="legal_name" name="legal_name" required /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
                  <div><Label htmlFor="phone">Telefon</Label><Input id="phone" name="phone" required /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="city">By</Label><Input id="city" name="city" required /></div>
                  <div><Label htmlFor="regions">Dækning (kommasepareret)</Label><Input id="regions" name="regions" placeholder="København, Aarhus, Fyn" required /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="cvr">CVR (valgfri)</Label><Input id="cvr" name="cvr" /></div>
                  <div><Label htmlFor="years_experience">Års erfaring</Label><Input id="years_experience" name="years_experience" type="number" min="0" /></div>
                </div>
                <div>
                  <Label htmlFor="corporate_event_experience">Erfaring med firmaevents</Label>
                  <Textarea id="corporate_event_experience" name="corporate_event_experience" placeholder="Beskriv dine erfaringer med firmafester, julefrokoster, sommerfester etc." />
                </div>
                <div>
                  <Label htmlFor="equipment_owned">Udstyr</Label>
                  <Textarea id="equipment_owned" name="equipment_owned" placeholder="Hvilken lyd, lys og mikrofon har du?" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Kan du levere</Label>
                  <div className="flex items-center gap-2"><Checkbox id="can_provide_sound" name="can_provide_sound" /><Label htmlFor="can_provide_sound" className="font-normal">Lyd</Label></div>
                  <div className="flex items-center gap-2"><Checkbox id="can_provide_lighting" name="can_provide_lighting" /><Label htmlFor="can_provide_lighting" className="font-normal">Lys</Label></div>
                  <div className="flex items-center gap-2"><Checkbox id="can_handle_microphone" name="can_handle_microphone" /><Label htmlFor="can_handle_microphone" className="font-normal">Mikrofon og taler</Label></div>
                </div>
                <div>
                  <Label htmlFor="languages">Sprog (kommasepareret)</Label>
                  <Input id="languages" name="languages" placeholder="Dansk, Engelsk" />
                </div>
                <div>
                  <Label htmlFor="music_strengths">Musikstyrker (kommasepareret)</Label>
                  <Input id="music_strengths" name="music_strengths" placeholder="Disco, funk, moderne pop, 80'er" />
                </div>
                <div>
                  <Label htmlFor="sample_mix_url">Sample mix URL</Label>
                  <Input id="sample_mix_url" name="sample_mix_url" type="url" placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="references_text">Referencer</Label>
                  <Textarea id="references_text" name="references_text" placeholder="Fiktive eller anonymiserede referencer" />
                </div>
                <div>
                  <Label htmlFor="short_bio">Kort bio</Label>
                  <Textarea id="short_bio" name="short_bio" placeholder="Fortæl kort om dig selv" />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="commitment" name="commitment" required />
                  <Label htmlFor="commitment" className="font-normal">Jeg forpligter mig til at opdatere min tilgængelighed mindst hver 14. dag.</Label>
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">Send ansøgning</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
