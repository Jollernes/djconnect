import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  effectivePricing,
  readBookingRequest,
  updateBookingRequest,
  type BookingRequest,
} from "@/lib/bookingRequestStore";
import {
  bookingStatusBadgeClass,
  bookingStatusLabel,
} from "@/lib/bookingRequestStatus";

/**
 * Customer view of a single direct booking request and its live status:
 *   1. Afventer DJ-svar — the DJ has to confirm/adjust the price.
 *   2. Bekræft & betal depositum — the DJ confirmed a price; the customer
 *      gives their final confirmation and pays a 25% deposit up front.
 *   3. Bekræftet — deposit paid, booking locked in.
 */
export function CustomerBookingRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [record, setRecord] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useDocumentHead({
    title: "Bookingforespørgsel · DJConnect",
    description: "Følg status på din direkte bookingforespørgsel.",
  });

  const load = useCallback(() => {
    if (!requestId) return;
    setRecord(readBookingRequest(requestId));
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("bookingRequest:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("bookingRequest:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [load]);

  async function handleConfirmAndPay() {
    if (!record) return;
    const pricing = effectivePricing(record);
    if (!pricing) return;
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      updateBookingRequest(record.id, {
        status: "confirmed",
        deposit: { paidAtMs: Date.now(), amountMinor: pricing.depositMinor },
      });
      toast.success("Booking bekræftet — depositum betalt");
    } finally {
      setPaying(false);
    }
  }

  function handleDecline() {
    if (!record) return;
    updateBookingRequest(record.id, { status: "declined" });
    toast("Tilbud afvist");
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Indlæser…</div>;
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Vi kunne ikke finde den forespørgsel
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Den er måske startet på en anden enhed.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/requests">Mine forespørgsler</Link>
          </Button>
          <Button asChild>
            <Link to="/search">Find DJs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pricing = effectivePricing(record);
  const eventLabel =
    EVENT_TYPES.find((e) => e.id === record.event.eventTypeId)?.label ?? "Event";
  const dj = record.djStageName;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to="/dashboard/requests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Alle forespørgsler
      </Link>

      <header className="flex items-center gap-3">
        {record.djAvatarUrl ? (
          <img
            src={record.djAvatarUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{dj}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                bookingStatusBadgeClass(record.status),
              )}
            >
              {bookingStatusLabel(record.status)}
            </span>
            {record.djCity && (
              <span className="text-xs text-muted-foreground">{record.djCity}</span>
            )}
          </div>
        </div>
      </header>

      <StepTimeline status={record.status} />

      <Card>
        <CardContent className="space-y-3 p-5 text-sm">
          <h2 className="text-base font-semibold">Eventdetaljer</h2>
          <Detail icon={CalendarClock} label="Eventtype" value={eventLabel} />
          <Detail
            icon={CalendarClock}
            label="Dato"
            value={record.event.eventDate ? formatDate(record.event.eventDate) : "—"}
          />
          <Detail
            icon={Clock}
            label="Tidspunkt"
            value={`${record.event.startTime}${
              record.event.endTime ? ` – ${record.event.endTime}` : ""
            }`}
          />
          <Detail
            icon={MapPin}
            label="Lokation"
            value={`${record.event.venueName} · ${record.event.venueAddress}`}
          />
          {record.event.estimatedGuests ? (
            <Detail
              icon={ShieldCheck}
              label="Gæster"
              value={String(record.event.estimatedGuests)}
            />
          ) : null}
          {record.event.notes ? (
            <Detail icon={ShieldCheck} label="Noter" value={record.event.notes} />
          ) : null}
        </CardContent>
      </Card>

      {/* Price + action state machine */}
      {record.status === "pending_dj" && (
        <Card>
          <CardContent className="space-y-2 p-5 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-amber-600" />
              Afventer {dj}
            </div>
            <p className="text-muted-foreground">
              {dj} gennemgår dine detaljer og bekræfter prisen (eller justerer den,
              hvis der er ekstra ønsker). Du hører fra os, så snart de har svaret —
              der sker ingen betaling endnu.
            </p>
            {pricing && (
              <p className="text-xs text-muted-foreground">
                Estimeret fuld pris: {formatCurrency(pricing.fullPriceMinor, record.djCurrency)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {record.status === "pending_customer" && pricing && (
        <Card className="border-accent/40">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4 text-accent" />
              {dj} har bekræftet prisen — bekræft din booking
            </div>

            {record.djQuote?.changed && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {dj} har justeret prisen.
                {record.djQuote.note ? ` Begrundelse: ${record.djQuote.note}` : ""}
              </div>
            )}
            {!record.djQuote?.changed && record.djQuote?.note && (
              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                Besked fra {dj}: {record.djQuote.note}
              </div>
            )}

            <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
              <Row
                label="Fuld pris"
                value={formatCurrency(pricing.fullPriceMinor, record.djCurrency)}
              />
              <Row
                label={`Depositum nu (${pricing.depositPercent}%)`}
                value={formatCurrency(pricing.depositMinor, record.djCurrency)}
                strong
              />
              <Row
                label="Rest til DJ efter event"
                value={formatCurrency(pricing.payoutMinor, record.djCurrency)}
                muted
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Depositummet på {pricing.depositPercent}% er platformsgebyret og
              betales med det samme, når du bekræfter. Resten afregnes med {dj}
              efter eventet.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="accent"
                className="flex-1"
                onClick={handleConfirmAndPay}
                disabled={paying}
              >
                <Wallet className="h-4 w-4" />
                {paying
                  ? "Behandler betaling…"
                  : `Bekræft & betal ${formatCurrency(
                      pricing.depositMinor,
                      record.djCurrency,
                    )}`}
              </Button>
              <Button variant="outline" onClick={handleDecline} disabled={paying}>
                Afvis tilbud
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {record.status === "confirmed" && pricing && (
        <Card className="border-emerald-200">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Booking bekræftet
            </div>
            <div className="space-y-2 rounded-lg bg-emerald-50 p-4 text-sm">
              <Row
                label="Depositum betalt"
                value={formatCurrency(
                  record.deposit?.amountMinor ?? pricing.depositMinor,
                  record.djCurrency,
                )}
                strong
              />
              <Separator />
              <Row
                label="Rest til DJ efter event"
                value={formatCurrency(pricing.payoutMinor, record.djCurrency)}
                muted
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Din dato er reserveret hos {dj}. Restbeløbet afregnes efter eventet.
            </p>
            <div className="rounded-md bg-muted/40 px-4 py-2 text-xs">
              Reference: <span className="font-mono font-semibold">{record.id}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {(record.status === "declined" || record.status === "expired") && (
        <Card>
          <CardContent className="space-y-2 p-5 text-sm">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <XCircle className="h-4 w-4" />
              {record.status === "declined" ? "Forespørgslen er afslået" : "Forespørgslen er udløbet"}
            </div>
            <p className="text-muted-foreground">
              Du kan finde en anden DJ til dit event.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
              <Link to="/search">Find andre DJs</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const STEPS: { key: BookingRequest["status"]; label: string }[] = [
  { key: "pending_dj", label: "Forespørgsel sendt" },
  { key: "pending_customer", label: "DJ bekræfter pris" },
  { key: "confirmed", label: "Bekræft & betal depositum" },
];

function StepTimeline({ status }: { status: BookingRequest["status"] }) {
  if (status === "declined" || status === "expired") return null;
  const activeIndex =
    status === "pending_dj" ? 0 : status === "pending_customer" ? 1 : 2;
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i < activeIndex || status === "confirmed";
        const active = i === activeIndex && status !== "confirmed";
        return (
          <div key={step.key} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-col items-start gap-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  done
                    ? "bg-emerald-600 text-white"
                    : active
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded",
                  i < activeIndex || status === "confirmed"
                    ? "bg-emerald-600"
                    : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span
        className={cn(
          strong && "text-base font-semibold",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
