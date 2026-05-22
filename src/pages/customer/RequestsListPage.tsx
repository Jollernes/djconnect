import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import {
  listRecordsForCustomer,
  type OfferRequestRecord,
} from "@/lib/offerRequestStore";
import {
  listBookingRequestsForCustomer,
  type BookingRequest,
  type BookingRequestStatus,
} from "@/lib/bookingRequestStore";
import {
  listAdvisoryRecordsForCustomer,
  type PersonalAdviceRecord,
} from "@/lib/personalAdviceStore";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";
import { CITY_OPTIONS } from "@/lib/offerRequestContent";
import { formatCurrency } from "@/lib/utils";

/**
 * Customer-dashboard list of all requests for the current customer.
 *
 * Shows two kinds of requests in separate sections:
 *   1. **Offer requests** — multi-DJ briefs from the "Get 3 offers" wizard.
 *   2. **Booking requests** — direct requests sent to a single DJ from
 *      their profile page. These are *not* paid yet; the customer is
 *      waiting for the DJ to accept before any deposit is taken.
 *
 * Logged-in customers see only their own submissions (scoped via
 * `record.customerId`); legacy / pre-auth records are surfaced for
 * continuity. Each row is a quiet line — no avatars, no big tiles. Drill
 * into a row to open the live progress view at /dashboard/requests/:id.
 */
