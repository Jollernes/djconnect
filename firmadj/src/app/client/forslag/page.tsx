import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClientDashboard } from "@/lib/server";
import { formatDate, formatRange } from "@/lib/format";
import Link from "next/link";

export default async function ClientForslagPage() {
  const data = await getClientDashboard();
  if (!data) return null;
  const { proposals, briefs } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dine forslag</h1>
      <div className="grid gap-4">
        {proposals.map((proposal) => {
          const brief = briefs.find((b) => b.id === proposal.event_brief_id);
          return (
            <Card key={proposal.id} className="border-slate-200">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{brief?.event_type}</h2>
                  <p className="text-slate-600">{formatDate(brief?.event_date)} • {brief?.city}</p>
                  <p className="text-slate-500 text-sm">{proposal.recommendation_reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{formatRange(proposal.price_estimate_from, proposal.price_estimate_to)}</div>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href={`/proposal/${proposal.id}`}>Se forslag</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
