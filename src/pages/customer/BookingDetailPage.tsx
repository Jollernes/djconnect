import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MapPin, Calendar, Users, MessageSquare, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { StarRating } from "@/components/common/StarRating";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT, computeRefundPercent } from "@/lib/constants";

export function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, "customer");
  const navigate = useNavigate();
  const booking = bookings.find((b) => b.id === id);

  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [message, setMessage] = useState("");

  if (!booking) {
    return (
      <div className="py-8 text-center">
        <p>Booking not found.</p>
        <Button asChild variant="link"><Link to="/dashboard/bookings">Back to bookings</Link></Button>
      </div>
    );
  }

  const refundPct = computeRefundPercent(new Date(booking.event_date));

  async function handleSendMessage() {
    if (message.trim().length === 0) return;
    // In production: insert into messages table
    toast.success("Message sent");
    setMessage("");
  }

  async function handleSubmitReview() {
    if (reviewBody.trim().length < 20) {
      toast.error("Review must be at least 20 characters");
      return;
    }
    toast.success("Review submitted — thanks!");
  }

  async function handleCancel() {
    toast.success(`Cancellation submitted. ${refundPct}% refund will be processed.`);
    navigate("/dashboard/bookings");
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Booking reference</div>
          <h1 className="font-mono text-2xl font-semibold">{booking.reference}</h1>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <img src={booking.dj_profile.profile.avatar_url ?? ""} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div className="flex-1">
                <Link to={`/djs/${booking.dj_profile.username}`} className="text-lg font-semibold hover:underline">
                  {booking.dj_profile.stage_name}
                </Link>
                <div className="text-sm text-muted-foreground">{booking.dj_profile.base_location}</div>
                <StarRating
                  value={booking.dj_profile.rating_average}
                  size="sm"
                  showValue
                  reviewCount={booking.dj_profile.rating_count}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Event details</h2>
              <Row icon={<Calendar />} label="Date & time">
                {formatDate(booking.event_date)} · {booking.start_time}
                {booking.end_time ? ` – ${booking.end_time}` : ""}
              </Row>
              <Row icon={<MapPin />} label="Venue">
                <div className="font-medium">{booking.venue_name}</div>
                <div className="text-muted-foreground">{booking.venue_address}</div>
              </Row>
              {booking.estimated_guests && <Row icon={<Users />} label="Guests">{booking.estimated_guests}</Row>}
              {booking.notes && <Row icon={<MessageSquare />} label="Notes"><p className="text-muted-foreground">{booking.notes}</p></Row>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                Conversation will appear here once the DJ replies.
              </div>
              <div className="flex gap-2">
                <Textarea rows={2} placeholder="Send a message to your DJ…" value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>

          {booking.status === "completed" && (
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold">Leave a review</h2>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                      <Star className={n <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"} />
                    </button>
                  ))}
                </div>
                <Textarea
                  rows={4}
                  placeholder="How did it go? (min 20 characters)"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                />
                <Button onClick={handleSubmitReview}>Submit review</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="font-semibold">Payment</h3>
              {booking.price_minor !== null ? (
                <>
                  <Row label="Price">{formatCurrency(booking.price_minor, booking.currency)}</Row>
                  <Row label={`Fee (${PLATFORM_FEE_PERCENT}%)`}>{formatCurrency(booking.platform_fee_minor, booking.currency)}</Row>
                  <Separator />
                  <Row label="Total paid">
                    <span className="font-semibold">
                      {formatCurrency(booking.price_minor + booking.platform_fee_minor, booking.currency)}
                    </span>
                  </Row>
                </>
              ) : (
                <Badge variant="warning">Awaiting quote from DJ</Badge>
              )}
            </CardContent>
          </Card>

          {(booking.status === "confirmed" || booking.status === "pending") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <XCircle className="h-4 w-4" /> Cancel booking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel this booking?</DialogTitle>
                  <DialogDescription>
                    Based on our cancellation policy, you'd receive a <strong>{refundPct}% refund</strong> for
                    this cancellation.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleCancel}>Confirm cancellation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon && <span className="h-4 w-4 text-muted-foreground">{icon}</span>}
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}
