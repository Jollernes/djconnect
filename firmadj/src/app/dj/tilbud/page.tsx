"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { getDJByUserId, getOffersForDJ, getBookingById, getEventBriefById, respondToOffer } from "@/lib/server";
import { useEffect, useState } from "react";
import { formatDate, statusLabel } from "@/lib/format";
import { toast } from "sonner";

export default function DJTilbudPage() {
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    getSession().then(async (s) => {
      if (s) {
        const dj = await getDJByUserId(s.userId);
        if (dj) {
          const raw = await getOffersForDJ(dj.id);
          const enriched = await Promise.all(raw.map(async (o) => {
            const booking = o.booking_id ? await getBookingById(o.booking_id) : undefined;
            const brief = booking ? await getEventBriefById(booking.event_brief_id) : undefined;
            return { ...o, booking, brief };
          }));
          setOffers(enriched);
        }
      }
    });
  }, []);

  async function respond(offerId: string, status: 'accepted' | 'declined') {
    await respondToOffer(offerId, status);
    toast.success(status === 'accepted' ? "Tilbud accepteret" : "Tilbud afvist");
    setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status } : o));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tilbud</h1>
      <div className="grid gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="border-slate-200">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge className="mb-2">{offer.status}</Badge>
                <h2 className="text-lg font-bold text-slate-900">{offer.brief?.event_type || 'Event'}</h2>
                <p className="text-slate-600">{formatDate(offer.brief?.event_date)} • {offer.brief?.city} • {offer.brief?.guest_count_range} gæster</p>
                <p className="text-sm text-slate-500 mt-2">Payout: {offer.payout_estimate || 'Aftales'} DKK</p>
              </div>
              {offer.status === 'offered' ? (
                <div className="flex gap-2">
                  <Button onClick={() => respond(offer.id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white">Accepter</Button>
                  <Button onClick={() => respond(offer.id, 'declined')} variant="outline" className="border-slate-300">Afvis</Button>
                </div>
              ) : (
                <Badge variant={offer.status === 'accepted' ? 'default' : 'secondary'}>{statusLabel(offer.status)}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
        {offers.length === 0 && <p className="text-slate-500">Ingen tilbud endnu.</p>}
      </div>
    </div>
  );
}
