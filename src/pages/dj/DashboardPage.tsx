import { Link } from "react-router-dom";
import { Calendar, Wallet, Star, User, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DJDashboardPage() {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "dj");

  const pending = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings.filter((b) => b.status === "confirmed" && new Date(b.event_date) >= new Date());

  const monthlyEarnings = bookings
    .filter((b) => b.status === "completed" && new Date(b.completed_at ?? b.event_date).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + (b.payout_minor ?? 0), 0);

  const avgRating = 4.9; // From DJ's profile in production

  const profileCompletion = 85;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">DJ-oversigt</h1>
          <p className="text-sm text-muted-foreground">Velkommen tilbage, {profile?.full_name.split(" ")[0]}.</p>
        </div>
        {pending.length > 0 && (
          <Button asChild variant="accent">
            <Link to="/dj/bookings">
              <Bell className="h-4 w-4" /> {pending.length} ny{pending.length === 1 ? "" : "e"} forespørgsel{pending.length === 1 ? "" : "er"}
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<Bell />} label="Afventende forespørgsler" value={pending.length.toString()} />
        <StatCard icon={<Calendar />} label="Kommende events" value={upcoming.length.toString()} />
        <StatCard icon={<Wallet />} label="Denne måned" value={formatCurrency(monthlyEarnings, "DKK")} />
        <StatCard icon={<Star />} label="Bedømmelse" value={`${avgRating}/5`} />
      </div>

      {profileCompletion < 100 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Færdiggør din profil</h3>
                <p className="text-sm text-muted-foreground">
                  Profiler med 100% udfyldelse får 2,5× flere bookinger.
                </p>
              </div>
              <Button asChild><Link to="/dj/profile">Rediger profil</Link></Button>
            </div>
            <Progress value={profileCompletion} className="mt-4" />
            <p className="mt-1 text-xs text-muted-foreground">{profileCompletion}% udfyldt</p>
          </CardContent>
        </Card>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Afventende forespørgsler</h2>
          <Button asChild variant="link"><Link to="/dj/bookings">Se alle →</Link></Button>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Indlæser…</div>
        ) : pending.length === 0 ? (
          <EmptyState title="Ingen afventende forespørgsler" description="Du får besked, når en kunde sender en bookingforespørgsel." />
        ) : (
          <div className="space-y-3">
            {pending.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold">{b.event_type.label} · {formatDate(b.event_date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {b.venue_name} · {b.customer.full_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookingStatusBadge status={b.status} />
                    <Button asChild size="sm"><Link to={`/dj/bookings/${b.id}`}>Åbn</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Genveje</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink icon={<User />} label="Rediger profil" href="/dj/profile" />
          <QuickLink icon={<Calendar />} label="Administrer tilgængelighed" href="/dj/availability" />
          <QuickLink icon={<Wallet />} label="Se udbetalinger" href="/dj/earnings" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">{icon}</span>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link to={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">{icon}</span>
          <span className="font-medium">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
