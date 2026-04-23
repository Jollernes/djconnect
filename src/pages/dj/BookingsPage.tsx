import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";

export function DJBookingsPage() {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "dj");
  const [tab, setTab] = useState("pending");

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const completed = bookings.filter((b) => b.status === "completed");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Bookings</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><List items={pending} loading={loading} empty="No pending requests" /></TabsContent>
        <TabsContent value="confirmed"><List items={confirmed} loading={loading} empty="No confirmed bookings" /></TabsContent>
        <TabsContent value="completed"><List items={completed} loading={loading} empty="No completed bookings" /></TabsContent>
      </Tabs>
    </div>
  );
}

function List({ items, loading, empty }: { items: ReturnType<typeof useBookings>["bookings"]; loading: boolean; empty: string }) {
  if (loading) return <div className="py-6 text-sm text-muted-foreground">Loading…</div>;
  if (items.length === 0) return <EmptyState title={empty} className="mt-4" />;
  return (
    <div className="mt-4 space-y-3">
      {items.map((b) => (
        <Card key={b.id}>
          <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{b.event_type.label} · {formatDate(b.event_date)}</div>
              <div className="text-sm text-muted-foreground">
                {b.customer.full_name} · {b.venue_name}, {b.venue_address}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={b.status} />
              <Button asChild size="sm"><Link to={`/dj/bookings/${b.id}`}>Open</Link></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
