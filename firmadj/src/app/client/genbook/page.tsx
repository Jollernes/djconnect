"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientDashboard, rebookPreviousBooking } from "@/lib/server";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ClientGenbookPage() {
  const [data, setData] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    getClientDashboard().then((d) => {
      setData(d);
      if (d?.bookings?.length) setSelectedBooking(d.bookings[0].id);
    });
  }, []);

  if (!data) return <div className="py-12">Indlæser...</div>;

  function update(field: string, value: string) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!selectedBooking) return;
    const booking = data.bookings.find((b: any) => b.id === selectedBooking);
    const brief = data.briefs.find((br: any) => br.id === booking.event_brief_id);
    const result = await rebookPreviousBooking(
      selectedBooking,
      form.date || brief?.event_date,
      form.guest_count_range || brief?.guest_count_range,
      form.city || brief?.city,
      form.venue || brief?.venue_name,
      form.vibe || (brief?.music_vibe_tags?.[0] || '')
    );
    if (result.success && result.proposalId) {
      toast.success("Genbooking oprettet");
      router.push(`/proposal/${result.proposalId}`);
    } else {
      toast.error(result.error || "Genbooking fejlede");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Genbook samme type arrangement</h1>
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
              <div><Label>Ny dato</Label><Input type="date" value={form.date || ""} onChange={(e) => update("date", e.target.value)} /></div>
              <div><Label>By</Label><Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Antal gæster</Label>
                <Select value={form.guest_count_range} onValueChange={(v) => update("guest_count_range", v)}>
                  <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under 50">Under 50</SelectItem>
                    <SelectItem value="50 to 80">50 - 80</SelectItem>
                    <SelectItem value="80 to 150">80 - 150</SelectItem>
                    <SelectItem value="150 to 200">150 - 200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label> Venue</Label><Input value={form.venue || ""} onChange={(e) => update("venue", e.target.value)} /></div>
            </div>
            <div><Label>Ny vibe</Label>
              <Select value={form.vibe} onValueChange={(v) => update("vibe", v)}>
                <SelectTrigger><SelectValue placeholder="Vælg" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bred firmafest for alle aldre">Bred firmafest for alle aldre</SelectItem>
                  <SelectItem value="Julefrokost med singalong og klassikere">Julefrokost med singalong og klassikere</SelectItem>
                  <SelectItem value="Moderne dance/pop">Moderne dance/pop</SelectItem>
                  <SelectItem value="High-energy dansegulv">High-energy dansegulv</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">Genbook</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