export function CustomerRequestsListPage() {
  useDocumentHead({
    title: "My requests · DJConnect",
    description: "All your offer and booking requests in one place.",
  });

  const { profile } = useAuth();
  const customerId = profile?.role === "customer" ? profile.id : null;

  const [offerRecords, setOfferRecords] = useState<OfferRequestRecord[]>([]);
  const [bookingRecords, setBookingRecords] = useState<BookingRequest[]>([]);
  const [advisoryRecords, setAdvisoryRecords] = useState<PersonalAdviceRecord[]>([]);

  useEffect(() => {
    function load() {
      setOfferRecords(listRecordsForCustomer(customerId));
      setBookingRecords(listBookingRequestsForCustomer(customerId));
      setAdvisoryRecords(listAdvisoryRecordsForCustomer(customerId));
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("offerRequest:update", onUpdate);
    window.addEventListener("bookingRequest:update", onUpdate);
    window.addEventListener("personalAdvice:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    const t = setInterval(load, 2000);
    return () => {
      window.removeEventListener("offerRequest:update", onUpdate);
      window.removeEventListener("bookingRequest:update", onUpdate);
      window.removeEventListener("personalAdvice:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
      clearInterval(t);
    };
  }, [customerId]);

  const isEmpty =
    offerRecords.length === 0 &&
    bookingRecords.length === 0 &&
    advisoryRecords.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="No requests yet"
        description="Send a brief and we'll match you with up to 3 DJs in 24 hours, or browse DJs and request one directly."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/get-offers">Get 3 offers</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/personal-advice">Personlig rådgivning</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">Browse DJs</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
          My requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every brief you've sent and every DJ you've requested directly.
        </p>
      </header>

      {advisoryRecords.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Personlig rådgivning"
            count={advisoryRecords.length}
            description="Personlige anbefalinger fra platformen — en rådgiver ringer dig op."
          />
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
            {advisoryRecords.map((r) => (
              <AdvisoryRequestRow key={r.id} record={r} />
            ))}
          </ul>
        </section>
      )}

      {bookingRecords.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Booking requests"
            count={bookingRecords.length}
            description="Direct requests to a specific DJ. You'll be asked to pay only after the DJ accepts."
          />
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
            {bookingRecords.map((r) => (
              <BookingRequestRow key={r.id} record={r} />
            ))}
          </ul>
        </section>
      )}

      {offerRecords.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Offer requests"
            count={offerRecords.length}
            description="Briefs sent to up to 3 matched DJs. Open one to see live progress."
          />
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
            {offerRecords.map((r) => (
              <OfferRequestRow key={r.id} record={r} />
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline">
          <Link to="/search">Browse DJs</Link>
        </Button>
        <Button asChild>
          <Link to="/get-offers">New offer request</Link>
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function OfferRequestRow({ record }: { record: OfferRequestRecord }) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const eventType = EVENT_TYPE_OPTIONS.find(
    (e) => e.id === record.brief.eventType,
  );
  const cityLabel = record.brief.city
    ? CITY_OPTIONS.find((c) => c.id === record.brief.city)?.label ?? record.brief.city
    : record.brief.customCity ?? "Denmark";
  const dateLabel = record.brief.date
    ? new Date(record.brief.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date TBD";

  const status =
    agg.quotesReady >= 3
      ? "All quotes ready"
      : agg.quotesReady > 0
        ? `${agg.quotesReady} of 3 quotes ready`
        : "Awaiting quotes";

  const statusTone =
    agg.quotesReady >= 3
      ? "text-emerald-700"
      : agg.quotesReady > 0
        ? "text-foreground"
        : "text-muted-foreground";

  return (
    <li>
      <Link
        to={`/dashboard/requests/${record.id}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {eventType?.label ?? "Event"} · {cityLabel}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {dateLabel} · sent {timeSince(record.createdAtMs)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`shrink-0 text-xs ${statusTone}`}>{status}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}

function BookingRequestRow({ record }: { record: BookingRequest }) {
  const dateLabel = record.event.eventDate
    ? new Date(record.event.eventDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date TBD";

  const status = statusLabel(record.status);
  const statusTone = statusToneClass(record.status);

  const priceLabel = record.pricing
    ? formatCurrency(record.pricing.totalMinor, record.djCurrency)
    : "On request";

  return (
    <li>
      <Link
        to={`/djs/${record.djUsername}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          {record.djAvatarUrl ? (
            <img
              src={record.djAvatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {record.djStageName}
              {record.djCity ? (
                <span className="font-normal text-muted-foreground">
                  {" · "}
                  {record.djCity}
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              {dateLabel} · {priceLabel} · sent {timeSince(record.createdAtMs)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`shrink-0 text-xs ${statusTone}`}>{status}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}

function AdvisoryRequestRow({ record }: { record: PersonalAdviceRecord }) {
  const wedding = record.brief.eventType === "wedding" ? record.brief.wedding : null;
  const eventLabel =
    record.brief.eventType === "wedding"
      ? "Bryllup"
      : record.brief.eventType === "birthday"
        ? "Fødselsdag"
        : record.brief.eventType === "corporate"
          ? "Firmaevent"
          : "Event";
  const where = wedding?.city ?? "";
  const dateLabel = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Dato ikke valgt";

  const status =
    record.status === "reserved"
      ? "Reserveret"
      : record.status === "declined"
        ? "Afslået"
        : "Afventer rådgiver-opkald";
  const tone =
    record.status === "reserved"
      ? "text-emerald-700"
      : record.status === "declined"
        ? "text-muted-foreground"
        : "text-amber-700";

  return (
    <li>
      <Link
        to={`/dashboard/personlig-radgivning/${record.id}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {eventLabel}
              {where ? (
                <span className="font-normal text-muted-foreground"> · {where}</span>
              ) : null}
              <span className="font-normal text-muted-foreground">
                {" · "}Anbefalet: {record.recommendation.name}
              </span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {dateLabel} · sendt {timeSince(record.createdAtMs)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`shrink-0 text-xs ${tone}`}>{status}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}

function statusLabel(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "Awaiting DJ response";
    case "accepted":
      return "Accepted — pay deposit";
    case "declined":
      return "Declined";
    case "expired":
      return "Expired";
    case "paid":
      return "Booked";
  }
}

function statusToneClass(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "text-muted-foreground";
    case "accepted":
      return "text-amber-700";
    case "declined":
    case "expired":
      return "text-muted-foreground";
    case "paid":
      return "text-emerald-700";
  }
}

function timeSince(ms: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
