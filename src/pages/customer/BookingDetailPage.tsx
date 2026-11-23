import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { BookingHero } from "@/components/booking-dashboard/BookingHero";
import { StatusTimeline } from "@/components/booking-dashboard/StatusTimeline";
import { EventDetailsCard } from "@/components/booking-dashboard/EventDetailsCard";
import { MusicPlanner } from "@/components/booking-dashboard/MusicPlanner";
import { RunOfShow } from "@/components/booking-dashboard/RunOfShow";
import { MessagesThread } from "@/components/booking-dashboard/MessagesThread";
import { PaymentBreakdown } from "@/components/booking-dashboard/PaymentBreakdown";
import { CancellationCard } from "@/components/booking-dashboard/CancellationCard";
import { DJSidebar } from "@/components/booking-dashboard/DJSidebar";
import { ReviewCard } from "@/components/booking-dashboard/ReviewCard";
import { HelpStrip } from "@/components/booking-dashboard/HelpStrip";

export function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id, "customer");
  const navigate = useNavigate();
  const booking = bookings.find((b) => b.id === id);

  if (loading) {
    return <div className="py-8 text-sm text-muted-foreground">Indlæser…</div>;
  }

  if (!booking) {
    return (
      <div className="py-8 text-center">
        <p>Booking ikke fundet.</p>
        <Button asChild variant="link">
          <Link to="/dashboard/bookings">Tilbage til bookinger</Link>
        </Button>
      </div>
    );
  }

  const isPast = new Date(booking.event_date) < new Date();
  const showReview = booking.status === "completed" || (isPast && booking.status === "confirmed");

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Tilbage
      </Button>

      <BookingHero booking={booking} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <StatusTimeline booking={booking} />
          <EventDetailsCard booking={booking} />
          <MusicPlanner bookingId={booking.id} />
          <RunOfShow bookingId={booking.id} eventTypeId={booking.event_type_id} />
          <MessagesThread booking={booking} />
          <PaymentBreakdown booking={booking} />
          {showReview && <ReviewCard booking={booking} />}
          <CancellationCard
            booking={booking}
            onCancel={() => navigate("/dashboard/bookings")}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <DJSidebar booking={booking} />
          <HelpStrip />
        </aside>
      </div>
    </div>
  );
}
