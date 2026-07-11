import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBookingWithDetails } from "@/lib/server";
import { formatDate, statusLabel, formatCurrency } from "@/lib/format";
import { notFound } from "next/navigation";

export default async function ClientBookingDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const id = typeof (params as any).then === 'function' ? (await params).id : (params as { id: string }).id;
  const data = await getBookingWithDetails(id);
  if (!data) notFound();
  const { booking, brief, pkg, selectedDJ, backupDJ, messages, questionnaire, runSheet, documents } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{brief?.event_type}</h1>
        <Badge>{statusLabel(booking.status)}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Event summary</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-500">Dato:</span> {formatDate(brief?.event_date)}</p>
              <p><span className="text-slate-500">Sted:</span> {brief?.city}{brief?.venue_name ? `, ${brief.venue_name}` : ''}</p>
              <p><span className="text-slate-500">Gæster:</span> {brief?.guest_count_range}</p>
              <p><span className="text-slate-500">Tid:</span> {brief?.start_time} - {brief?.end_time}</p>
              <p><span className="text-slate-500">Pakke:</span> {pkg?.name}</p>
              <p><span className="text-slate-500">DJ:</span> {selectedDJ ? selectedDJ.public_display_name : 'DJ bekræftes af platformen'}</p>
              {backupDJ && <p><span className="text-slate-500">Backup DJ:</span> {backupDJ.public_display_name}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Prisoverslag</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-500">Pris:</span> {formatCurrency(booking.final_price)}</p>
              <p><span className="text-slate-500">Moms:</span> {formatCurrency(booking.vat_amount)}</p>
              <p><span className="text-slate-500">Transport:</span> {formatCurrency(booking.travel_fee)}</p>
              <p><span className="text-slate-500">Teknisk tillæg:</span> {formatCurrency(booking.technical_surcharge)}</p>
              <p><span className="text-slate-500">Rabat:</span> {formatCurrency(booking.discount)}</p>
              <p><span className="text-slate-500">Kontrakt:</span> {booking.contract_status}</p>
              <p><span className="text-slate-500">Faktura:</span> {booking.invoice_status}</p>
              <p><span className="text-slate-500">Betaling:</span> {booking.payment_status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Spørgeskema</h2>
          {questionnaire ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-500">Load-in:</span> {questionnaire.load_in_time}</p>
              <p><span className="text-slate-500">Parkering:</span> {questionnaire.parking_info}</p>
              <p><span className="text-slate-500">DJ start:</span> {questionnaire.final_start_time}</p>
              <p><span className="text-slate-500">Taler:</span> {questionnaire.speech_times}</p>
              <p><span className="text-slate-500">Must-play:</span> {questionnaire.must_play_final}</p>
              <p><span className="text-slate-500">Do-not-play:</span> {questionnaire.do_not_play_final}</p>
              <p><span className="text-slate-500">Dresscode:</span> {questionnaire.dress_code}</p>
            </div>
          ) : (
            <p className="text-slate-500">Spørgeskema ikke udfyldt endnu. <a href="/client/spoergeskema" className="text-amber-600 font-semibold">Udfyld her</a></p>
          )}
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
              <p><span className="text-slate-500">Kontakt:</span> {runSheet.onsite_contact}</p>
            </div>
          ) : (
            <p className="text-slate-500">Køreplanen er ikke klar endnu.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Dokumenter</h2>
          {documents.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {documents.map((d) => (
                <li key={d.id}><a href={d.url || '#'} className="text-amber-600 hover:underline">{d.title} ({d.type}) - {d.status}</a></li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Ingen dokumenter endnu.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
