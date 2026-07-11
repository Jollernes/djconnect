import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientDashboard, getBookingWithDetails } from "@/lib/server";
import { formatDate, statusLabel, bookingTimeline } from "@/lib/format";
import Link from "next/link";
import { Calendar, MessageSquare, FileText, RefreshCw } from "lucide-react";

export default async function ClientDashboardPage() {
  const data = await getClientDashboard();
  if (!data) return null;

  const { user, briefs, bookings, proposals } = data;
  const upcomingBooking = bookings.find((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const latestProposal = proposals[proposals.length - 1];

  const timelineIndex = bookingTimeline.findIndex((t) => t.key === upcomingBooking?.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Velkommen, {user.name}</h1>
        <p className="text-slate-600">Her kan du følge dit kommende arrangement, se forslag og kommunikere med os.</p>
      </div>

      {upcomingBooking ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge className="mb-2">Kommende event</Badge>
                <h2 className="text-xl font-bold text-slate-900">{upcomingBooking?.status ? statusLabel(upcomingBooking.status) : 'Event'}</h2>
                <p className="text-slate-600">{formatDate(briefs.find((b) => b.id === upcomingBooking.event_brief_id)?.event_date)}</p>
              </div>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                <Link href={`/client/arrangementer/${upcomingBooking.id}`}>Se eventdetaljer</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <p className="text-slate-600">Ingen kommende events. <Link href="/brief" className="text-amber-600 font-semibold">Opret en brief</Link></p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status tidslinje</h2>
            <div className="space-y-4">
              {bookingTimeline.map((t, i) => {
                const active = i <= (timelineIndex === -1 ? 0 : timelineIndex);
                return (
                  <div key={t.key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-amber-500' : 'bg-slate-200'}`} />
                    <span className={`text-sm ${active ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{t.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Seneste forslag</h2>
            {latestProposal ? (
              <div>
                <p className="text-slate-700 mb-2">{latestProposal.recommendation_reason}</p>
                <p className="text-sm text-slate-500 mb-4">{formatDate(briefs.find((b) => b.id === latestProposal.event_brief_id)?.event_date)}</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/proposal/${latestProposal.id}`}>Se forslag</Link>
                </Button>
              </div>
            ) : (
              <p className="text-slate-500">Ingen forslag endnu.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/brief"><Calendar className="w-4 h-4" /> Ny brief</Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/client/beskeder"><MessageSquare className="w-4 h-4" /> Beskeder</Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/client/spoergeskema"><FileText className="w-4 h-4" /> Spørgeskema</Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/client/genbook"><RefreshCw className="w-4 h-4" /> Genbook</Link>
        </Button>
      </div>
    </div>
  );
}
