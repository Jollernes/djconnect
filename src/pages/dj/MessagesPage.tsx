import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";

export function DJMessagesPage() {
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, "dj");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Beskeder</h1>
      {bookings.length === 0 ? (
        <EmptyState title="Ingen beskeder" description="Samtaler vises her, når kunder booker dig." />
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {bookings.map((b) => (
            <Link key={b.id} to={`/dj/bookings/${b.id}`} className="flex items-center justify-between p-4 hover:bg-muted/40">
              <div>
                <div className="font-medium">{b.customer.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {b.event_type.label} · {formatDate(b.event_date)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Åbn booking →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
