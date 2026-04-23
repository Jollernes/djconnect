import { Card, CardContent } from "@/components/ui/card";
import { mockBookings } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function AdminFinancialsPage() {
  const gross = mockBookings.reduce((s, b) => s + (b.price_minor ?? 0) + b.platform_fee_minor, 0);
  const fees = mockBookings.reduce((s, b) => s + b.platform_fee_minor, 0);
  const paidOut = mockBookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.payout_minor, 0);
  const pending = mockBookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.payout_minor, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financials</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Gross booking value" value={formatCurrency(gross, "DKK")} />
        <Stat label={`Platform revenue (${PLATFORM_FEE_PERCENT}%)`} value={formatCurrency(fees, "DKK")} />
        <Stat label="Paid out to DJs" value={formatCurrency(paidOut, "DKK")} />
        <Stat label="Pending payouts" value={formatCurrency(pending, "DKK")} />
      </div>
      <p className="text-sm text-muted-foreground">
        Hook up Stripe reports + webhooks for real-time data once Stripe is configured in production.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
