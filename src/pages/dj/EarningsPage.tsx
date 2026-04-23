import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DJEarningsPage() {
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, "dj");

  const completed = bookings.filter((b) => b.status === "completed");
  const upcoming = bookings.filter((b) => b.status === "confirmed");

  const totalEarned = completed.reduce((s, b) => s + b.payout_minor, 0);
  const pending = upcoming.reduce((s, b) => s + b.payout_minor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <Button variant="outline" asChild>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">Open Stripe dashboard</a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total earned" value={formatCurrency(totalEarned, "DKK")} />
        <StatCard label="Pending payouts" value={formatCurrency(pending, "DKK")} />
        <StatCard label="Completed events" value={completed.length.toString()} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Payout history</h2>
        <div className="divide-y rounded-xl border bg-card">
          {[...completed, ...upcoming].map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{b.event_type.label} · {formatDate(b.event_date)}</div>
                <div className="text-xs text-muted-foreground">Ref {b.reference}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(b.payout_minor, b.currency)}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.status === "completed" ? "Released" : "Scheduled"}
                  </div>
                </div>
                <Badge variant={b.status === "completed" ? "success" : "warning"}>
                  {b.status === "completed" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
          {completed.length + upcoming.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No payouts yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
