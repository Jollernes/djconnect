import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Inbox } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  effectivePricing,
  listBookingRequestsForDj,
  type BookingRequest,
} from "@/lib/bookingRequestStore";
import {
  bookingStatusBadgeClass,
  djBookingStatusLabel,
} from "@/lib/bookingRequestStatus";

/**
 * DJ inbox of direct booking requests. New requests wait for the DJ to
 * confirm (or adjust) the price before they go back to the customer for a
 * final confirmation and deposit.
 */
export function DJRequestsPage() {
  const { profile } = useAuth();
  const djId = profile?.role === "dj" ? profile.id : null;
  const [records, setRecords] = useState<BookingRequest[]>([]);

  useDocumentHead({
    title: "Bookingforespørgsler · DJConnect",
    description: "Bekræft eller justér prisen på indkomne bookingforespørgsler.",
  });

  const load = useCallback(() => {
    setRecords(listBookingRequestsForDj(djId));
  }, [djId]);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("bookingRequest:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    const t = setInterval(load, 2000);
    return () => {
      window.removeEventListener("bookingRequest:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
      clearInterval(t);
    };
  }, [load]);

  const nyeCount = records.filter((r) => r.status === "pending_dj").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Bookingforespørgsler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Direkte forespørgsler fra kunder. Bekræft prisen — eller justér den, hvis
          der er ekstra ønsker — så sendes den til kunden til endelig bekræftelse.
        </p>
      </header>

      {records.length === 0 ? (
        <EmptyState
          title="Ingen forespørgsler endnu"
          description="Når en kunde sender en direkte bookingforespørgsel fra din profil, dukker den op her."
        />
      ) : (
        <>
          {nyeCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              <Inbox className="h-4 w-4" />
              {nyeCount} {nyeCount === 1 ? "ny forespørgsel venter" : "nye forespørgsler venter"} på dit svar.
            </div>
          )}
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
            {records.map((r) => (
              <RequestRow key={r.id} record={r} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function RequestRow({ record }: { record: BookingRequest }) {
  const eventLabel =
    EVENT_TYPES.find((e) => e.id === record.event.eventTypeId)?.label ?? "Event";
  const pricing = effectivePricing(record);
  const priceLabel = pricing
    ? formatCurrency(pricing.fullPriceMinor, record.djCurrency)
    : "På forespørgsel";
  const dateLabel = record.event.eventDate
    ? formatDate(record.event.eventDate)
    : "Dato ikke fastlagt";

  return (
    <li>
      <Link
        to={`/dj/requests/${record.id}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {eventLabel}
            <span className="font-normal text-muted-foreground">
              {" · "}
              {record.customerName ?? "Kunde"}
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            {dateLabel} · {priceLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              bookingStatusBadgeClass(record.status),
            )}
          >
            {djBookingStatusLabel(record.status)}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}
