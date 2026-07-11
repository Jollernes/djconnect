"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getDJByUserId, getStore } from "@/lib/server";
import { useEffect, useState } from "react";
import { formatDate, statusLabel } from "@/lib/format";
import Link from "next/link";

export default function DJArrangementerPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getSession().then(async (s) => {
      if (s) {
        const [dj, store] = await Promise.all([getDJByUserId(s.userId), getStore()]);
        if (dj) {
          const bookings = store.bookings.filter((b: any) => b.selected_dj_id === dj.id || b.backup_dj_id === dj.id);
          const enriched = bookings.map((b: any) => ({ ...b, brief: store.eventBriefs.find((br: any) => br.id === b.event_brief_id) }));
          setEvents(enriched);
        }
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Kommende arrangementer</h1>
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border-slate-200">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">{statusLabel(event.status)}</div>
                <h2 className="text-lg font-bold text-slate-900">{event.brief?.event_type}</h2>
                <p className="text-slate-600">{formatDate(event.brief?.event_date)} • {event.brief?.city} • {event.brief?.guest_count_range} gæster</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dj/arrangementer/${event.id}`}>Se detaljer</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="text-slate-500">Ingen kommende arrangementer.</p>}
      </div>
    </div>
  );
}
