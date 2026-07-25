import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  computeBookingPricing,
  effectivePricing,
  readBookingRequest,
  updateBookingRequest,
  type BookingRequest,
} from "@/lib/bookingRequestStore";
import {
  bookingStatusBadgeClass,
  djBookingStatusLabel,
} from "@/lib/bookingRequestStatus";

/**
 * DJ view of a single booking request. When the request is new the DJ either
 * confirms the estimated price as-is or adjusts it (e.g. extra hours, travel,
 * add-ons) with an optional note. Confirming sends it to the customer for a
 * final confirmation + 25% deposit.
 */
export function DJRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [record, setRecord] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useDocumentHead({
    title: "Bookingforespørgsel · DJConnect",
    description: "Bekræft eller justér prisen på en bookingforespørgsel.",
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

  // Seed the price editor from the estimate once the record loads.
  useEffect(() => {
    if (record?.pricing && priceInput === "") {
      setPriceInput(String(Math.round(record.pricing.fullPriceMinor / 100)));
    }
  }, [record, priceInput]);

  function confirmWithPrice(fullPriceMinor: number, changed: boolean) {
    if (!record) return;
    setSaving(true);
    const quote = computeBookingPricing(fullPriceMinor);
    updateBookingRequest(record.id, {
      status: "pending_customer",
      djQuote: {
        ...quote,
        respondedAtMs: Date.now(),
        changed,
        note: note.trim() || undefined,
      },
    });
    toast.success("Pris sendt til kunden til bekræftelse");
    setSaving(false);
    setEditing(false);
  }

  function handleConfirmEstimate() {
    if (!record?.pricing) return;
    confirmWithPrice(record.pricing.fullPriceMinor, false);
  }

  function handleSaveAdjusted() {
    if (!record) return;
    const major = Number(priceInput);
    if (!Number.isFinite(major) || major <= 0) {
      toast.error("Angiv en gyldig pris");
      return;
    }
    const fullPriceMinor = Math.round(major) * 100;
    const changed = record.pricing
      ? fullPriceMinor !== record.pricing.fullPriceMinor
      : true;
    confirmWithPrice(fullPriceMinor, changed);
  }

  function handleDecline() {
    if (!record) return;
    updateBookingRequest(record.id, { status: "declined" });
    toast("Forespørgsel afslået");
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Indlæser…</div>;
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forespørgslen blev ikke fundet
        </h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/dj/requests">Alle forespørgsler</Link>
        </Button>
      </div>
    );
  }

  const pricing = effectivePricing(record);
  const eventLabel =
    EVENT_TYPES.find((e) => e.id === record.event.eventTypeId)?.label ?? "Event";
  const previewMajor = Number(priceInput);
  const previewQuote =
    Number.isFinite(previewMajor) && previewMajor > 0
      ? computeBookingPricing(Math.round(previewMajor) * 100)
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to="/dj/requests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Alle forespørgsler
      </Link>

      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {eventLabel} · {record.customerName ?? "Kunde"}
          </h1>
        </div>
        <span
          className={cn(
            "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            bookingStatusBadgeClass(record.status),
          )}
        >
          {djBookingStatusLabel(record.status)}
        </span>
      </header>

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
              icon={Users}
              label="Gæster"
              value={String(record.event.estimatedGuests)}
            />
          ) : null}
          {record.event.notes ? (
            <Detail icon={Users} label="Noter" value={record.event.notes} />
          ) : null}
        </CardContent>
      </Card>

      {record.status === "pending_dj" && (
        <Card className="border-accent/40">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-base font-semibold">Bekræft eller justér prisen</h2>

            {record.pricing && !editing && (
              <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
                <Row
                  label="Foreslået fuld pris"
                  value={formatCurrency(record.pricing.fullPriceMinor, record.djCurrency)}
                  strong
                />
                <Row
                  label={`Depositum til platform (${record.pricing.depositPercent}%)`}
                  value={formatCurrency(record.pricing.depositMinor, record.djCurrency)}
                  muted
                />
                <Row
                  label="Din udbetaling efter event"
                  value={formatCurrency(record.pricing.payoutMinor, record.djCurrency)}
                  muted
                />
              </div>
            )}

            {(editing || !record.pricing) && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="price">Fuld pris ({record.djCurrency})</Label>
                  <Input
                    id="price"
                    type="number"
                    min={1}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="fx 12000"
                  />
                </div>
                {previewQuote && (
                  <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
                    <Row
                      label={`Depositum til platform (${previewQuote.depositPercent}%)`}
                      value={formatCurrency(previewQuote.depositMinor, record.djCurrency)}
                      muted
                    />
                    <Row
                      label="Din udbetaling efter event"
                      value={formatCurrency(previewQuote.payoutMinor, record.djCurrency)}
                      muted
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="note">Besked til kunden (valgfrit)</Label>
                  <Textarea
                    id="note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="fx Prisen inkluderer 1 ekstra times spilletid."
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {record.pricing && !editing ? (
                <>
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={handleConfirmEstimate}
                    disabled={saving}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Bekræft pris
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(true)} disabled={saving}>
                    Justér pris
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={handleSaveAdjusted}
                    disabled={saving}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Send pris til kunde
                  </Button>
                  {record.pricing && (
                    <Button
                      variant="ghost"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Annullér
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDecline}
                disabled={saving}
              >
                Afslå
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {record.status === "pending_customer" && pricing && (
        <Card>
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 font-medium text-amber-700">
              <Clock className="h-4 w-4" />
              Afventer kundens endelige bekræftelse
            </div>
            <div className="space-y-2 rounded-lg bg-muted/40 p-4">
              <Row
                label="Bekræftet fuld pris"
                value={formatCurrency(pricing.fullPriceMinor, record.djCurrency)}
                strong
              />
              <Row
                label={`Depositum (${pricing.depositPercent}%)`}
                value={formatCurrency(pricing.depositMinor, record.djCurrency)}
                muted
              />
              <Separator />
              <Row
                label="Din udbetaling efter event"
                value={formatCurrency(pricing.payoutMinor, record.djCurrency)}
                muted
              />
            </div>
            {record.djQuote?.changed && (
              <p className="text-xs text-muted-foreground">
                Du justerede prisen fra estimatet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {record.status === "pending_invoice" && pricing && (
        <Card className="border-amber-200">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 font-medium text-amber-700">
              <Clock className="h-4 w-4" />
              Afventer betaling af faktura
            </div>
            <p className="text-muted-foreground">
              Kunden har valgt at betale depositummet via faktura. Bookingen
              bekræftes automatisk, når depositummet på fakturaen er betalt.
            </p>
            <div className="space-y-2 rounded-lg bg-muted/40 p-4">
              <Row
                label="Bekræftet fuld pris"
                value={formatCurrency(pricing.fullPriceMinor, record.djCurrency)}
                strong
              />
              <Row
                label={`Depositum på faktura (${pricing.depositPercent}%)`}
                value={formatCurrency(
                  record.invoice?.amountMinor ?? pricing.depositMinor,
                  record.djCurrency,
                )}
                muted
              />
              <Separator />
              <Row
                label="Din udbetaling efter event"
                value={formatCurrency(pricing.payoutMinor, record.djCurrency)}
                muted
              />
            </div>
          </CardContent>
        </Card>
      )}

      {record.status === "confirmed" && pricing && (
        <Card className="border-emerald-200">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Booking bekræftet — kunden har betalt depositum
            </div>
            <div className="space-y-2 rounded-lg bg-emerald-50 p-4">
              <Row
                label="Fuld pris"
                value={formatCurrency(pricing.fullPriceMinor, record.djCurrency)}
                strong
              />
              <Row
                label="Depositum betalt (til platform)"
                value={formatCurrency(
                  record.deposit?.amountMinor ?? pricing.depositMinor,
                  record.djCurrency,
                )}
                muted
              />
              <Separator />
              <Row
                label="Din udbetaling efter event"
                value={formatCurrency(pricing.payoutMinor, record.djCurrency)}
                muted
              />
            </div>
          </CardContent>
        </Card>
      )}

      {(record.status === "declined" || record.status === "expired") && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            {record.status === "declined"
              ? "Du har afslået denne forespørgsel."
              : "Forespørgslen er udløbet."}
          </CardContent>
        </Card>
      )}
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
