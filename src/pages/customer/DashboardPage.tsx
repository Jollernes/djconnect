import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Calendar, Heart, MessageSquare, Music, Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { daysUntil, formatDate } from "@/lib/utils";
import { getCustomerType } from "@/lib/customerType";

function diffParts(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

export function CustomerDashboardPage() {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "customer");
  const customerType = getCustomerType(profile);

  const upcoming = bookings.filter(
    (b) => new Date(b.event_date) >= new Date() && b.status !== "cancelled",
  );
  const nextBooking = upcoming[0];
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const targetDate = nextBooking
    ? new Date(`${nextBooking.event_date}T${nextBooking.start_time || "18:00"}:00`)
    : null;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!targetDate) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (customerType === "private") {
    if (loading) {
      return <div className="text-sm text-muted-foreground">Loading…</div>;
    }
    const featured = upcoming[0] ?? bookings[0];
    if (featured) {
      return <Navigate to={`/dashboard/bookings/${featured.id}`} replace />;
    }
    return (
      <EmptyState
        icon={<Music className="h-8 w-8" />}
        title="No event planned yet"
        description="Browse verified mobile-disco DJs and book the one who fits your night."
        action={
          <Button asChild variant="accent">
            <Link to="/search">Browse DJs</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {profile?.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.company_name
              ? `${profile.company_name} · here's what's coming up across your team's events.`
              : "Here's what's coming up."}
          </p>
        </div>
        {profile?.company_name && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Corporate workspace
          </span>
        )}
      </div>

      {nextBooking && targetDate ? (
        <Link
          to={`/dashboard/bookings/${nextBooking.id}`}
          className="group block overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl transition-shadow hover:shadow-2xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_55%)]" />
            <div className="absolute -right-12 -top-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative grid gap-5 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="uppercase tracking-[0.2em] text-white/65">Your next event</span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={nextBooking.dj_profile.profile.avatar_url ?? ""}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="text-xl font-semibold">{nextBooking.dj_profile.stage_name}</div>
                    <div className="text-sm text-white/75">
                      {formatDate(nextBooking.event_date)} · {nextBooking.venue_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookingStatusBadge status={nextBooking.status} />
                  <span className="text-white/65">
                    {daysUntil(nextBooking.event_date)} days away
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
                <div className="text-center text-[10px] uppercase tracking-wider text-white/55">
                  Showtime in
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
                  {Object.entries(diffParts(targetDate, now)).map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/10 p-2 ring-1 ring-white/10">
                      <div className="font-mono text-xl font-semibold tabular-nums">
                        {String(value).padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-white/55">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-xs text-white/70 transition-colors group-hover:text-white">
                  Open booking dashboard →
                </div>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        !loading && (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No upcoming bookings"
            description="Browse verified DJs and book your next event."
            action={
              <Button asChild variant="accent">
                <Link to="/search">Browse DJs</Link>
              </Button>
            }
          />
        )
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <QuickLinkCard
          icon={<Calendar />}
          label="Bookings"
          href="/dashboard/bookings"
          value={bookings.length}
        />
        <QuickLinkCard
          icon={<Heart />}
          label="Favourites"
          href="/dashboard/favourites"
          value={0}
        />
        <QuickLinkCard
          icon={<MessageSquare />}
          label="Messages"
          href={
            nextBooking ? `/dashboard/bookings/${nextBooking.id}#messages` : "/dashboard/bookings"
          }
          value={upcoming.length}
        />
        <QuickLinkCard
          icon={<Music />}
          label="Past events"
          href="/dashboard/bookings"
          value={completedCount}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent bookings</h2>
          <Button asChild variant="link" size="sm">
            <Link to="/search">
              <Search className="h-3.5 w-3.5" /> Find a new DJ
            </Link>
          </Button>
        </div>
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

function QuickLinkCard({
  icon,
  label,
  href,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  value: number;
}) {
  return (
    <Link to={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </span>
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
