"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBookingWithDetails } from "@/lib/server";
import { formatDate, statusLabel } from "@/lib/format";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DJArrangementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getBookingWithDetails(id).then(setData);
  }, [id]);

  if (!data) return <div className="py-12">Indlæser...</div>;
  const { booking, brief, pkg, runSheet } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{brief?.event_type}</h1>
      <Badge>{statusLabel(booking.status)}</Badge>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Eventdetaljer</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="text-slate-500">Dato:</span> {formatDate(brief?.event_date)}</p>
            <p><span className="text-slate-500">Sted:</span> {brief?.city}{brief?.venue_name ? `, ${brief.venue_name}` : ''}</p>
            <p><span className="text-slate-500">Gæster:</span> {brief?.guest_count_range}</p>
            <p><span className="text-slate-500">Tid:</span> {brief?.start_time} - {brief?.end_time}</p>
            <p><span className="text-slate-500">Pakke:</span> {pkg?.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Køreplan</h2>
          {runSheet ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-500">Load-in:</span> {runSheet.load_in_time}</p>
              <p><span className="text-slate-500">Soundcheck:</span> {runSheet.soundcheck_time}</p>
              <p><span className="text-slate-500">Middag:</span> {runSheet.dinner_start}</p>
              <p><span className="text-slate-500">Taler:</span> {runSheet.speeches}</p>
              <p><span className="text-slate-500">DJ start:</span> {runSheet.dj_start}</p>
              <p><span className="text-slate-500">Slut:</span> {runSheet.event_end}</p>
              <p><span className="text-slate-500">Kontaktperson:</span> {runSheet.onsite_contact}</p>
              <p><span className="text-slate-500">Dress code:</span> {runSheet.dress_code}</p>
              <p><span className="text-slate-500">Tekniske noter:</span> {runSheet.technical_notes}</p>
            </div>
          ) : (
            <p className="text-slate-500">Køreplan ikke klar endnu.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
