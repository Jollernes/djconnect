"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getProposalData } from "@/lib/server";
import { submitReservation } from "@/lib/server";
import { formatDate, formatRange, formatCurrency } from "@/lib/format";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Shield, Headphones, FileText } from "lucide-react";

export default function ReservePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;
  const selectedDjId = searchParams.get("dj");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState({ a: false, b: false, c: false });

  useEffect(() => {
    getProposalData(proposalId).then(setData);
  }, [proposalId]);

  if (!data) return <div className="py-24 text-center">Indlæser...</div>;

  const { proposal, brief, pkg, matches } = data;
  const selectedDJ = selectedDjId ? matches.find((m: any) => m.dj.id === selectedDjId) : null;
  const mode = selectedDJ ? "client_selected_dj" : "platform_selects";

  async function handleSubmit(formData: FormData) {
    if (!accepted.a || !accepted.b || !accepted.c) {
      toast.error("Accepter venligst alle vilkår");
      return;
    }
    setLoading(true);
    formData.set("proposal_id", proposalId);
    formData.set("selected_dj_id", selectedDjId || "");
    formData.set("client_choice_mode", mode);
    const result = await submitReservation(formData);
    setLoading(false);
    if (result.success) {
      toast.success("Reservationsanmodning sendt");
      router.push("/reserve/success");
    } else {
      toast.error(result.error || "Reservationsfejl");
    }
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 py-12 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reservationsanmodning</h1>
          <p className="text-slate-600 mb-8">Gennemgå detaljerne og send en foreløbig reservation.</p>

          <Card className="border-slate-200 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Event summary</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-700">
                <div><span className="text-slate-500">Virksomhed:</span> {brief?.company_name || '-'}</div>
                <div><span className="text-slate-500">Dato:</span> {formatDate(brief?.event_date)}</div>
                <div><span className="text-slate-500">Sted:</span> {brief?.city}{brief?.venue_name ? `, ${brief.venue_name}` : ''}</div>
                <div><span className="text-slate-500">Gæster:</span> {brief?.guest_count_range}</div>
                <div><span className="text-slate-500">Pakke:</span> {pkg?.name}</div>
                <div><span className="text-slate-500">Valg:</span> {selectedDJ ? `Vælg selv: ${selectedDJ.dj.public_display_name}` : 'Lad os vælge det bedste match'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Prisoverslag</h2>
                <div className="text-2xl font-bold text-slate-900">{formatRange(proposal?.price_estimate_from, proposal?.price_estimate_to)}</div>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {pkg?.name}</li>
                {pkg?.sound_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lyd inkluderet</li>}
                {pkg?.lighting_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lys inkluderet</li>}
                {pkg?.microphone_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Mikrofon inkluderet</li>}
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" /> Backup-garanti</li>
              </ul>
              <p className="text-xs text-slate-500 mt-4">{proposal?.vat_note}</p>
            </CardContent>
          </Card>

          <form action={handleSubmit} className="space-y-6">
            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Kontaktoplysninger</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Navn</Label><Input name="contact_name" defaultValue={brief?.contact_name} required /></div>
                  <div><Label>Email</Label><Input name="contact_email" type="email" defaultValue={brief?.contact_email} required /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Faktura email (valgfri)</Label><Input name="invoice_email" type="email" /></div>
                  <div><Label>CVR nummer (valgfri)</Label><Input name="cvr" /></div>
                </div>
                <div><Label>Ekstra bemærkninger</Label><Input name="notes" placeholder="Eventuelle særlige ønsker" /></div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Bekræft følgende</h2>
                <div className="flex items-start gap-3">
                  <Checkbox checked={accepted.a} onCheckedChange={(v) => setAccepted((p) => ({ ...p, a: !!v }))} />
                  <Label className="font-normal text-slate-600">Jeg forstår, at dette er en foreløbig reservation indtil endelig bekræftelse.</Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={accepted.b} onCheckedChange={(v) => setAccepted((p) => ({ ...p, b: !!v }))} />
                  <Label className="font-normal text-slate-600">Jeg accepterer, at platformen kan erstatte DJ med en lige så kvalificeret DJ ved sygdom eller nødsituation.</Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox checked={accepted.c} onCheckedChange={(v) => setAccepted((p) => ({ ...p, c: !!v }))} />
                  <Label className="font-normal text-slate-600">Jeg forstår, at priser vises eksklusiv moms.</Label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading || !accepted.a || !accepted.b || !accepted.c} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
              {loading ? "Sender..." : "Send reservationsanmodning"}
            </Button>
          </form>

          <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Næste skridt</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>1. Vi gennemgår tilgængelighed og tekniske detaljer</li>
              <li>2. I modtager endelig bekræftelse eller eventuelle spørgsmål</li>
              <li>3. Kontrakt og faktura/depositum sendes</li>
              <li>4. Det endelige event spørgeskema udfyldes</li>
              <li>5. Køreplan og teknik bekræftes før arrangementet</li>
            </ul>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
