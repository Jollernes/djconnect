import { Card, CardContent } from "@/components/ui/card";
import { getClientDashboard } from "@/lib/server";
import { formatDate } from "@/lib/format";

export default async function ClientDokumenterPage() {
  const data = await getClientDashboard();
  if (!data) return null;
  const { bookings, briefs } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dokumenter</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => {
          const brief = briefs.find((b) => b.id === booking.event_brief_id);
          return (
            <Card key={booking.id} className="border-slate-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900">{brief?.event_type} • {formatDate(brief?.event_date)}</h2>
                <p className="text-slate-500">Kontrakt, faktura og køreplan vises her, når de er tilgængelige. (Placeholder)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
