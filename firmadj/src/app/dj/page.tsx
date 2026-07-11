import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDJDashboard } from "@/lib/server";
import { formatDate, statusLabel } from "@/lib/format";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default async function DJDashboardPage() {
  const data = await getDJDashboard();
  if (!data) return null;
  const { dj, offers, bookings } = data;

  const daysSinceUpdate = dj.last_availability_update ? Math.floor((new Date().getTime() - new Date(dj.last_availability_update).getTime()) / (1000 * 60 * 60 * 24)) : 99;
  const stale = daysSinceUpdate > 14;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Velkommen, {dj.stage_name}</h1>
        <p className="text-slate-600">Her kan du se tilbud, opdatering din profil og holde styr på tilgængelighed.</p>
      </div>

      {stale && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 text-sm">Din kalender skal opdateres for at blive vist i nye match. Sidst opdateret: {daysSinceUpdate} dage siden.</p>
            <Button asChild size="sm" className="ml-auto bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/dj/availability">Opdater</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Profil fuldførelse</h2>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Profil</span>
              <span>{dj.profile_completeness_score}%</span>
            </div>
            <Progress value={dj.profile_completeness_score ?? 0} className="mb-4" />
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Tilgængelighed friskhed</span>
              <span>{dj.availability_freshness_score}%</span>
            </div>
            <Progress value={dj.availability_freshness_score ?? 0} />
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dj/profile">Rediger profil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Kommende arrangementer</h2>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-semibold text-slate-900">{statusLabel(b.status)}</div>
                      <div className="text-xs text-slate-500">{formatDate(b.event_date)}</div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dj/arrangementer/${b.id}`}>Se</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Ingen kommende arrangementer.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Nye tilbud</h2>
          {offers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.filter((o: any) => o.status === 'offered').map((o: any) => (
                <Card key={o.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="font-bold text-slate-900">{o.event_type}</div>
                    <div className="text-sm text-slate-500">{formatDate(o.event_date)} • {o.city}</div>
                    <div className="text-sm text-slate-600 mt-2">Payout: {o.payout_estimate} DKK</div>
                    <Button asChild size="sm" className="mt-3 bg-slate-900 hover:bg-slate-800 text-white">
                      <Link href={`/dj/tilbud`}>Se tilbud</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Ingen nye tilbud.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
