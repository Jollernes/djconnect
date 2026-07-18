import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Send, CheckCircle2, Pencil } from "lucide-react";
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
import {
  newBookingRequestId,
  writeBookingRequest,
  type BookingRequest,
} from "@/lib/bookingRequestStore";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [eventPickerOpen, setEventPickerOpen] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const initialDate = searchParams.get("date") ?? "";
  const initialGuestsParam = searchParams.get("guests");
  const initialGuests =
    initialGuestsParam && Number(initialGuestsParam) > 0
      ? Number(initialGuestsParam)
      : undefined;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventTypeId: contextEventTypeId,
      eventDate: initialDate,
      startTime: "",
      endTime: "",
      venueName: "",
      venueAddress: "",
      estimatedGuests: initialGuests,
      notes: "",
    },
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

  if (loading) return <div className="container py-12">Indlæser…</div>;
  if (!dj) return <div className="container py-12">DJ ikke fundet.</div>;

  async function handleContinueFromDetails() {
    const ok = await form.trigger();
    if (!ok) return;
    setStep(1);
  }

  async function handleSendRequest() {
    if (!dj) return;
    setSubmitting(true);
    try {
      const values = form.getValues();
      const id = newBookingRequestId();
      const pricing = totals
        ? {
            basePriceMinor: totals.price,
            feePercent: PLATFORM_FEE_PERCENT,
            feeMinor: totals.fee,
            totalMinor: totals.total,
          }
        : null;
      const customerId = profile?.role === "customer" ? profile.id : undefined;
      const record: BookingRequest = {
        id,
        customerId,
        createdAtMs: Date.now(),
        status: "pending_dj",
        djId: dj.id,
        djUsername: dj.username,
        djStageName: dj.stage_name,
        djAvatarUrl: dj.profile.avatar_url ?? undefined,
        djCity: dj.base_location ?? undefined,
        djCurrency: dj.currency,
        pricing,
        event: {
          eventTypeId: values.eventTypeId,
          eventDate: values.eventDate,
          startTime: values.startTime,
          endTime: values.endTime || undefined,
          venueName: values.venueName,
          venueAddress: values.venueAddress,
          estimatedGuests: values.estimatedGuests,
          notes: values.notes || undefined,
        },
      };
      writeBookingRequest(record);
      // Tiny delay so the button shows its loading state and feels deliberate.
      await new Promise((r) => setTimeout(r, 400));
      setSubmittedRef(id);
      toast.success(`Bookingforespørgsel sendt til ${dj.stage_name}`);
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke sende forespørgsel");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      {step < 2 && (
        <Button variant="ghost" onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} className="mb-4">
          <ChevronLeft className="h-4 w-4" /> Tilbage
        </Button>
      )}

      <div className="mb-6 flex items-center gap-3">
        <img src={dj.equipment_photos[0]?.url ?? dj.profile.avatar_url ?? ""} alt="" className="h-14 w-14 rounded-md object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">Book {dj.stage_name}</h1>
          <p className="text-sm text-muted-foreground">{dj.base_location} · Rejser op til {dj.travel_radius_km}km</p>
        </div>
      </div>

      <Progress value={((step + 1) / 3) * 100} className="mb-6" />

      {step === 0 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Trin 1 · Eventdetaljer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Eventtype</Label>
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
                            Booking til
                          </div>
                          <div className="truncate text-sm font-semibold">{selectedOption.label}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Intet event valgt endnu</span>
                    )}
                  </div>
                  {!selectedOption && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEventPickerOpen(true)}
                      className="rounded-full"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Vælg event
                    </Button>
                  )}
                </div>
                {form.formState.errors.eventTypeId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.eventTypeId.message}</p>}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Angivet tidligere i din søgning.
                </p>
              </div>
              <div>
                <Label htmlFor="eventDate">Eventdato</Label>
                <Input id="eventDate" type="date" {...form.register("eventDate")} />
              </div>
              <div>
                <Label htmlFor="startTime">Starttidspunkt</Label>
                <Input id="startTime" type="time" {...form.register("startTime")} />
              </div>
              <div>
                <Label htmlFor="endTime">Forventet sluttidspunkt</Label>
                <Input id="endTime" type="time" {...form.register("endTime")} />
              </div>
              <div>
                <Label htmlFor="estimatedGuests">Forventet antal gæster</Label>
                <Input id="estimatedGuests" type="number" min={1} {...form.register("estimatedGuests", { valueAsNumber: true })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="venueName">Lokationens navn</Label>
                <Input id="venueName" {...form.register("venueName")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="venueAddress">Lokationens adresse</Label>
                <Input id="venueAddress" {...form.register("venueAddress")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Særlige ønsker / noter (valgfrit)</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
              </div>
            </div>
            <Button onClick={handleContinueFromDetails} variant="accent" className="w-full">
              Fortsæt <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="text-lg font-semibold">Trin 2 · Gennemse og send forespørgsel</h2>
            <ReviewRow label="DJ" value={dj.stage_name} />
            <ReviewRow label="Eventtype" value={EVENT_TYPES.find((e) => e.id === form.getValues("eventTypeId"))?.label ?? ""} />
            <ReviewRow label="Eventdato" value={formatDate(form.getValues("eventDate"))} />
            <ReviewRow
              label="Tidspunkt"
              value={`${form.getValues("startTime")}${form.getValues("endTime") ? ` – ${form.getValues("endTime")}` : ""}`}
            />
            <ReviewRow label="Lokation" value={`${form.getValues("venueName")} · ${form.getValues("venueAddress")}`} />
            {form.getValues("estimatedGuests") && <ReviewRow label="Forventet antal gæster" value={String(form.getValues("estimatedGuests"))} />}
            {form.getValues("notes") && <ReviewRow label="Noter" value={form.getValues("notes") ?? ""} />}

            <Separator />

            {dj.price_on_request ? (
              <div className="rounded-md bg-muted/40 p-4 text-sm">
                <Badge variant="warning" className="mb-2">Pris efter forespørgsel</Badge>
                <p>
                  Du bliver ikke opkrævet endnu. Din forespørgsel sendes til {dj.stage_name}, som svarer med et tilbud. Når du accepterer, bliver du bedt om at betale depositum til escrow.
                </p>
              </div>
            ) : totals ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">DJ-pris</span><span>{formatCurrency(totals.price, dj.currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platformsgebyr ({PLATFORM_FEE_PERCENT}%)</span><span>{formatCurrency(totals.fee, dj.currency)}</span></div>
                <Separator />
                <div className="flex justify-between text-base font-semibold"><span>Forventet total</span><span>{formatCurrency(totals.total, dj.currency)}</span></div>
                <p className="text-xs text-muted-foreground">
                  <strong className="font-semibold text-foreground">Du bliver ikke opkrævet endnu.</strong>{" "}
                  Vi beder først om depositum, når {dj.stage_name} bekræfter tilgængelighed. Beløbet holdes derefter sikkert i escrow og udbetales til DJ'en 24 timer efter eventet.
                </p>
              </div>
            ) : null}

            <div className="rounded-md border p-3 text-xs">
              <div className="font-medium">Afbestillingspolitik</div>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {CANCELLATION_POLICY.map((c) => <li key={c.label}>• {c.label}</li>)}
              </ul>
            </div>

            <Button variant="accent" className="w-full" onClick={handleSendRequest} disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Sender forespørgsel…" : "Send bookingforespørgsel"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Ingen betaling nu. {dj.stage_name} svarer typisk inden for få timer.
            </p>
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
        title="Ændr det event, du booker til"
        description="At skifte event kan ændre DJ'ens pris eller hvad de medbringer."
      />

      {step === 2 && (
        <Card>
          <CardContent className="flex flex-col items-center space-y-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Forespørgsel sendt til {dj.stage_name}</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {dj.stage_name} gennemgår dine eventdetaljer og svarer hurtigst muligt. Så snart de accepterer, sender vi dig et betalingslink på e-mail, så du kan reservere datoen med et depositum i escrow.
            </p>
            <div className="rounded-md bg-muted/40 px-4 py-2 text-sm">
              Reference: <span className="font-mono font-semibold">{submittedRef ?? "—"}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {profile?.role === "customer" && (
                <Button asChild variant="outline">
                  <a href="/dashboard/requests">Se mine forespørgsler</a>
                </Button>
              )}
              <Button asChild variant="accent">
                <a href="/search">Find flere DJs</a>
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
