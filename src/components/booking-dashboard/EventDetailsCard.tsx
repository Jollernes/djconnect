import { Calendar, MapPin, Users, NotebookPen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { BookingWithRelations } from "@/types/domain";

export function EventDetailsCard({ booking }: { booking: BookingWithRelations }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${booking.venue_name}, ${booking.venue_address}`,
  )}`;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Eventdetaljer</h2>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <Detail icon={<Calendar className="h-4 w-4" />} label="Dato & tid">
          <div className="font-medium text-foreground">{formatDate(booking.event_date)}</div>
          <div className="text-muted-foreground">
            {booking.start_time}
            {booking.end_time ? ` – ${booking.end_time}` : ""}
          </div>
        </Detail>
        <Detail icon={<MapPin className="h-4 w-4" />} label="Sted">
          <div className="font-medium text-foreground">{booking.venue_name}</div>
          <div className="text-muted-foreground">{booking.venue_address}</div>
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Åbn i Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </Detail>
        {booking.estimated_guests && (
          <Detail icon={<Users className="h-4 w-4" />} label="Gæster">
            <div className="font-medium text-foreground">{booking.estimated_guests}</div>
          </Detail>
        )}
        {booking.notes && (
          <Detail icon={<NotebookPen className="h-4 w-4" />} label="Noter til DJ">
            <p className="text-muted-foreground">{booking.notes}</p>
          </Detail>
        )}
      </dl>
    </div>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
