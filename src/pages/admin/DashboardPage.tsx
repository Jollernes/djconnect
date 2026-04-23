import { Link } from "react-router-dom";
import { ShieldCheck, Users, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockBookings, mockDJs, mockPendingVerifications } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function AdminDashboardPage() {
  const totalBookingsValue = mockBookings.reduce((s, b) => s + (b.price_minor ?? 0), 0);
  const totalFees = mockBookings.reduce((s, b) => s + b.platform_fee_minor, 0);
  const pendingPayouts = mockBookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.payout_minor, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin overview</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={<ShieldCheck />} label="Pending verifications" value={mockPendingVerifications.length.toString()} href="/admin/verification" />
        <Stat icon={<Users />} label="Verified DJs" value={mockDJs.length.toString()} href="/admin/users" />
        <Stat icon={<Calendar />} label="Bookings" value={mockBookings.length.toString()} href="/admin/bookings" />
        <Stat icon={<DollarSign />} label={`Revenue (${PLATFORM_FEE_PERCENT}%)`} value={formatCurrency(totalFees, "DKK")} href="/admin/financials" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Pending DJ verifications</h2>
              <Link to="/admin/verification" className="text-sm text-accent underline">View all</Link>
            </div>
            {mockPendingVerifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Queue is empty.</p>
            ) : (
              <div className="space-y-2">
                {mockPendingVerifications.map((d) => (
                  <Link key={d.id} to={`/admin/verification/${d.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/40">
                    <div>
                      <div className="font-medium">{d.stage_name}</div>
                      <div className="text-xs text-muted-foreground">Submitted {formatDate(d.submitted_at ?? d.created_at)}</div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Financial summary</h2>
              <Link to="/admin/financials" className="text-sm text-accent underline">View all</Link>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Gross booking value">{formatCurrency(totalBookingsValue, "DKK")}</Row>
              <Row label={`Platform fees (${PLATFORM_FEE_PERCENT}%)`}>{formatCurrency(totalFees, "DKK")}</Row>
              <Row label="Pending DJ payouts">{formatCurrency(pendingPayouts, "DKK")}</Row>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent activity</h2>
          </div>
          <div className="space-y-2 text-sm">
            {mockBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <span>{b.customer.full_name} booked {b.dj_profile.stage_name}</span>
                <span className="text-muted-foreground">{formatDate(b.created_at)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <Link to={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">{icon}</span>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
