import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferRequestStatusView } from "@/components/offer-request/OfferRequestStatusView";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useOfferRequestRecord } from "@/hooks/useOfferRequestRecord";
import { useAuth } from "@/hooks/useAuth";
import { recordIsVisibleTo } from "@/lib/offerRequestStore";

/**
 * Live progress page for a single offer request, embedded in the customer
 * dashboard chrome. Same view as the public /my-requests/:id page; only the
 * surrounding navigation differs.
 */
export function CustomerRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { record, loading, elapsedHours, remainingHours } =
    useOfferRequestRecord(requestId);
  const { profile } = useAuth();
  const customerId = profile?.role === "customer" ? profile.id : null;

  useDocumentHead({
    title: "Dine DJ-tilbud · DJConnect",
    description:
      "Følg dine matchede DJs og indkomne personlige tilbud — i ro og mag, i realtid.",
  });

  // Belt-and-braces guard: don't let a logged-in customer open someone
  // else's request via a guessed URL. Legacy un-tagged records remain
  // visible to everyone for continuity.
  if (record && !recordIsVisibleTo(record, customerId)) {
    return <Navigate to="/dashboard/requests" replace />;
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Indlæser din forespørgsel…</div>
    );
  }
  if (!record || !requestId) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Vi kunne ikke finde den forespørgsel
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Den er måske startet på en anden enhed. Du kan vende tilbage til din
          liste over forespørgsler eller sende en ny brief.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/requests">Mine forespørgsler</Link>
          </Button>
          <Button asChild>
            <Link to="/get-offers">Send en ny brief</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        to="/dashboard/requests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Alle forespørgsler
      </Link>
      <OfferRequestStatusView
        record={record}
        requestId={requestId}
        elapsedHours={elapsedHours}
        remainingHours={remainingHours}
      />
    </div>
  );
}
