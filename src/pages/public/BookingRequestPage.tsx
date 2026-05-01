import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDJ } from "@/hooks/useDJs";
import { useAuth } from "@/hooks/useAuth";
import { useEventContext } from "@/hooks/useEventContext";
import { EventContextModal } from "@/components/common/EventContextModal";
import { EVENT_TYPES, PLATFORM_FEE_PERCENT, CANCELLATION_POLICY } from "@/lib/constants";
import { getEventTypeOption } from "@/lib/eventTypeOptions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const eventSchema = z.object({
  eventTypeId: z.string().min(1, "Required"),
  eventDate: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().optional(),
  venueName: z.string().min(2, "Required"),
  venueAddress: z.string().min(5, "Required"),
  estimatedGuests: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function BookingRequestPage() {
  const { username } = useParams<{ username: string }>();
  const { dj, loading } = useDJ(username ?? "");
  const { profile } = useAuth();
  const { eventTypeId: contextEventTypeId, set: setEventType } = useEventContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [eventPickerOpen, setEventPickerOpen] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { eventTypeId: contextEventTypeId, eventDate: "", startTime: "", endTime: "", venueName: "", venueAddress: "", notes: "" },
  });

  // Keep the form's event type in sync with context (URL / sessionStorage).
  useEffect(() => {
    if (contextEventTypeId && form.getValues("eventTypeId") !== contextEventTypeId) {
      form.setValue("eventTypeId", contextEventTypeId, { shouldValidate: true });
    }
  }, [contextEventTypeId, form]);

  const selectedOption = getEventTypeOption(form.watch("eventTypeId"));

  const totals = useMemo(() => {
    if (!dj || dj.price_on_request) return null;
    const price = dj.price_from_minor ?? 0;
    const fee = Math.round((price * PLATFORM_FEE_PERCENT) / 100);
    const total = price + fee;
    const payout = price - fee;
    return { price, fee, total, payout };
  }, [dj]);

  if (loading) return <div className="container py-12">Loading…</div>;
  if (!dj) return <div className="container py-12">DJ not found.</div>;

  async function handleContinueFromDetails() {
    const ok = await form.trigger();
    if (!ok) return;
    setStep(1);
  }

  async function handlePay() {
    if (!profile) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      form.getValues();
      // In production: call create-checkout-session edge function, redirect to Stripe.
      //   const { sessionId } = await fetch("/api/create-checkout-session", { ... }).then(r => r.json());
      //   const stripe = await getStripe();
      //   await stripe!.redirectToCheckout({ sessionId });
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Booking submitted (${dj?.price_on_request ? "awaiting quote" : "paid, confirming"})`);
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Button variant="ghost" onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} className="mb-4">
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <img src={dj.equipment_photos[0]?.url ?? dj.profile.avatar_url ?? ""} alt="" className="h-14 w-14 rounded-md object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">Book {dj.stage_name}</h1>
          <p className="text-sm text-muted-foreground">{dj.base_location} · Travels up to {dj.travel_radius_km}km</p>
        </div>
      </div>

      <Progress value={((step + 1) / 3) * 100} className="mb-6" />

      {step === 0 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Step 1 · Event details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Event type</Label>
                <div
                  className={cn(
                    "mt-1 flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2.5",
                    selectedOption ? "border-accent/30" : "border-input",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {selectedOption ? (
                      <>
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                            selectedOption.tint,
                          )}
                        >
                          <selectedOption.Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Booking for
                          </div>
                          <div className="truncate text-sm font-semibold">{selectedOption.label}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No event selected yet</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEventPickerOpen(true)}
                    className="rounded-full"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {selectedOption ? "Change" : "Choose event"}
                  </Button>
                </div>
                {form.formState.errors.eventTypeId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.eventTypeId.message}</p>}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Set on the homepage. Switching events may change the DJ's pricing or what they bring.
                </p>
              </div>
              <div>
                <Label htmlFor="eventDate">Event date</Label>
                <Input id="eventDate" type="date" {...form.register("eventDate")} />
              </div>
              <div>
                <Label htmlFor="startTime">Start time</Label>
                <Input id="startTime" type="time" {...form.register("startTime")} />
              </div>
              <div>
                <Label htmlFor="endTime">Estimated end time</Label>
                <Input id="endTime" type="time" {...form.register("endTime")} />
              </div>
              <div>
                <Label htmlFor="estimatedGuests">Estimated guests</Label>
                <Input id="estimatedGuests" type="number" min={1} {...form.register("estimatedGuests", { valueAsNumber: true })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="venueName">Venue name</Label>
                <Input id="venueName" {...form.register("venueName")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="venueAddress">Venue address</Label>
                <Input id="venueAddress" {...form.register("venueAddress")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Special requests / notes (optional)</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
              </div>
            </div>
            <Button onClick={handleContinueFromDetails} variant="accent" className="w-full">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="text-lg font-semibold">Step 2 · Review and pay</h2>
            <ReviewRow label="DJ" value={dj.stage_name} />
            <ReviewRow label="Event type" value={EVENT_TYPES.find((e) => e.id === form.getValues("eventTypeId"))?.label ?? ""} />
            <ReviewRow label="Event date" value={formatDate(form.getValues("eventDate"))} />
            <ReviewRow
              label="Time"
              value={`${form.getValues("startTime")}${form.getValues("endTime") ? ` – ${form.getValues("endTime")}` : ""}`}
            />
            <ReviewRow label="Venue" value={`${form.getValues("venueName")} · ${form.getValues("venueAddress")}`} />
            {form.getValues("estimatedGuests") && <ReviewRow label="Estimated guests" value={String(form.getValues("estimatedGuests"))} />}
            {form.getValues("notes") && <ReviewRow label="Notes" value={form.getValues("notes") ?? ""} />}

            <Separator />

            {dj.price_on_request ? (
              <div className="rounded-md bg-muted/40 p-4 text-sm">
                <Badge variant="warning" className="mb-2">Price on request</Badge>
                <p>
                  You won't be charged yet. Your request will go to {dj.stage_name}, who will reply with a quote.
                  Once you approve, you'll be asked to pay.
                </p>
              </div>
            ) : totals ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">DJ price</span><span>{formatCurrency(totals.price, dj.currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform service fee ({PLATFORM_FEE_PERCENT}%)</span><span>{formatCurrency(totals.fee, dj.currency)}</span></div>
                <Separator />
                <div className="flex justify-between text-base font-semibold"><span>Total today</span><span>{formatCurrency(totals.total, dj.currency)}</span></div>
                <p className="text-xs text-muted-foreground">
                  Your DJ is paid 24 hours after your event, provided everything goes well. Funds are held securely by Stripe.
                </p>
              </div>
            ) : null}

            <div className="rounded-md border p-3 text-xs">
              <div className="font-medium">Cancellation policy</div>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {CANCELLATION_POLICY.map((c) => <li key={c.label}>• {c.label}</li>)}
              </ul>
            </div>

            <Button variant="accent" className="w-full" onClick={handlePay} disabled={submitting}>
              <Lock className="h-4 w-4" />
              {dj.price_on_request ? "Submit request" : submitting ? "Redirecting to Stripe…" : "Pay securely with Stripe"}
            </Button>
          </CardContent>
        </Card>
      )}

      <EventContextModal
        open={eventPickerOpen}
        onOpenChange={setEventPickerOpen}
        value={form.watch("eventTypeId")}
        onSelect={(id) => {
          form.setValue("eventTypeId", id, { shouldValidate: true });
          setEventType(id);
        }}
        title="Change the event you're booking"
        description="Switching events may change the DJ's pricing or what they bring."
      />

      {step === 2 && (
        <Card>
          <CardContent className="flex flex-col items-center space-y-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">
              {dj.price_on_request ? "Request sent" : "Booking confirmed"}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {dj.price_on_request
                ? `${dj.stage_name} will review your event details and send you a quote shortly.`
                : `We've emailed your confirmation. ${dj.stage_name} has been notified.`}
            </p>
            <div className="rounded-md bg-muted/40 px-4 py-2 text-sm">
              Booking reference: <span className="font-mono font-semibold">DJC-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href="/dashboard">View dashboard</a>
              </Button>
              <Button asChild variant="accent">
                <a href="/search">Browse more DJs</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}
