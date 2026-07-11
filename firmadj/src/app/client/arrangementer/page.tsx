import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientDashboard, getBookingWithDetails } from "@/lib/server";
import { formatDate, statusLabel, formatCurrency } from "@/lib/format";
import Link from "next/link";

export default async function ClientArrangementerPage() {
  const data = await getClientDashboard();
  if (!data) return null;
  const { bookings, briefs } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dine arrangementer</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => {
          const brief = briefs.find((b) => b.id === booking.event_brief_id);
          return (
            <Card key={booking.id} className="border-slate-200">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Badge className="mb-2">{statusLabel(booking.status)}</Badge>
                  <h2 className="text-lg font-bold text-slate-900">{brief?.event_type}</h2>
                  <p className="text-slate-600">{formatDate(brief?.event_date)} • {brief?.city} • {brief?.guest_count_range} gæster</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{formatCurrency(booking.final_price)}</div>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href={`/client/arrangementer/${booking.id}`}>Se detaljer</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {bookings.length === 0 && <p className="text-slate-500">Ingen arrangementer endnu. <Link href="/brief" className="text-amber-600 font-semibold">Opret en brief</Link></p>}
      </div>
    </div>
  );
}
