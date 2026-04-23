import { Link } from "react-router-dom";
import { Calendar, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { daysUntil, formatDate } from "@/lib/utils";

export function CustomerDashboardPage() {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "customer");

  const upcoming = bookings.filter((b) => new Date(b.event_date) >= new Date() && b.status !== "cancelled");
  const nextBooking = upcoming[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.full_name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Here's what's coming up.</p>
      </div>

      {nextBooking ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={nextBooking.dj_profile.equipment_photos[0]?.url ?? nextBooking.dj_profile.profile.avatar_url ?? ""}
                alt=""
                className="h-14 w-14 rounded-md object-cover"
              />
              <div>
                <div className="text-xs text-muted-foreground">Next event</div>
                <div className="text-lg font-semibold">{nextBooking.dj_profile.stage_name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(nextBooking.event_date)} · {nextBooking.venue_name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <BookingStatusBadge status={nextBooking.status} />
                <div className="mt-1 text-xs text-muted-foreground">
                  in {daysUntil(nextBooking.event_date)} days
                </div>
              </div>
              <Button asChild>
                <Link to={`/dashboard/bookings/${nextBooking.id}`}>Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        !loading && (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No upcoming bookings"
            description="Browse verified DJs and book your next event."
            action={<Button asChild variant="accent"><Link to="/search">Browse DJs</Link></Button>}
          />
        )
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard icon={<Calendar />} label="My bookings" href="/dashboard/bookings" value={bookings.length} />
        <QuickLinkCard icon={<Heart />} label="Favourites" href="/dashboard/favourites" value={0} />
        <QuickLinkCard icon={<MessageSquare />} label="Messages" href="/dashboard/bookings" value={0} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent bookings</h2>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings yet" />
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {bookings.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                to={`/dashboard/bookings/${b.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.dj_profile.profile.avatar_url ?? ""}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{b.dj_profile.stage_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(b.event_date)} · {b.venue_name}
                    </div>
                  </div>
                </div>
                <BookingStatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickLinkCard({ icon, label, href, value }: { icon: React.ReactNode; label: string; href: string; value: number }) {
  return (
    <Link to={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">{icon}</span>
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
