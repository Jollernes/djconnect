import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, MessageSquare, CheckCircle2, XCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DJBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { bookings } = useBookings(profile?.id, "dj");
  const navigate = useNavigate();
  const booking = bookings.find((b) => b.id === id);

  const [declineReason, setDeclineReason] = useState("");
  const [quote, setQuote] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");

  if (!booking) {
    return (
      <div className="py-8 text-center">
        <p>Booking not found.</p>
        <Button asChild variant="link"><Link to="/dj/bookings">Back to bookings</Link></Button>
      </div>
    );
  }

  const isPending = booking.status === "pending";
  const isPriceOnRequest = booking.price_minor === null;

  async function handleAccept() {
    toast.success("Booking accepted. Customer notified.");
    navigate("/dj/bookings");
  }
  async function handleDecline() {
    if (declineReason.length < 5) { toast.error("Provide a short reason"); return; }
    toast.success("Booking declined. Customer notified and refund processed.");
    navigate("/dj/bookings");
  }
  async function handleSendQuote() {
    const amount = Number(quote) * 100;
    if (!amount || amount < 10000) { toast.error("Enter a valid amount"); return; }
    toast.success(`Quote of ${formatCurrency(amount, booking?.currency ?? "DKK")} sent`);
    setQuote("");
    setQuoteMessage("");
  }
  async function handleMarkCompleted() {
    toast.success("Marked as completed. Payout will release in 24 hours.");
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Booking reference</div>
          <h1 className="font-mono text-2xl font-semibold">{booking.reference}</h1>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Event details</h2>
              <Row icon={<Calendar />} label="Date & time">{formatDate(booking.event_date)} · {booking.start_time}{booking.end_time ? ` – ${booking.end_time}` : ""}</Row>
              <Row icon={<MapPin />} label="Venue"><div className="font-medium">{booking.venue_name}</div><div className="text-muted-foreground">{booking.venue_address}</div></Row>
              {booking.estimated_guests && <Row icon={<Users />} label="Guests">{booking.estimated_guests}</Row>}
              {booking.notes && <Row icon={<MessageSquare />} label="Notes"><p className="text-muted-foreground">{booking.notes}</p></Row>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">Customer</h2>
              <div className="font-medium">{booking.customer.full_name}</div>
              {booking.status === "confirmed" && (
                <>
                  <Row icon={<MessageSquare />} label="Email">{booking.customer.email}</Row>
                  {booking.customer.phone && <Row icon={<Phone />} label="Phone">{booking.customer.phone}</Row>}
                </>
              )}
              {booking.status !== "confirmed" && (
                <p className="text-xs text-muted-foreground">Customer contact details will be shared when you accept.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="font-semibold">Payment</h3>
              {booking.price_minor === null ? (
                <>
                  <p className="text-sm text-muted-foreground">This is a price-on-request booking. Send the customer a quote.</p>
                  <div>
                    <Label htmlFor="quote">Your quote (DKK)</Label>
                    <Input id="quote" type="number" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="e.g. 7500" />
                  </div>
                  <div>
                    <Label htmlFor="qm">Message to customer (optional)</Label>
                    <Textarea id="qm" rows={2} value={quoteMessage} onChange={(e) => setQuoteMessage(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleSendQuote}>Send quote</Button>
                </>
              ) : (
                <>
                  <Row label="DJ price">{formatCurrency(booking.price_minor, booking.currency)}</Row>
                  <Row label="Platform fee">{formatCurrency(booking.platform_fee_minor, booking.currency)}</Row>
                  <Separator />
                  <Row label="Your payout"><span className="font-semibold">{formatCurrency(booking.payout_minor, booking.currency)}</span></Row>
                </>
              )}
            </CardContent>
          </Card>

          {isPending && !isPriceOnRequest && (
            <div className="space-y-2">
              <Button variant="accent" className="w-full" onClick={handleAccept}>
                <CheckCircle2 className="h-4 w-4" /> Accept booking
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <XCircle className="h-4 w-4" /> Decline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Decline this booking?</DialogTitle>
                    <DialogDescription>The customer will receive a full refund.</DialogDescription>
                  </DialogHeader>
                  <Textarea rows={3} placeholder="Reason (shared with customer)" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                  <DialogFooter><Button variant="destructive" onClick={handleDecline}>Confirm decline</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {booking.status === "confirmed" && new Date(booking.event_date) < new Date() && (
            <Button variant="accent" className="w-full" onClick={handleMarkCompleted}>
              Mark as completed
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon && <span className="h-4 w-4">{icon}</span>}
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}
