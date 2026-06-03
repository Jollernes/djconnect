import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";

export function CustomerBookingsPage() {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "customer");
  const [tab, setTab] = useState("upcoming");

  const upcoming = bookings.filter((b) => new Date(b.event_date) >= new Date() && b.status !== "cancelled");
  const past = bookings.filter((b) => new Date(b.event_date) < new Date() || b.status === "completed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mine bookinger</h1>
        <Button asChild variant="accent"><Link to="/search">Book en ny DJ</Link></Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Kommende ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Tidligere ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Annulleret ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming"><List items={upcoming} loading={loading} empty="Ingen kommende bookinger" /></TabsContent>
        <TabsContent value="past"><List items={past} loading={loading} empty="Ingen tidligere bookinger endnu" /></TabsContent>
        <TabsContent value="cancelled"><List items={cancelled} loading={loading} empty="Ingen annullerede bookinger" /></TabsContent>
      </Tabs>
    </div>
  );
}

function List({ items, loading, empty }: { items: ReturnType<typeof useBookings>["bookings"]; loading: boolean; empty: string }) {
  if (loading) return <div className="py-6 text-sm text-muted-foreground">Indlæser…</div>;
  if (items.length === 0) return <EmptyState title={empty} className="mt-4" />;
  return (
    <div className="mt-4 space-y-3">
      {items.map((b) => (
        <Card key={b.id}>
          <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to={`/dashboard/bookings/${b.id}`} className="flex items-center gap-3">
              <img src={b.dj_profile.profile.avatar_url ?? ""} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="font-semibold">{b.dj_profile.stage_name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(b.event_date)} · {b.venue_name} · Ref {b.reference}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={b.status} />
              <Button asChild variant="outline" size="sm"><Link to={`/dashboard/bookings/${b.id}`}>Åbn</Link></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
