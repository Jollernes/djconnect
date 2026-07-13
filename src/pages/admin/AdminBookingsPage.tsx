import { Link } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDanishDateShort } from "@/lib/utils";
import { useDanishPageSeo } from "@/lib/seo";
import { BOOKING_STATUS_META } from "@/types/domain";

export function AdminBookingsPage() {
  useDanishPageSeo({
    title: "Bookinger",
    description: "Pipeline-oversigt over alle bookinger.",
    canonical: "/admin/bookings",
  });

  const bookings = useStore((snapshot) => snapshot.bookings);
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const stages = Object.entries(BOOKING_STATUS_META) as Array<[keyof typeof BOOKING_STATUS_META, (typeof BOOKING_STATUS_META)[keyof typeof BOOKING_STATUS_META]]>;

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Bookinger" description="Pipeline og afvikling." />

      <div className="grid gap-4 xl:grid-cols-3">
        {stages.map(([status, meta]) => (
          <Card key={status} className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <BookingStatusBadge status={status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.filter((booking) => booking.status === status).slice(0, 5).map((booking) => {
                const brief = briefs.find((item) => item.id === booking.event_brief_id);
                return (
                  <div key={booking.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                    <p className="font-medium">{booking.company_name}</p>
                    <p className="text-muted-foreground">
                      {brief ? `${brief.event_type} · ${brief.city} · ${formatDanishDateShort(brief.event_date)}` : "Manglende brief"}
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-3">
                      <Link to={`/admin/bookings/${booking.id}`}>Detaljer</Link>
                    </Button>
                  </div>
                );
              })}
              {bookings.filter((booking) => booking.status === status).length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen bookinger i dette trin.</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
