import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { mockBookings } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminBookingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All bookings</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Ref</th>
                <th className="p-3 font-medium">Event</th>
                <th className="p-3 font-medium">DJ</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{b.reference}</td>
                  <td className="p-3">
                    <div className="font-medium">{b.event_type.label}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(b.event_date)}</div>
                  </td>
                  <td className="p-3">{b.dj_profile.stage_name}</td>
                  <td className="p-3">{b.customer.full_name}</td>
                  <td className="p-3">{b.price_minor ? formatCurrency(b.price_minor + b.platform_fee_minor, b.currency) : "—"}</td>
                  <td className="p-3"><BookingStatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
