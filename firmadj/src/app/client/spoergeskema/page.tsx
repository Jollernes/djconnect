"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getClientDashboard, getBookingWithDetails, submitQuestionnaire } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ClientSpoergeskemaPage() {
  const [data, setData] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    getClientDashboard().then((d) => {
      setData(d);
      if (d?.bookings?.length) setSelectedBooking(d.bookings[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      getBookingWithDetails(selectedBooking).then((d) => setForm(d?.questionnaire || {}));
    }
  }, [selectedBooking]);

  if (!data) return <div className="py-12">Indlæser...</div>;

  function update(field: string, value: string) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!selectedBooking) return;
    await submitQuestionnaire(selectedBooking, form);
    toast.success("Spørgeskema gemt");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Spørgeskema</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          {data.bookings.map((b: any) => (
            <button key={b.id} onClick={() => setSelectedBooking(b.id)} className={`w-full text-left p-3 rounded-lg border ${selectedBooking === b.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className="font-semibold text-slate-900">{data.briefs.find((br: any) => br.id === b.event_brief_id)?.event_type}</div>
            </button>
          ))}
        </div>
        <Card className="md:col-span-2 border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Venue kontaktperson</Label><Input value={form.venue_contact_name || ""} onChange={(e) => update("venue_contact_name", e.target.value)} /></div>
              <div><Label>Venue telefon</Label><Input value={form.venue_contact_phone || ""} onChange={(e) => update("venue_contact_phone", e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Load-in tid</Label><Input value={form.load_in_time || ""} onChange={(e) => update("load_in_time", e.target.value)} /></div>
              <div><Label>Parkerings-/læsseinfo</Label><Input value={form.parking_info || ""} onChange={(e) => update("parking_info", e.target.value)} /></div>
            </div>
            <div><Label>Adgangsnoter</Label><Textarea value={form.access_notes || ""} onChange={(e) => update("access_notes", e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Endelig starttid</Label><Input value={form.final_start_time || ""} onChange={(e) => update("final_start_time", e.target.value)} /></div>
              <div><Label>Endelig sluttid</Label><Input value={form.final_end_time || ""} onChange={(e) => update("final_end_time", e.target.value)} /></div>
            </div>
            <div><Label>Talertider</Label><Input value={form.speech_times || ""} onChange={(e) => update("speech_times", e.target.value)} /></div>
            <div><Label>Mikrofon noter</Label><Input value={form.microphone_notes || ""} onChange={(e) => update("microphone_notes", e.target.value)} /></div>
            <div><Label>Must-play sange</Label><Textarea value={form.must_play_final || ""} onChange={(e) => update("must_play_final", e.target.value)} /></div>
            <div><Label>Do-not-play sange</Label><Textarea value={form.do_not_play_final || ""} onChange={(e) => update("do_not_play_final", e.target.value)} /></div>
            <div><Label>Dress code</Label><Input value={form.dress_code || ""} onChange={(e) => update("dress_code", e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Kontaktperson på dagen</Label><Input value={form.onsite_contact_name || ""} onChange={(e) => update("onsite_contact_name", e.target.value)} /></div>
              <div><Label>Kontaktperson telefon</Label><Input value={form.onsite_contact_phone || ""} onChange={(e) => update("onsite_contact_phone", e.target.value)} /></div>
            </div>
            <div><Label>Særlige noter</Label><Textarea value={form.special_notes || ""} onChange={(e) => update("special_notes", e.target.value)} /></div>
            <Button onClick={submit} className="bg-slate-900 hover:bg-slate-800 text-white">Gem spørgeskema</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
